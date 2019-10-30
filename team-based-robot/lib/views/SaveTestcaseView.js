'use babel'
/** @jsx etch.dom*/

import etch from 'etch'
import { CompositeDisposable } from 'atom'

export default class {
  constructor (props, children) {
    etch.initialize(this)
    this.update(props, children)
    this.subscriptions = new CompositeDisposable()
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false
    })
  }

  update (props, children) {
    return etch.update(this)
  }

  render() {
    return (
      <div>
        <header className="header-wrapper">
          <div ref="closeButton" className="close-button pull-right">
            <span className="icon icon-x clickable" onClick={() => this.modalPanel.hide()} />
          </div>

          <div className="content-wrapper">
            <h1> What the heck? </h1>
          </div>
        </header>
        <div className="title">SaveTestcaseView</div>
      </div>
    )
  }

  show() {
    if (!this.modalPanel.isVisible()) {
      this.modalPanel.show()
    } else {
      this.modalPanel.hide()
    }
  }
}
