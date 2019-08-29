'use babel'
/** @jsx etch.dom */

import etch from "etch"
import path from "path"
import fs from "fs-plus"
import _ from "lodash"
import { TextEditor, TextBuffer, CompositeDisposable, BufferedProcess } from "atom"
import { PROJECT_TYPE, getHomeRepository } from '../utils'

export default class GenerateView {

  constructor (props, children) {
    this.initProps(props)
    etch.initialize(this)
    this.updateProps(props, children)
    this.subscriptions = new CompositeDisposable()
    this.panel = atom.workspace.addModalPanel({ item: this.element, visible: false })
  }

  initProps(props) {
    this.props = props
    this.props.type = PROJECT_TYPE.SIMPLE
    this.isLoading = false
  }

  updateProps(props, children) {
    this.props = props
    this.children = children
  }

  get isVisible() {
    return this.panel.isVisible()
  }

  show(props) {
    this.panel.show()
    this.setPathText('MyRobot')
    this.initSubscriptions()
    this.update(props)
  }

  hide() {
    this.isLoading = false
    this.refs.error && (this.refs.error.style.display = 'none')
    this.panel.hide()
  }

  render () {
    const isSimple = this.props.type === PROJECT_TYPE.SIMPLE
    const isLarge = this.props.type === PROJECT_TYPE.LARGE
    const loadingView = this.isLoading ? (
      <section className="loading-section spinner">
        <span>Generating project...</span>
      </section>
    ) : ""
    return (
      <div className="generate-view">
        <header className="header-wrapper">
          <div className="pull-right">
            <span className="icon icon-x clickable" onClick={() => this.hide()} />
          </div>
          <div className="title">Create Robot Project</div>
        </header>
        <div className="content-wrapper">
          <div className="input-block">
            <label>Project Type : </label>
            <label className="radio-item">
              <input type="radio"
                className="input-radio"
                name="projectType"
                onChange={() => this.onTypeClicked(PROJECT_TYPE.SIMPLE)}
                checked={isSimple}
                value={PROJECT_TYPE.SIMPLE}
              />
              <span>{PROJECT_TYPE.SIMPLE}</span>
            </label>
            <label className="radio-item">
              <input type="radio"
                className="input-radio"
                name="projectType"
                onChange={() => this.onTypeClicked(PROJECT_TYPE.LARGE)}
                checked={isLarge}
                value={PROJECT_TYPE.LARGE}
              />
              <span>{PROJECT_TYPE.LARGE}</span>
            </label>
          </div>

          <div className="input-block">
            <label>Project Path : </label>
            <TextEditor ref="projectEditor" mini={true} />
          </div>
        </div>
        <div ref="error" className="error-wrapper" />

        { loadingView }

      </div>
    )
  }

  initSubscriptions() {
    this.subscriptions.add(atom.commands.add(this.element, {
      'core:confirm': () => this.onCreateProject(),
      'core:cancel': () => this.hide()
    }))
  }

  onCreateProject() {
    if (this.validateProjectPath()) {
      this.isLoading = true
      etch.update(this)
      const { type } = this.props
      const createType = type === PROJECT_TYPE.LARGE ? "-l" : "-s"
      const command = 'team-based-robot'
      const targetPath = this.getProjectPath()
      const args = ["create", createType, targetPath]
      const stdout = (output) => console.log(output)
      const exit = (code) => {
        atom.open({ pathsToOpen: [targetPath], devMode: true })
        this.hide()
      }
      const process = new BufferedProcess({ command, args, stdout, exit })
    }
  }

  onTypeClicked(type) {
    this.props.type = type
    etch.update(this)
  }

  setPathText (placeholderName, rangeToSelect) {
    if (rangeToSelect == null) rangeToSelect = [0, placeholderName.length]
    const homeRepository = getHomeRepository()
    const projectEditor = this.refs.projectEditor
    projectEditor.setText(path.join(homeRepository, placeholderName))
    const pathLength = projectEditor.getText().length
    const endOfDirectoryIndex = pathLength - placeholderName.length
    projectEditor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]])
    projectEditor.element.focus()
  }

  getProjectPath () {
    const projectEditor = this.refs.projectEditor
    const packagePath = fs.normalize(projectEditor.getText().trim())
    const packageName = _.kebabCase(path.basename(packagePath))
    return path.join(path.dirname(packagePath), packageName)
  }

  validateProjectPath() {
    const projectPath = this.getProjectPath()
    if (fs.existsSync(projectPath)) {
      this.refs.error.textContent = `Path already exists at '${projectPath}'`
      this.refs.error.style.display = 'block'
      return false
    } else {
      return true
    }
  }

  update (props, children) {
    this.updateProps(props, children)
    return etch.update(this)
  }

  destroy() {
    if (this.subscriptions) this.subscriptions.dispose()
    return etch.destroy(this)
  }
}
