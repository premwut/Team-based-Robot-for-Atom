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
    this.keywordNames = []
    this.sharingNames = []
    this.localNames = []
    this.temp = []

  }


  async update(props, children) {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.localNames = this.localKeywords.map(kwd => kwd.name)
    await etch.update(this)
  }

  onKeywordClicked (index, type) {
    if (type === 'local') {
      this.sharingNames.push(this.localNames.splice(index, 1))
    } else if (type === 'sharing') {
      this.localNames.push(this.sharingNames.splice(index, 1))
    }
    etch.update(this)
  }

  mapKeywords () {
    this.localNames = this.localKeywords.map(kwd => kwd.name)
    console.log(this.localNames, 'this.localNames')
    this.sharingNames = this.keywordNames.filter(kwd => !this.localNames.includes(kwd))
    console.log(this.sharingNames, 'this.sharingNames')
  }

  render () {
    return (
      <div>
        StoreView
        <div>
          <div>sharing</div>
          <div>{this.sharingNames.map((name, index) => {
            return <button className="btn" onClick={() => this.onKeywordClicked(index, 'sharing')}> {name} </button>
          })}
          </div>

        </div>
        <div>
          <div>local</div>
          <div>
            {this.localNames.map((name, index) => {
              return <button className="btn" onClick={() => this.onKeywordClicked(index, 'local')}> {name} </button>
            })}
          </div>
        </div>
      </div>
    )
  }

  show () {
    console.log(this)
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.keywordNames = this.sharingKeywords.map(kwd => kwd.kwd_name)
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.mapKeywords()
    this.update()
    if (!(this.panel.isVisible())) this.panel.show()
    else this.panel.hide()
  }

}
