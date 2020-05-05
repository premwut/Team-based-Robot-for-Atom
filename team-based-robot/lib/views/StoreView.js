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
    this.filePath = atom.config.get('team-based-robot.localRobotPath')
    this.keywordNames = []
    this.sharingNames = []
    this.localNames = []

  }


  async update(props, children) {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.localNames = this.localKeywords.map(kwd => {
      return kwd.name.split('TB ').join('')
    })
    await etch.update(this)
  }

  onKeywordClicked (index, type) {
    if (type === 'local') {
      this.sharingNames.push(...this.localNames.splice(index, 1))
    } else if (type === 'sharing') {
      this.localNames.push(...this.sharingNames.splice(index, 1))
    }
    etch.update(this)
    console.log(this.sharingNames)
    console.log(this.localNames)
  }

  onSaveButtonClicked () {
    const savedKeywords = this.sharingKeywords.filter(kwd => {
      // console.log(this.localNames)
      // if (this.localNames.includes(kwd.kwd_name.split('TB ').join(''))) {
      console.log(this.localNames, kwd.kwd_name)
      if (this.localNames.includes(kwd.kwd_name)) {
        return kwd
      }
    })
    console.log(savedKeywords, 'saveKeywords')
    // let saveContentd
    const saveContent = this.teambaseInstance.transformKeywords(savedKeywords)
    fs.writeFileSync(`${getRootDirPath()}${this.filePath}`, saveContent)
    this.show()
    atom.notifications.addSuccess('Keywords saved')
  }

  mapKeywords () {
    this.localNames = this.localKeywords.map(kwd => kwd.name.split('TB ').join(''))
    console.log(this.localNames, 'this.localNames')
    this.sharingNames = this.keywordNames.filter(kwd => !this.localNames.includes(kwd))
    console.log(this.sharingNames, 'this.sharingNames')
  }

  render () {
    // console.log(this.sharingNames, 'this.sharingNames')
    // console.log(this.localNames, 'this.localNames')
    return (
      <div className="store-view">
        <div className="header-wrapper">
          <div className="title"> Add keyword to local store</div>
        </div>
        <div class="container">
          <div className="sharing-container">
            <h2>Global</h2>
            <atom-panel className="sharing-content">
              <div>
                {this.sharingNames.map((name, index) => {
                  return <button className="btn keyword-display" onClick={() => this.onKeywordClicked(index, 'sharing')}> {name} </button>
                })}
              </div>
            </atom-panel>
          </div>
            <div className="local-container">
            <h2>Local</h2>
              <atom-panel className="local-content">
                <div>
                  {this.localNames.map((name, index) => {
                    return <button className="btn keyword-display" onClick={() => this.onKeywordClicked(index, 'local')}> {name} </button>
                  })}
                </div>
              </atom-panel>
            </div>
        </div>
        <div className="save-button">
          <button className="btn btn-success btn-lg" onClick={this.onSaveButtonClicked}> Save </button>
        </div>
      </div>
    )
  }

  show () {
    this.sharingKeywords = this.teambaseInstance.sharingKeywords
    this.keywordNames = this.sharingKeywords.map(kwd => kwd.kwd_name)
    this.localKeywords = parseKeywordSelection(fs.readFileSync(`${getRootDirPath()}/${this.filePath}`).toString())
    this.mapKeywords()
    this.update()
    if (!(this.panel.isVisible())) this.panel.show()
    else this.panel.hide()
  }

}
