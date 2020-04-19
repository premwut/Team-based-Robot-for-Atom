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
    this.filePath = '/resources/local-team-based.robot'
    this.sharingDisplay = []
    this.localDisplay = []
    this.temp = []

  }


  update(props, children) {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    etch.update(this)
  }

  onKeywordClick (a) {
    console.log(this, 'from onKeywordClick()')
  }

  manageStoreKeyword (event, index) {
    const keyword = event.target
    console.log(index, 'keyword index')
  }

  mapKeywords () {
    console.log(this.localKeywords, 'local keywords')
    this.sharingDisplay = this.sharingKeywords.map((kwd, index) => {
      return  <li onClick={(event) => this.manageStoreKeyword(event, index)}> {kwd.kwd_name} </li>
    })
    this.temp = [ ...this.sharingDisplay ]
    this.sharingKeywords.map((kwd, index) => {
      const localNames = this.localKeywords.map(kwd => kwd.name)
      let isExist = false
      for (i = 0; i < localNames.length; i++) {
        if (localNames[i] === kwd.kwd_name) {
          this.sharingDisplay[index].isLocal = true

        }
        console.log(localNames[i], kwd.kwd_name, this.sharingDisplay[index].isLocal)
      }
    })

    console.log(this.temp, 'this.temp')
    this.sharingDisplay = this.temp.filter(el => el.isLocal !== true)
    this.localDisplay = this.temp.filter(el => el.isLocal === true)
    console.log(this.sharingDisplay, 'this.sharingDisplay')
    console.log(this.localDisplay, 'this.localDisplay')
  }

  render () {
    this.mapKeywords()
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
    this.sharingDisplay = []
    this.localDisplay = []
    this.update()
    if (!(this.panel.isVisible())) this.panel.show()
    else this.panel.hide()
  }

}
