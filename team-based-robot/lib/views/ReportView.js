'use babel'
/** @jsx etch.dom */

import etch from 'etch'
import convertXML from 'xml-js'
import fs from 'fs'
import opn from 'opn'

import { PACKAGE_NAME, getRootDirPath } from '../utils.js'

export default class ReportView {
  constructor (props, children) {
    this.initProps(props)
    etch.initialize(this)
    this.panel = atom.workspace.addModalPanel({ item: this.element, visible: false })
  }

  initProps(props) {
    this.outputPath = atom.config.get(`${PACKAGE_NAME}.runnerOutputPath`)
    this.rootDir = getRootDirPath()
    if (fs.existsSync(`.${this.outputPath}`)) {
      var outputData = fs.readFileSync(`${getRootDirPath()}${this.outputPath}/output.xml`).toString()
    }
    if (outputData) this.outputData = JSON.parse(convertXML.xml2json(outputData, {compact: true, space: 4}))

  }

  openReportInBrowser() {
    let url = `${this.rootDir}${this.outputPath}/report.html`
    opn(url, { app: 'chrome' })
    .catch(error => {
      console.log("Open browser failure ", error)
    })
  }

  render() {
    let data
    if (this.outputData) data = this.outputData.robot
    let statItems = <h1>statItems</h1>
    let suiteItems = <div>test</div>

    if (data) {
      let suite
      (data.suite.suite) ? suite = data.suite.suite : suite = data.suite

      const stats = data.statistics
            totalStat = stats.total.stat
      statItems = totalStat.map(item => {
        const attributes = item._attributes
              text = item._text

        return (
          <div className="test-results">
            <div className="title"> {text} </div>
            <ul>
              <li>  <span className="text-success">Pass</span>: {attributes.pass}  </li>
              <li>  <span className="text-error">Fail</span>: {attributes.fail} </li>
            </ul>
          </div>
        )
      })

      if (!Array.isArray(suite)) suite = [ suite ]

      suiteItems = suite.map(item => {
        const attributes = item._attributes
        const {status} = item.status._attributes
        const statusClass = status === 'PASS' ? 'text-success' : 'text-error'

        let testcaseData = item.test
        let testcaseItems
        if (!Array.isArray(testcaseData)) testcaseData = [ testcaseData ]

        testcaseItems = testcaseData.map(item => {
          const attributes = item._attributes
                name = attributes.name
                tcStatus = item.status._attributes.status
                tcStatusClass = tcStatus === 'PASS' ? 'text-success' : 'text-error'
          return (
              <li> {name} - <span className={tcStatusClass}> {tcStatus} </span> </li>
          )
        })

        return (
          <div>
            <h3> {attributes.name} (Result: <span className={statusClass}>{status}</span>) </h3>
            <ul>
              {testcaseItems}
            </ul>
          </div>
        )
      })
    }

    // render return
    return (
      <div className="report-view">
        <header className="header-wrapper">
        <div className="pull-right">
          <span className="icon icon-x clickable" onClick={() => this.panel.hide()} />
        </div>
          <div className="title"> Report View </div>
          <span className="pull-right"><a onClick={this.openReportInBrowser}> View full report </a></span><br/>
        </header>

        <atom-panel className="test-results paddedy">
          <div> {statItems} </div>
          <div> {suiteItems} </div>
        </atom-panel>
      </div>
    )
  }

  show(props) {
    this.update(props)
    let outputData = fs.readFileSync(`${getRootDirPath()}${this.outputPath}/output.xml`).toString()
    this.outputData = JSON.parse(convertXML.xml2json(outputData, { compact: true, space: 4 }))
    return this.panel.isVisible() ? this.panel.hide() : this.panel.show()
  }

  update(props, children) {
    etch.update(this)
  }


}
