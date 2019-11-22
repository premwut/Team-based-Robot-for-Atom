'use babel'
/** @jsx etch.dom */

import etch from "etch"
import { TextEditor, TextBuffer, CompositeDisposable } from "atom"
import { SHARE_TYPE } from '../utils'
import { parseKeywordContent } from '../keywords'
import ShareKeywordView from "./ShareKeywordView"

export default class SaveKeywordView {

  constructor (props, teambaseInstance) {
    this.teambaseInstance = teambaseInstance
    this.connection = teambaseInstance.connection
    this.enableApplyAll = false
    this.initProps()
    etch.initialize(this)
    this.panel = atom.workspace.addModalPanel({ item: this.element, visible: false })
    this.bufferContent = this.refs.editorContent.buffer
    this.bufferDesc = this.refs.editorDesc.buffer
    this.bufferReview = this.refs.editorReview.buffer // editText buffer
    this.subscriptions = new CompositeDisposable()

    this.editorDescSubscription = this.refs.editorDesc.onDidChange(this.onEditorDescChange.bind(this))
    this.editorContentSubscription = this.refs.editorContent.onDidChange(this.onEditorContentChange.bind(this))
    this.editorReviewSubscription = this.refs.editorReview.onDidChange(this.onEditorReviewChange.bind(this)) // listen change on buffer then do the function

    // Set grammar to content editor
    const [robotGrammar] = atom.grammars.getGrammars().filter(x => x.name === "Robot Framework")
    if (robotGrammar) {
      this.refs.editorContent.setGrammar(robotGrammar)
    }
    this.refs.editorContent.element.setHeight(220)
    this.refs.editorReview.element.setHeight(110) // initialize review edittext height

    this.updateProps(props)
  }

  initProps() {
    this.keywords = []
    this.projects = []
    this.teams = []
    this.users = []
    this.keywordSelectedIndex = 0
    this.isLoading = false
    this.isVerified = false
    this.shareType = SHARE_TYPE.TEAM
  }

  updateProps(props) {
    console.log("updateProps(props) - this.keywords");
    console.log(this.keywords);
    this.keywords = !props.keywords ? [] : props.keywords.map(k => {
      return { ...k, id: undefined, desc: "" }
    })

    const [keyword] = this.keywords
    console.log("updateProps(props)");
    console.log(keyword);
    if (keyword) {
      this.onKeywordSelected(keyword, 0)
    }
  }

  initSubscriptions() {
    this.element.focus()
    this.subscriptions.add(atom.commands.add(this.element, {
      'team-based-robot:close-save-keyword-view': () => this.hide(),
      'core:close': () => this.hide(),
      'core:cancel': () => this.hide(),
    }))

    this.tooltipSubscriptions = new CompositeDisposable(
        atom.tooltips.add(this.refs.closeButton, {
          // title: 'Close <span class="keystroke">Esc</span>',
          // html: true,
          title: 'Close',
          class: 'tbr-tooltip',
          placement: 'bottom',
          keyBindingCommand: 'team-based-robot:close-save-keyword-view',
          keyBindingTarget: this.refs.saveKeywordView.element
        })
    )
  }

  async fetchSharing() {
    try {
      const [projects, teams, users] = await Promise.all([
        this.connection.getProjects(),
        this.connection.getTeams(),
        this.connection.getUsers()
      ])
      this.keywords = this.keywords.map(keyword => {
          return {
            ...keyword,
            shared: {
              applyAll: false,
              projects: projects.map(x => ({...x, checked: false})),
              teams: teams.map(x => ({...x, checked: x.isMyTeam })),
              users: users.map(x => ({...x, checked: false}))
            }
          }
      })
      console.log("[SaveView] Sharing info ", {...this.keywords});
      etch.update(this)
      return [projects, teams, users]
    } catch (e) {
      throw e
      console.error("[SaveView] Get sharing data failure", e)
    }
  }

  async verifyKeywordName() {
    try {
      if (this.keywords.length > 0) {
        const keywordNames = this.keywords.map(k => k.name)
        const [targetShare, { keywords }] = await Promise.all([
          this.fetchSharing(),
          this.connection.verifyKeywordName(keywordNames)
        ])

        // Update keyword
        console.log("verifyKeywordName() - this.keywords");
        console.log(keywords);
        console.log("this.keywords = ");
        console.log(this.keywords);
        this.keywords = this.keywords.map((keyword, index) => {
          const { kwd_id, kwd_desc, kwd_review, isExist, isOwner, shared: sharedServer } = keywords[index]
          const verifyChecked = (x, type, key) => {
            const checked = x.checked || sharedServer[type].includes(x[key])
            return {...x, checked }
          }
          const shared = keyword.shared
          if (isExist && kwd_id > 0) { // exist keyword from server
            keyword.id = kwd_id
            keyword.desc = kwd_desc
            keyword.review = kwd_review
            shared.projects = shared.projects.map(x => verifyChecked(x, "projects", "proj_id"))
            shared.teams = shared.teams.map(x => verifyChecked(x, "teams", "team_id"))
            shared.users = shared.users.map(x => verifyChecked(x, "users", "usr_id"))
          }
          return { ...keyword, isExist, isOwner, shared }
        }) // Here a fucked keywords
        this.isVerified = true

        this.onKeywordSelected(this.keywords[0], 0)
      } else {
        etch.update(this)
      }
    } catch (e) {
      console.error("[SaveView] Verify keyword name failure", e)
    }
  }

  async onApproveKeywordReviewClicked() {
    try {
      this.refs.editorReview.setText("")
      etch.update(this)
    } catch (e) {
      console.error("[SaveView] Approve keyword failure", e)
    }
  }

  async onSaveKeywordClicked() {
    try {
      const isChecked = x => x.checked
      const isAvaiable = x => !x.isExist || (x.isExist && x.isOwner)
      const avaiableKeywords = this.keywords.filter(isAvaiable)
      const applyAll = avaiableKeywords.find(k => k.shared.applyAll)
      const keywords = avaiableKeywords.map(keyword => {
        const shared = applyAll ? applyAll.shared : keyword.shared
        const { projectIds, teamIds, userIds } = {
          projectIds: shared.projects.filter(isChecked).map(x => x.proj_id),
          teamIds: shared.teams.filter(isChecked).map(x => x.team_id),
          userIds: shared.users.filter(isChecked).map(x => x.usr_id)
        }
        const keywordEditor = parseKeywordContent(keyword.original)
        console.log("keyword editor ", keywordEditor);
        console.log("kwEditor = " + keywordEditor.contentWithoutDoc)
        console.log("kw = " + keyword.contentWithoutDoc)
        console.log("keyword.review = " + keyword.review);
        return {
          id: keyword.id,
          name: keyword.name,
          content: keywordEditor.contentWithoutDoc || keyword.contentWithoutDoc,
          doc: keywordEditor.documentation || keyword.documentation || "",
          desc: keyword.desc,
          deprecate: false,
          review: keyword.review, // new
          isAprv: keyword.review === "", // new
          shared: { teamIds, projectIds, userIds }
        }
      })
      this.isLoading = true
      etch.update(this)
      console.log("keywords : ", keywords);
      await this.connection.saveKeywords({ keywords })
      atom.notifications.addSuccess("Save keyword complete")
      this.hide()
      this.teambaseInstance.reloadKeyword(true)
    } catch (e) {
      console.error("[SaveView] Save keyword failure", e)
      atom.notifications.addError("Save keyword failure")
    }
  }

  onKeywordSelected(keyword, index) {
    this.keywordSelectedIndex = index
    this.bufferContent.setText(keyword.original)
    this.bufferDesc.setText(keyword.desc)
    console.log(keyword);
    console.log("bufferDesc.setText(keyword.desc) = " + keyword.desc);
    console.log("keyword.review = " + keyword.review);
    console.log("Shit why error");
    this.bufferReview.setText(keyword.review || "")
    etch.update(this)
  }

  onShareSelectChanged(type, data) {
    const activeIndex = this.keywordSelectedIndex
    let { projects = [], teams = [], users = [] } = this.keywords[activeIndex].shared || {}
    switch (type) {
      case SHARE_TYPE.PROJECT: {
        projects = projects.map(x => {
          return x.proj_id === data.proj_id ? { ...data } : x
        })
        break
      }
      case SHARE_TYPE.TEAM: {
        teams = teams.map(x => {
          return x.team_id === data.team_id ? { ...data } : x
        })
        break
      }
      case SHARE_TYPE.USER: {
        users = users.map(x => {
          return x.usr_id === data.usr_id ? { ...data } : x
        })
        break
      }
    }
    if (this.keywords[activeIndex]) {
      this.keywords[activeIndex].shared = {
        projects,
        teams,
        users
      }
    }
    etch.update(this)
  }

  onShareTypeChanged(type) {
    this.shareType = type
  }

  onApplyToAllChanged(checked) {
    // Set ApplyAll to selected keyword
    const activeIndex = this.keywordSelectedIndex
    this.keywords.forEach((keyword, index) => {
      keyword.shared.applyAll = index === activeIndex && checked
    })

    // Apply share option to every keyword
    const applyAllIndex = this.keywords.findIndex(k => k.shared.applyAll)
    if (applyAllIndex >= 0) {
      const applyAllKeyword = this.keywords[applyAllIndex]
      const { projects, teams, users } = applyAllKeyword.shared
      console.log("onApplyToAllChanged1");
      console.log(this.keywords);
      this.keywords = this.keywords.map((keyword, index) => {
        let { shared } = keyword
        if (index !== applyAllIndex) { // set another keyword
          shared = { applyAll: false, projects, teams, users }
        }
        console.log("onApplyToAllChanged2");
        console.log(this.keywords);
        return {
          ...keyword,
          shared
        }
      })
    }
    etch.update(this)
  }

  onEditorContentChange() {
    const content = this.refs.editorContent.getText()
    const index = this.keywordSelectedIndex
    this.keywords[index].original = content
  }

  onEditorDescChange() {
    const desc = this.refs.editorDesc.getText()
    const index = this.keywordSelectedIndex
    this.keywords[index].desc = desc
  }

  // get new text from editText then assign into keywords array
  onEditorReviewChange() {
    const review = this.refs.editorReview.getText()
    const index = this.keywordSelectedIndex
    this.keywords[index].review = review
  }

  get isVisible() {
    return this.panel.isVisible()
  }

  get activeKeyword() {
    const shared = {
      applyAll: false,
      projects: [],
      teams: [],
      users: []
    }
    const emptyKeyword = { shared }
    const keyword = this.keywords[this.keywordSelectedIndex]
    return keyword ? { shared, ...keyword } : emptyKeyword
  }

  show(props) {
    const { keywords = [] } = props || {}
    if (keywords.length > 0) {
      this.updateProps(props)
      this.panel.show()
      atom.views.getView(atom.workspace).classList.add('save-keyword-visible')
      this.initSubscriptions()
      this.verifyKeywordName()
    } else {
      this.hide()
      atom.notifications.addError("Not found keyword")
    }
  }

  hide() {
    if (this.tooltipSubscriptions) {
      this.tooltipSubscriptions.dispose()
      this.tooltipSubscriptions = null
    }
    this.panel.hide()
    this.initProps()
    const $workspace = atom.views.getView(atom.workspace)
    $workspace.focus();
    $workspace.classList.remove('save-keyword-visible')
  }

  render () {
    const iconButton = this.isLoading ? 'spinner' : 'icon icon-cloud-upload'
    const buttonClasses = `btn btn-lg btn-info ${iconButton}`
    const buttonClassesAprv = `btn btn-lg btn-info`
    console.log("Before render")
    console.log(this.keywords);
    const keywordItems = this.keywords.map((keyword, i) => {
      const itemClass = `list-item ${ i === this.keywordSelectedIndex ? 'selected' : ''}`

      const addBtnClass = `icon ${keyword.isExist ? keyword.isOwner ? 'icon-pencil' : 'icon-x' : 'icon-check' }`
      let actionType = <div className="-verifying"><div className="spinner"/>Verifying</div>
      if (this.isVerified) {
        const type = keyword.isExist ? keyword.isOwner ? "update" : "duplicate" : "create"
        switch (type) {
          case "duplicate":
            actionType = <div className="-duplicate icon icon-x">Duplicated</div>
            break
          case "update":
            actionType = <div className="-update icon icon-pencil">Updateable</div>
            break
          default:
            actionType = <div className="-create icon icon-check">Saveable</div>
        }
      }
      return (
        <li key={i} className={itemClass} onClick={() => this.onKeywordSelected(keyword, i)}>
          <div className="title">
            <span>{ i+1 }.</span>
            { keyword.name }
          </div>
          <div className="actions">
            { actionType }
          </div>
        </li>
      )
    })

    let applyAllControl = ""
    if(this.enableApplyAll) {
      applyAllControl = (
        <div className="apply-all-block">
          <div className="checkbox">
            <label>
              <input className="input-checkbox" type="checkbox"
                onChange={(e) => this.onApplyToAllChanged(e.target.checked)}
                checked={this.activeKeyword.shared.applyAll}
              />
              <div className="title">Apply this options to other keywords</div>
            </label>
          </div>
        </div>
      )
    }
    return (
      <div ref="saveKeywordView" className="save-keyword-view">
        <header className="header-wrapper">
          <div ref="closeButton" className="close-button pull-right">
            <span className="icon icon-x clickable" onClick={() => this.hide()} />
          </div>
          <div className="title">Save Keywords to Server</div>
        </header>
        <div className="content-wrapper">
          <section className="keyword-block">
            <section className="keyword-list">
              <label>Keywords</label>
              <ol className="list-group">{ keywordItems }</ol>
            </section>
            <section className="keyword-detail">
              <div className="form-wrapper">
                <div className="input-block">
                  <label>Keyword Code</label>
                  <TextEditor ref="editorContent" autoHeight={false} placeholderText="Keyword Code" />
                </div>
                <div className="input-block">
                  <label>Keyword Description</label>
                  <TextEditor ref="editorDesc" mini={true} placeholderText="Keyword Description" />
                </div>
                <div className="input-block">
                  <label>Keyword Review</label>
                  <TextEditor ref="editorReview" autoHeight={false} placeholderText="Keyword Review" />
                </div>
              </div>

            </section>
            <div className="review-actions">
              <button className={buttonClassesAprv}
                onClick={() => this.onApproveKeywordReviewClicked()}>Approve Keyword</button>
            </div>
          </section>
          <section className="shared-block">
            <ShareKeywordView ref="shareView"
              type={this.shareType}
              shared={this.activeKeyword.shared}
              onTypeChange={(type) => this.onShareTypeChanged(type)}
              onSelectChange={(type, data) => this.onShareSelectChanged(type, data)}
            />
            { applyAllControl }
            <div className="keyword-actions">
              <button className={buttonClasses}
                onClick={() => this.onSaveKeywordClicked()}>Save Keywords</button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  update(props) {
    return etch.update(this)
  }

  destroy() {
    this.subscriptions && this.subscriptions.dispose()
    this.tooltipSubscriptions && this.tooltipSubscriptions.dispose()
    this.editorDescSubscription && this.editorDescSubscription.dispose()
    this.editorContentSubscription && this.editorContentSubscription.dispose()
    this.editorReviewSubscription && this.editorReviewSubscription.dispose()
    return etch.destroy(this)
  }
}
