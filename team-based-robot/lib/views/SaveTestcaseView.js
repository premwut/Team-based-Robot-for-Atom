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
        <header>
          <span className="icon icon-x clickable" onClick={() => this.modalPanel.hide()} />
          <hr/>
        </header>
        <h1>SaveTestcaseView</h1>
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
