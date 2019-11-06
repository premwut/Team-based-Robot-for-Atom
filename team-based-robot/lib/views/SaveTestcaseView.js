'use babel'
/** @jsx etch.dom*/

import etch from 'etch'
import { CompositeDisposable,TextEditor } from 'atom'

export default class SaveTestcaseView {
  constructor (props, tbInstance) {
    this.tbInstance = tbInstance
    this.connection = tbInstance.connection
    // this.wtf = true
    this.initProps()
    etch.initialize(this)
    // this.update(props, chireloldren)
    this.subscriptions = new CompositeDisposable()
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false
    })
    console.log(this.refs.saveEditor.getGrammar()['name'], 'saveEditor grammar')
  }

  initProps() {
    // this.testcases = this.tbInstance.testcases
    this.wtf = true
  }

  update (props, children) {
    return etch.update(this)
  }

  onClicked() {
    this.connection.getTestcases()
  }


  render() {
    console.log(this.testcases)
    return (
      <div ref="saveTestcaseView" className="save-testcase-view">
        <header className="header-wrapper">
          <div ref="closeButton" className="close-button pull-right">
            <span className="icon icon-x clickable" onClick={() => this.modalPanel.hide()} />
          </div>
          <div className="title">Save Testcase to Server</div>
        </header>

        <div className="content-wrapper">
          <h1> What the heck? </h1>
          <TextEditor ref="saveEditor"/>
          <button onClick={() => this.onClicked()}> get Testcases </button>
        </div>
      </div>
    )
  }

  show() {
    if (!this.modalPanel.isVisible()) {
      this.modalPanel.show()
      this.testcases = this.tbInstance.testcases
      console.log(this.testcases)
    } else {
      this.modalPanel.hide()
    }
  }

  destroy() {
    this.subscriptions && this.subscriptions.dispose()

  }
}
