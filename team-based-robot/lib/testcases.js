'use babel';

import { parseKeywordSelection, isRobot } from './autocomplete-robot/parse-robot'
import convertXML from 'xml-js'
import Connection from './connection.js'
import fs from 'fs-plus'
import { zip } from 'zip-a-folder'
import moment from 'moment'

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
  const testOutput = mapTestOutput(testResults)
  console.log(testOutput)

  //Zip Target Directory
  const { usr_id, team_id } = tbInstance.user
  const timestamp = moment().format('YYYYmmddHHMMSS')
  const outputPath = atom.config.get(`${PACKAGE_NAME}.runnerOutputPath`)
  const zipDirTarget = `${getRootDirPath()}${outputPath}`
  const zipFileName = `${team_id}-${usr_id}-${timestamp}`
  const zipDirDest = `${getRootDirPath()}\\${zipFileName}.zip`
  console.log("zipFileName ===>", zipFileName)

  const mkFormPormise = () => {
    const testOutStr = JSON.stringify(testOutput)
    const formData = { my_files: fs.createReadStream(zipDirDest), json: testOutStr }
    return formData
  }
  const saveTestPromise = (formData) => {
    return new Promise(resolve => {
      connection.saveTestcaseRun(formData)
      resolve('executed result is saved!')
    })
  }
  const rmZipPromise = () => {
    return new Promise(resolve => {
      fs.removeSync(zipDirDest)
      resolve('zip file is removed!')
    })
  }

  try {
    const zipTest = await zip(zipDirTarget, zipDirDest)
    const formData = await mkFormPormise(testOutput)
    const savedTest = await saveTestPromise(formData)
    const rmZip = await rmZipPromise()
  } catch (e) {
    console.log(e)
  }

  // let result, error, finalResult = []
  // { result, error } = await to(zipTestPromise)
  // if (error) {
  //   console.log(error)
  //   return
  // }
  // finalResult = [...finalResult, ...result]
  //
  // { result, error } = await to(saveTestPromise)
  // if (error) {
  //   console.log(error)
  //   return
  // }
  // finalResult = [...finalResult, ...result]
  //
  // { result, error } = await to(rmZipPromise)
  // if (error) {
  //   console.log(error)
  //   return
  // }
  // finalResult = [...finalResult, ...result]
  // console.log(finalResult)

  // const test = await connection.getTestcase()
  // const testcaseData = test.data.testcases //fetched from database

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

  // const { data: response } = await connection.saveTestcaseRun(outputData)
  // const asdf = await connection.updateTestcases(editOutput)

  return testOutput
}

const mapTestOutput = testResults => {
  //Building output object for test history (New feature on web app)
  let output = {}
      testcaseList = []
  output.test_tc_no = null
  output.test_passed = testResults.statistics.total.stat[1]._attributes.pass
  output.test_failed = testResults.statistics.total.stat[1]._attributes.fail

  suites = (testResults.suite.suite) ? testResults.suite.suite : [ testResults.suite ]

  // testcases = (!Array.isArray(testResults.test)) ? [ testResults.test ] : testResults.test
  suites.map(suite => {
    const cases = toArray(suite.test)
    cases.map(tc => {
      testcaseList.push({
        tc_name: tc._attributes.name,
        tc_passed: (tc.status._attributes.status === "PASS") ? true : false,
        kwd_list: toArray(tc.kw).map(kw => {
          return kw._attributes.name
        })
      })
    })
  })

  output.test_result = testcaseList

  return output
}

//Deprecated
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

const toArray = obj => {
  return (!Array.isArray(obj)) ? [ obj ] : obj
}
