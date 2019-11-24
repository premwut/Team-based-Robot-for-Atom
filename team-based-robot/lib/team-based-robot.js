'use babel'

import fs from "fs-plus"
import opn from "opn"
import { CompositeDisposable } from 'atom'
import { saveKeyword, searchKeyword } from './keywords'
import { updateTeamBaseMenu } from './menu'
import {
  isTeamBaseProject,
  getTeamBaseRobotFilePath,
  PROJECT_TYPE, PACKAGE_NAME, RUN_TYPE
} from './utils'
import Connection from './connection'
import SaveKeywordView from './views/SaveKeywordView'
import SearchKeywordView from "./views/SearchKeywordView"
import GenerateView from './views/GenerateView'
import RunnerView from './views/RunnerView'
import ReportView from './views/ReportView'

export default class TeamBasedRobot {

  constructor(state, autocomplete) {
    this.state = state
    this.LoggedIn = false
    this.user = undefined
    this.features = []
    this.sharingKeywords = []
    this.views = {}
    this.autocomplete = autocomplete
    this.connectionConfig = { endpoint: state.endpoint, username: state.username, password: state.password }
    this.connection = new Connection(this.connectionConfig)
    this.socket = this.connection.socket
  }

  initialize() {
    this.views = {
      saveKeywordView: new SaveKeywordView({}, this),
      searchKeywordView: new SearchKeywordView({}, this),
      generateView: new GenerateView({}),
      runnerView: new RunnerView({}),
      reportView: new ReportView({})
    }

    this.socket.on('sendNotification', (data) => {
      console.table(data)
      const {id, message} = data
      // console.table({id: id, socketId: this.socket.id})
      const isNotSaver = id !== this.socket.id
      if (isNotSaver) {
        atom.notifications.addInfo(data.message)
        this.reloadKeyword(true)
      }
    })

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'team-based-robot:toggle': () => this.toggle(),
      'team-based-robot:new-project-simple': () => this.views.generateView.show({ type: PROJECT_TYPE.SIMPLE }),
      'team-based-robot:new-project-large': () => this.views.generateView.show({ type: PROJECT_TYPE.LARGE }),
      'team-based-robot:keyword-reload': () => this.reloadKeyword(true),
      'team-based-robot:test-connection': () => this.testConnection(),
      'team-based-robot:keyword-add': () => saveKeyword(this.views.saveKeywordView),
      'team-based-robot:keyword-search': () => searchKeyword(this.views.searchKeywordView),
      'team-based-robot:run-all': () => this.views.runnerView.show({ type: RUN_TYPE.ALL, teambaseInstance: this }),
      'team-based-robot:run-suite': () => this.views.runnerView.show({ type: RUN_TYPE.SUITE, teambaseInstance: this }),
      'team-based-robot:run-tag': () => this.views.runnerView.show({ type: RUN_TYPE.TAG, teambaseInstance: this }),
      'team-based-robot:run-failed': () => this.views.runnerView.show({ type: RUN_TYPE.SUITE, isRerunfailed: true, teambaseInstance: this}),
      'team-based-robot:manage-member': () => this.openBrowserManageTeamMember(),
      'team-based-robot:assign-team': () => this.openBrowserAssignTeamToProject(),
      'team-based-robot:show-report': () => this.views.reportView.show()
     }));

    this.autocomplete.load()
    this.verifyConfigChanged()
    if (this.state.username != "" && this.state.password != "") {
      setTimeout(this.reloadKeyword.bind(this), 2e3)
    } else {
      atom.notifications.addWarning("Please setting your account")
    }
  }

  verifyConfigChanged() {
    atom.config.onDidChange(PACKAGE_NAME, ({ newValue, oldValue }) => {
      const { username: oldUsername, password: oldPassword } = this.state
      const { username, password } = newValue
      if (username != "" && password != "" && username != oldUsername && password != oldPassword) {
        setTimeout(async() => {
          await this.authenticate({ username, password })
          if (this.LoggedIn) {
            this.state.username = username
            this.state.password = password
            const config = { ...this.connectionConfig, username, password }
            this.connection.updateConfig(config)
            this.LoggedIn = false // for authenticate again
            this.reloadKeyword(true)
          } else {
            this.connection.clearToken()
          }
        }, 2e3)
      }
    })
  }

  async reloadKeyword(isGenerateRobotFile = false) {
    const isTeamBase = isTeamBaseProject()
    if (isTeamBase || isGenerateRobotFile) {
      // sync keyword to robot file
      const workspaceView = atom.views.getView(atom.workspace)
      if (!workspaceView.className.includes(PACKAGE_NAME)) {
        workspaceView.classList.add(PACKAGE_NAME)
      }
      await this.syncKeywordsToTeamBaseRobotFile()
    }
  }

  async authenticate(authen) {
    try {
      const currentUser = await this.connection.login(authen)
      if (currentUser) {
        this.user = currentUser
        const features = await this.connection.getFeatures()
        updateTeamBaseMenu(features)
        this.LoggedIn = true
      }
    } catch (e) {
      this.LoggedIn = false
      console.log("Authenticate & Get features failure")
    }
  }

  async syncKeywordsToTeamBaseRobotFile() {
    if (!this.LoggedIn) {
      await this.authenticate()
    }

    try {
      const keywords = await this.connection.getKeywords()
      const robotFilePath = getTeamBaseRobotFilePath()
      const content = this.transformKeywords(keywords)
      this.sharingKeywords = [...keywords]
      fs.writeFileSync(robotFilePath, content)
      console.log("[TeamBaseRobot] Sync keyword to robot file completed")
      this.autocomplete.reload()
      atom.notifications.addSuccess("Sync keyword completed")
    } catch (e) {
      console.error("[TeamBaseRobot] Sync keyword failure ", e)
      atom.notifications.addError("Sync keyword failure")
    }
  }

  transformKeywords(keywords) {
    const PREFIX_KEYWORD = "TB"
    let content = "*** Keywords ***"
    keywords.forEach(k => {
      let kName = `${k.kwd_name}`
      kName = kName.includes(`${PREFIX_KEYWORD} `) ? kName : `${PREFIX_KEYWORD} ${kName}`
      const kContent = k.kwd_doc === "" ? `${k.kwd_content}` : `\n\t[Documentation]\t${k.kwd_doc}${k.kwd_content}`
      content = content + `\n${kName}${kContent}\n`
    })
    return content
  }

  async testConnection() {
    console.log("In tesConnection()", 123)
    try {
      await this.connection.login()
      atom.notifications.addSuccess("Server ready to use")
    } catch (e) {
      atom.notifications.addError("Can't connect to server")
    }
  }

  async openBrowserManageTeamMember() {
    if (!this.LoggedIn) {
      await this.authenticate()
    }

    const { endpoint: websiteUrl } = this.connectionConfig
    const token = this.connection.token
    const type = "manage-team-member"
    const url = `${websiteUrl}/authenticate?token=${token}&type=${type}`
    console.log("Open url ", url)
    opn(url, { app: 'chrome' })
    .catch(error => {
      console.log("Open browser failure ", error)
    })
  }

  async openBrowserAssignTeamToProject() {
    if (!this.LoggedIn) {
      await this.authenticate()
    }

    const { endpoint: websiteUrl } = this.connectionConfig
    const token = this.connection.token
    const type = "assign-team-to-project"
    const url = `${websiteUrl}/authenticate?token=${token}&type=${type}`
    console.log("Open url ", url)
    opn(url, { app: 'chrome' })
    .catch(error => {
      console.log("Open browser failure ", error)
    })
  }

  toggle() {
    // const view = this.views.addKeywordView
    // view.isVisible ? view.hide() : view.show()

    // const atomPackageDir = getAtomPackagesDirectory()
    // console.log("atom packages dir ", atomPackageDir);
  }
}
