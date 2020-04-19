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
    // this.mapKeywords()
  }

  initProps(props) {
    this.teambaseInstance = props.teambaseInstance
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = []
    this.filePath = '/resources/local-team-based.robot'
    this.sharingDisplay = []
    this.localDisplay = []
    this.localNames = []
    this.temp = []

  }


  async update(props, children) {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.localNames = this.localKeywords.map(kwd => kwd.name)
    await etch.update(this)
  }

  onKeywordClicked (index) {
    this.temp[index].isLocal = !(this.temp[index].isLocal)
    console.log(this.temp[index].children[1], 'this.temp[index]')
    // delete this.temp[index]

    // console.log(this.temp.map(el=>el.isLocal))

    // etch.update(this)
    this.update()
  }

  mapKeywords () {
    // console.log(this.localKeywords, 'local keywords')
    this.sharingDisplay = this.sharingKeywords.map((kwd, index) => {
      return  <button className="btn" onClick={((event) => {event.stopPropagation();this.onKeywordClicked(index)})}> {kwd.kwd_name} </button>
    })

    this.temp = [ ...this.sharingDisplay ]
    this.sharingKeywords.map((kwd, index) => {
      // const localNames = this.localKeywords.map(kwd => kwd.name)
      for (i = 0; i < this.localNames.length; i++) {
        if (this.localNames[i] === kwd.kwd_name) {
          this.sharingDisplay[index].isLocal = true

        }
        console.log(kwd.kwd_name, this.sharingDisplay[index].isLocal)
      }
    })

    console.log(this.temp, 'this.temp')
    this.temp.map(el => {
      if (el.isLocal !== true) {
        el.isLocal = false
      }
    })
    // this.sharingDisplay = this.temp.filter(el => el.isLocal !== true)
    // this.localDisplay = this.temp.filter(el => el.isLocal === true)
  }

  render () {
    // console.log(this.temp)
    // console.log(this.sharingDisplay)
    // console.log(this.localDisplay)

    // this.sharingDisplay = this.temp.filter(el => el.isLocal !== true)
    // this.localDisplay = this.temp.filter(el => el.isLocal === true)

    const sharingItems = <div> {this.sharingDisplay} </div>
    const localItems = <div> {this.localDisplay} </div>
    // const sharingItems = <div> kuy </div>
    return (
      <div>
        StoreView
        <div>
          <div>sharing</div>
            { this.sharingDisplay.map(el => <div>{el}</div>)}
        </div>
        <div>
          <div>local</div>
          { this.localDisplay.map(el => <div>{el}</div>)}
        </div>
      </div>
    )
  }

  show () {
    console.log(this)
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.localNames = this.localKeywords.map(kwd => kwd.name)
    this.sharingDisplay = []
    this.localDisplay = []
    this.update()
    this.mapKeywords()
    console.log(this.sharingDisplay)
    console.log(this.localDisplay)
    if (!(this.panel.isVisible())) this.panel.show()
    else this.panel.hide()
  }

}
