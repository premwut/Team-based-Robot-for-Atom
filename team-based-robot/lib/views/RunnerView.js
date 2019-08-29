'use babel'
/** @jsx etch.dom */

import etch from "etch"
import path from "path"
import fs from "fs-plus"
import { TextEditor, CompositeDisposable, BufferedProcess } from "atom"
import { PACKAGE_NAME, RUN_TYPE, getRootDirPath } from '../utils'
import { isRobot } from '../autocomplete-robot/parse-robot'

export default class RunnerView {

  constructor (props, children) {
    this.initProps(props)
    etch.initialize(this)
    this.subscriptions = new CompositeDisposable()
    this.panel = atom.workspace.addModalPanel({ item: this.element, visible: false })
    this.runnerVariable = atom.config.get(`${PACKAGE_NAME}.runnerVariable`)
    this.runnerTestcasePath = atom.config.get(`${PACKAGE_NAME}.runnerTestcasePath`)
    this.runnerOutputPath = atom.config.get(`${PACKAGE_NAME}.runnerOutputPath`)
    this.refs.editorProcess.element.setHeight(300)
    this.updateProps(props, children)
  }

  initProps(props) {
    this.props = props
    this.isTestcasePathExist = true
    this.testcasePath = ""
    this.suiteFilePath = ""
    this.processOutput = ""
  }

  updateProps(props, children) {
    this.props = props
    this.children = children
    this.onRunning()
  }

  initSubscriptions() {
    this.subscriptions.add(atom.commands.add(this.element, {
      'core:confirm': () => this.onRunning(true),
      'core:cancel': () => this.hide()
    }))
  }

  render () {
    const runAllForm = (
      <div className="runner-form">
        <div className="input-block">
          <label>Testcase Path (For run robot script)</label>
          <TextEditor ref="editorTestcasePath" mini={true} placeholderText="Enter your testcase path" />
          <div ref="testcasePathError" className="error-wrapper" />
        </div>
      </div>
    )

    let currentForm = ""
    const isRunAll = this.props.type === RUN_TYPE.ALL
    const isRunTag = this.props.type === RUN_TYPE.TAG
    const noTestcasePath = !this.isTestcasePathExist
    if ((isRunAll || isRunTag) && noTestcasePath) {
      currentForm = runAllForm
    }

    return (
      <div className="runner-view">
        <header className="header-wrapper">
          <div className="pull-right">
            <span className="icon icon-x clickable" onClick={() => this.hide()} />
          </div>
          <div className="title">Robot Runner</div>
        </header>
        <div className="runner-content">
          { currentForm }
        </div>
        <div className="runner-process">
          <label>Results</label>
          <TextEditor ref="editorProcess" autoHeight={false} placeholderText="" />
        </div>
      </div>
    )
  }

  onRunning(isRetry = false) {
    const { type } = this.props
    switch (type) {
      case RUN_TYPE.SUITE:
        this.runSuiteTest()
        break;
      case RUN_TYPE.ALL:
      case RUN_TYPE.TAG:
        // Clear error
        if (this.refs.testcasePathError) {
          this.refs.testcasePathError.textContent = ""
          this.refs.testcasePathError.style.display = "none"
        }
        this.verifyTestCasePath(isRetry, type)
        break;
    }
  }

  verifyTestCasePath(isRetry = false, type) {
    let pathEditor = this.refs.editorTestcasePath
    const rootDirPath = getRootDirPath()
    const inputPath = pathEditor ? pathEditor.getText() : this.testcasePath
    const configTestcasePath = fs.normalize(`${rootDirPath}${this.runnerTestcasePath}`)
    const testcasePath = inputPath !== "" ? inputPath : configTestcasePath
    if (fs.existsSync(testcasePath)) {
      this.isTestcasePathExist = true
      this.testcasePath = testcasePath
      type === RUN_TYPE.ALL ? this.runCommand() : this.runWithTag()
    } else {
      this.isTestcasePathExist = false
      setTimeout(() => {
        this.refs.testcasePathError.textContent = `"${configTestcasePath}" isn't existed, Please enter new path`
        this.refs.testcasePathError.style.display = 'block'

        pathEditor = this.refs.editorTestcasePath
        pathEditor.setText(path.join(rootDirPath, ""))
        pathEditor.element.focus()

      }, 200)
    }
  }

  runSuiteTest() {
    this.suiteFilePath = ""
    const activeEditor = atom.workspace.getActiveTextEditor()
    console.log("activeEditor ", activeEditor);
    if (activeEditor) {
      const activeFile = activeEditor.getPath()
      const contentFile = activeEditor.getText()
      if (isRobot(contentFile)) {
        this.suiteFilePath = activeFile
        this.runCommand()
      } else {
        this.showNotifyError("This file isn't robot file")
      }
    } else {
      this.showNotifyError("Please open robot file")
    }
  }

  runWithTag() {
    this.tagSelected = ""
    // this.suiteFilePath = ""
    const activeEditor = atom.workspace.getActiveTextEditor()
    if (activeEditor) {
      // const contentDirFile = activeEditor.getDirectoryPath()
      const activeFile = activeEditor.getPath()
      const contentFile = activeEditor.getText()
      if (isRobot(contentFile)) {
        const selection = activeEditor.getSelectedText().trim()
        if (selection !== "") {
          this.tagSelected = selection
          // this.suiteFilePath = contentDirFile
          this.runCommand()
        } else {
          this.showNotifyError("This file isn't robot file")
        }
      } else {
        this.showNotifyError("This file isn't robot file")
      }
    } else {
      this.showNotifyError("Please open robot file")
    }
  }

  runCommand() {
    this.processOutput = ""
    const outputPath = fs.normalize(`${getRootDirPath()}${this.runnerOutputPath}`)
    const command = 'team-based-robot'
    const args = ["run"]
    switch (this.props.type) {
      case RUN_TYPE.ALL:
        args.push("-a")
        args.push(this.testcasePath)
        args.push(this.runnerVariable)
        args.push(outputPath)
        break
      case RUN_TYPE.SUITE:
        args.push("-s")
        args.push(this.suiteFilePath)
        args.push(this.runnerVariable)
        args.push(outputPath)
        break
      case RUN_TYPE.TAG:
        args.push("-t")
        args.push(this.testcasePath)
        args.push(this.runnerVariable)
        args.push(outputPath)
        args.push(this.tagSelected)
        break
    }

    const stderr = (output) => console.log(output)
    const stdout = (output) => {
      this.refs.editorProcess.element.focus()
      this.processOutput = `${this.processOutput}${output}`
      this.refs.editorProcess.setText(this.processOutput)
      const [cursor] = this.refs.editorProcess.cursors
      if (cursor) cursor.moveToBottom()
      this.refs.editorProcess.scrollToCursorPosition({ center: true })
    }
    const exit = (code) => {
      console.log("[Runner] exit witch ", code)
      if (code == 0) {
        this.processOutput = ""
        // this.refs.editorProcess.setText("")
        // this.hide()
      }
    }
    const process = new BufferedProcess({ command, args, stdout, stderr, exit })
  }

  showNotifyError(msg) {
    this.hide()
    atom.notifications.addError(msg)
  }

  show(props) {
    this.panel.show()
    atom.views.getView(atom.workspace).classList.add('runner-visible')
    this.initSubscriptions()
    this.update(props)
  }

  hide() {
    this.subscriptions && this.subscriptions.dispose()
    this.panel.hide()
    const $workspace = atom.views.getView(atom.workspace)
    $workspace.focus();
    $workspace.classList.remove('runner-visible')
  }

  update (props, children) {
    this.updateProps(props, children)
    return etch.update(this)
  }

  destroy() {
    return etch.destroy(this)
  }
}
