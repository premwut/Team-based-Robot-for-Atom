'use babel'
/** @jsx etch.dom */

import etch from 'etch'
import fs from 'fs'
import { PACKAGE_NAME, getRootDirPath } from '../utils.js'
import { parseKeywordSelection } from '../autocomplete-robot/parse-robot'

export default class StoreView {
  constructor (props) {
    this.initProps(props)
    etch.initialize(this)
    this.panel = atom.workspace.addModalPanel({ item: this.element , visible: false, autoFocus: true })
  }

  initProps(props) {
    this.teambaseInstance = props.teambaseInstance
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = []
    this.filePath = '/resources/local.robot'
    this.sharingDisplay = []
    this.localDisplay = []

  }


  update(props, children) {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.sharingDisplay = []
    this.localDisplay = []
    etch.update(this)
  }

  render () {
    console.log(this.localKeywords, 'local keywords')
    this.sharingDisplay = this.sharingKeywords.map(kwd => <li> {kwd.kwd_name} </li>)
    let temp2 = [ ...this.sharingDisplay ]
    let temp = [ ...this.sharingDisplay ]
    console.log(temp)
    this.sharingKeywords.map((kwd, index) => {
      const localNames = this.localKeywords.map(kwd => kwd.name)
      let isExist = false
      for (i = 0; i < localNames.length; i++) {
        if (localNames[i] === kwd.kwd_name) {
          this.localDisplay.push(this.sharingDisplay.splice(index, 1)[0])
          temp2[index] = undefined
          this.sharingDisplay = [ ...temp ]
        }
      }
    })
    console.log(temp)
    console.log(this.sharingDisplay, 'this.sharingDisplay')
    console.log(this.localDisplay, 'this.localDisplay')
    this.sharingDisplay = temp2
    this.sharingDisplay = temp2.filter(el => typeof(el) !== 'undefined')
    this.localDisplay = this.localDisplay.filter(el => typeof(el) !== 'undefined')

    const sharingItems = <div> {this.sharingDisplay} </div>
    const localItems = <div> {this.localDisplay} </div>
    // const sharingItems = <div> kuy </div>
    return (
      <div>
        StoreView
        <div>sharing
            { sharingItems }
        </div>
        <div>
          local
          { localItems }
        </div>
      </div>
    )
  }

  show () {
    this.update()
    if (!(this.panel.isVisible())) this.panel.show()
    else this.panel.hide()
  }

}
