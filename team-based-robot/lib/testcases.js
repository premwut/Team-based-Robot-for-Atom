'use babel';

import { parseKeywordSelection, isRobot } from './autocomplete-robot/parse-robot'
import convertXML from 'xml-js'
import Connection from './connection.js'
import fs from 'fs-plus'

import { PACKAGE_NAME, getRootDirPath } from './utils.js'
// import { saveTestcaseRun } from './connection.js'

export const getTestResults = () => {
  let outputPath = atom.config.get(`${PACKAGE_NAME}.runnerOutputPath`)
  console.log(outputPath, outputPath)
  let outputXML = fs.readFileSync(`${getRootDirPath()}${outputPath}/output.xml`).toString()
  let outputJSON = JSON.parse(convertXML.xml2json(outputXML, { compact: true, space: 4 }))

  console.log(outputJSON)
  return outputJSON
}

export const saveTestcase = async (tbInstance) => {
  let testResults = getTestResults().robot
  const connection = tbInstance.connection
  const currentUser = await connection.getProfile()
  console.log(currentUser)
  testResults = (testResults.suite.suite) ? testResults.suite.suite : testResults.suite

  if (!Array.isArray(testResults)) {
    testResults = [ testResults ]
  }

  let outputData = []
  testResults.map(suite => {
    console.log(suite, 'suite')
    let testcases = (Array.isArray(suite.test)) ? suite.test : [ suite.test ]
    testcases.forEach(testcase => {
      let tcStatus = testcase.status._attributes
      let tcRunDate = tcStatus.starttime.split('')
      tcRunDate = [ [tcRunDate[0], tcRunDate[1], tcRunDate[2], tcRunDate[3]].join(''),
      [ tcRunDate[4], tcRunDate[5] ].join(''), [tcRunDate[6], tcRunDate[7]].join('') ].join('/')

      let input = {
        testcase: {
          tc_name: testcase._attributes.name,
          tc_is_passed: (tcStatus.status) === 'PASS' ? true : false,
          tc_start_run: tcStatus.starttime.split(' ')[1],
          tc_end_run: tcStatus.endtime.split(' ')[1],
          tc_run_date: tcRunDate,
        },
        usr_id: currentUser.usr_id
      }
      outputData.push(input)
    })

  })

  console.log(outputData)


  return outputData
}
