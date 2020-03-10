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
  let outputXML
  try {
    outputXML = fs.readFileSync(`${getRootDirPath()}${outputPath}/output.xml`).toString()
  } catch (e) {
    return undefined
  }
  let outputJSON = JSON.parse(convertXML.xml2json(outputXML, { compact: true, space: 4 }))

  return outputJSON
}

export const saveTestcase = async (tbInstance) => {
  let testResults = getTestResults().robot
  const connection = tbInstance.connection
  const currentUser = await connection.getProfile()
  console.log(testResults)

  //Building output object for test history (New feature on web app)
  let something = {}
      testcaseList = []
  something.test_tc_no = null
  something.test_passed = testResults.statistics.total.stat[1]._attributes.pass
  something.test_failed = testResults.statistics.total.stat[1]._attributes.fail

  suites = (testResults.suite.suite) ? testResults.suite.suite : [ testResults.suite ]
  console.log(testResults)
  // testcases = (!Array.isArray(testResults.test)) ? [ testResults.test ] : testResults.test
  suites.map(suite => {
    const cases = (!Array.isArray(suite.test)) ? [ suite.test ] : suite.test
    // testcaseList.push({
    //   tc_name: _attributes.name,
    //   tc_passed: status._attributes.status
    // })
    cases.map(tc => {
      console.log(tc, 'tc')
      testcaseList.push({
        tc_name: tc._attributes.name,
        tc_passed: tc.status._attributes.status,
        // kwd_list: tc.kw
      })
    })
  })
  console.log(testcaseList, 'testcaseList')
  // something.test_result = testcaseList
  //
  // console.log(something, 'something')

  // const test = await connection.getTestcase()
  // const testcaseData = test.data.testcases //fetched from database


  if (!Array.isArray(testResults)) {
    testResults = [ testResults ]
  }

  // let { saveList, editList } = mapTestcases(testResults, testcaseData)
  // let { saveList } = mapTestcases(testResults, testcaseData)

  // let resultTestcase = []
  //     saveList = []
  //     editList = []
  // testResults.map(suite => {
  //   let { test } = suite
  //   if (!Array.isArray(test)) test = [ test ]
  //   test.map(testcase => resultTestcase.push(testcase))
  // })
  // console.log(resultTestcase)
  // resultTestcase.map(result => {
  //   let resultName = result._attributes.name
  //   let isDuplicated = false
  //   testcaseData.map(data => {
  //     let dataName = data.tc_name
  //     if (dataName === resultName) {
  //       isDuplicated = true
  //     }
  //   })
  //
  //   if (isDuplicated) {
  //     editList.push(result)
  //   } else {
  //     saveList.push(result)
  //   }
  // })

  // console.log(testResults, 'testResults')
  // console.log(testcaseData, 'testcaseData')
  // console.log(saveList, 'saveList')
  // console.log(editList, 'editList')

  let outputData = { testcases: [], usr_id: currentUser.usr_id }
  // saveList = saveList.map(testcase => {
  //   let tcStatus = testcase.status._attributes
  //   let tcRunDate = tcStatus.starttime.split('')
  //   tcRunDate = [ [tcRunDate[0], tcRunDate[1], tcRunDate[2], tcRunDate[3]].join(''),
  //   [ tcRunDate[4], tcRunDate[5] ].join(''), [tcRunDate[6], tcRunDate[7]].join('') ].join('/')
  //
  //       let input = {
  //           name: testcase._attributes.name,
  //           result: (tcStatus.status) === 'PASS' ? true : false,
  //           start: tcStatus.starttime.split(' ')[1],
  //           end: tcStatus.endtime.split(' ')[1],
  //           date: tcRunDate,
  //       }
  //       outputData.testcases.push(input)
  // })

  //
  // let editOutput = { testcases: [], usr_id: currentUser.usr_id }
  // editList = editList.map(testcase => {
  //   let tcStatus = testcase.status._attributes
  //   let tcRunDate = tcStatus.starttime.split('')
  //   tcRunDate = [ [tcRunDate[0], tcRunDate[1], tcRunDate[2], tcRunDate[3]].join(''),
  //   [ tcRunDate[4], tcRunDate[5] ].join(''), [tcRunDate[6], tcRunDate[7]].join('') ].join('/')
  //
  //       let input = {
  //           name: testcase._attributes.name,
  //           result: (tcStatus.status) === 'PASS' ? true : false,
  //           start: tcStatus.starttime.split(' ')[1],
  //           end: tcStatus.endtime.split(' ')[1],
  //           date: tcRunDate,
  //           id: testcase.tc_id
  //       }
  //       editOutput.testcases.push(input)
  // })

  console.log(outputData)


  // const { data: response } = await connection.saveTestcaseRun(outputData)
  // const asdf = await connection.updateTestcases(editOutput)

  return outputData
}

const mapTestcases = function (testResults, testcaseData) {
  let resultTestcase = []
      saveList = []
      editList = []
  testResults.map(suite => {
    let { test } = suite
    if (!Array.isArray(test)) test = [ test ]
    test.map(testcase => resultTestcase.push(testcase))
  })
  console.log(resultTestcase)
  resultTestcase.map(result => {
    let resultName = result._attributes.name
    let isDuplicated = false
    testcaseData.map(data => {
      let dataName = data.tc_name
      if (dataName === resultName) {
        isDuplicated = true
        result.tc_id = data.tc_id
      }
    })

    if (isDuplicated) {
      editList.push(result)
    } else {
      saveList.push(result)
    }
  })

  return { saveList, editList }
}
