'use babel'
/** @jsx etch.dom */

import etch from 'etch'

export default class StoreView {
  constructor (props) {
    this.teambaseInstance = props.teambaseInstance
    this.props = props
    etch.initialize(this)
    this.panel = atom.workspace.addModalPanel({ item: this.element , visible: false, autoFocus: true })

  }

  update(props, children) {
    etch.update(this)
  }

  render () {
    return (
      <div> StoreView </div>
    )
  }

  show () {
    // console.log(this.panel)
    (!(this.panel.isVisible())) ? this.panel.show() : this.panel.hide()
  }

}
