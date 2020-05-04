/* eslint-disable no-unused-vars */
import Test, { Tests } from "../models/test.model"
import TestMapping, { TestMappings } from "../models/testMapping.model"
import Keyword, { Keywords } from "../models/keyword.model"
import Team from "../models/team.model"
import { getPagination, isPagination } from "../utilities/utils"
import GoogleStorage from "../utilities/GoogleStorage"
import { config } from "../config/cloud-storage"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import R, { flatten } from "ramda"
import { Users } from "../models/user.model"
import bookshelf from "../config/bookshelf"
import fs from "fs-extra"

export default class TestController extends BaseController {
  async create (req, res) {
    try {
      const { files } = req
      // console.log("files ===>", files)
      const { bucketName } = config
      const googleStorage = new GoogleStorage(bucketName)
      let promises = []
      files.forEach(file => {
        promises.push(googleStorage.uploadFileToGoogleStoragePromise(file))
      })
      const uploadFiles = await Promise.all(promises)

      const json = JSON.parse(req.body.json)
      // console.log("json type ===>", json, typeof json)
      const {
        test_tc_no,
        test_passed,
        test_failed,
        test_starttime,
        test_endtime,
        test_elapsed,
        test_result,
      } = json
      const usr_id = req.currentUser.get(Fields.USR_ID)
      // console.log("uploadFiles ==>", uploadFiles)

      // concat googlePubLink
      const concatUrlReducer = (acc, { file }) => {
        fs.removeSync(file.path)
        return acc.concat(" ", file.cloudStoragePublicUrl)
      }
      const test_file_link = uploadFiles.reduce(concatUrlReducer, "").trim()
      const testData = {
        test_tc_no,
        test_passed,
        test_failed,
        test_starttime,
        test_endtime,
        test_elapsed,
        test_file_link,
        usr_id,
      }

      const test = await Test.forge(testData).save()
      const testId = test.get(Fields.TEST_ID)

      // Lab by P'Golf Yossapol
      const promiseKeywords = test_result
        .map(({kwd_list}) => R.uniq(kwd_list))
        .map(keywordName => q => q.where(Fields.KWD_NAME, "in", R.uniq(keywordName)))
        .map((queryKeyword) => Keywords.query(queryKeyword).fetch({require: false}))

      const fetchKeywords = await Promise.all(promiseKeywords)

      const fetchKeywordMapping = fetchKeywords.reduce((acc, fetchKeyword) => {
        fetchKeyword.forEach(kwd => {
          const kwdName = kwd.get(Fields.KWD_NAME)

          if (!R.isNil(kwdName)) {
            acc[kwdName] = kwd
          }
        })
        return acc
      }, {})

      const testMapCollection = test_result.reduce((acc, testcase, tcId) => {
        testcase.tc_id = tcId + 1
        const { tc_id, kwd_list } = testcase
        const keywordNames = R.uniq(kwd_list)

        const testMap = R.flatten(keywordNames.map((kwdName) => {
          const kwd = fetchKeywordMapping[kwdName]
          return this.convertToTestMapping(kwd, testId, tc_id, testcase, kwdName)
        }))

        return acc.push(testMap)
      }, TestMappings.forge())

      const data = await bookshelf.transaction(async (tx) => {
        testMapCollection.forEach(testMap => this.logTestMapping(testMap))
        const results = await testMapCollection.invokeThen("save", null, {transacting: tx})
        console.log("saved bookshelf results ===> ", results.length)
        return results
      })
      this.success(res, { ...data, "upload_result": uploadFiles })
    } catch (error) {
      console.log(error) 
      this.failure(res, error)
    }
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { date, page, limit: pageSize } = req.query
      const { usr_id, team_id } = req.currentUser.toJSON()
      const created_at = new Date(date)
      console.log(`Date = ${created_at}, usr_id = ${usr_id}. team_id = ${team_id}`)
      const teamMembers = await Team.forge({ team_id }).fetch({ withRelated: ["members"] }) ||
      await Team.forge().orderBy(Fields.TEAM_ID).fetchAll() || []
      const { members } = teamMembers.toJSON()
      const memberIds = members.map(member => member.usr_id)
      const queryTest = q => q.where(Fields.USR_ID, "in", R.uniq(memberIds)).orderBy("created_at", "desc")
      const tests = await (isPaging ? Tests.query(queryTest).fetchPage({ page, pageSize })
        : Tests.query(queryTest).fetchAll())
      this.success(res, { tests, ...getPagination(tests) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getTestcases (req, res) {
    try {
      console.log("[Controller] Hello, I'm in getTestcases")
      const { id: test_id } = req.params
      const { page, limit: pageSize } = req.query
      console.log("test_id ===>", test_id)
      const test = await Test.forge({test_id}).fetch()
      const test_tc_no = test.get(Fields.TEST_TC_NO)
      const tcIds = Array.apply(null, Array(test_tc_no)).map((x, idx) => idx + 1)
      const testMappingList = tcIds
        .map(tcId => q => q.where({ test_id: test_id }).orderBy("test_map_id", "asc"))
        .map((queryTestMap) => TestMappings.query(queryTestMap).fetch())

      const [testcases] = await Promise.all(testMappingList)
      const data = { testcases }
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  convertToTestMapping (kwd, testId, tcId, testcase, name) {
    // console.log(`In convertTestMap tcId = ${tcId}`)
    let kwdId = null
    let kwdName = null
    const { tc_name, tc_passed, tc_starttime, tc_endtime, tc_elapsed } = testcase

    if (R.isNil(kwd)) {
      kwdName = name
    } else if (kwd.get(Fields.KWD_NAME) != null) {
      kwdName = kwd.get(Fields.KWD_NAME)
      kwdId = kwd.get(Fields.KWD_ID)
    }
    return TestMapping.forge({
      kwd_id: kwdId,
      test_id: testId,
      test_map_tc_id: tcId,
      test_map_tc_name: tc_name,
      test_map_tc_passed: tc_passed,
      test_map_tc_starttime: tc_starttime,
      test_map_tc_endtime: tc_endtime,
      test_map_tc_elapsed: tc_elapsed,
      test_kwd_name: kwdName,
    })
  }

  logTestMapping (testMapping) {
    let tcId = testMapping.get(Fields.TEST_MAP_TC_ID)
    let tcName = testMapping.get(Fields.TEST_MAP_TC_NAME)
    let tcPassed = testMapping.get(Fields.TEST_MAP_TC_PASSED)
    let tcKwdId = testMapping.get(Fields.KWD_ID)
    let tcKwdName = testMapping.get(Fields.TEST_KWD_NAME)

    console.log(`testMapping => id:${tcId}, name:${tcName}, passed:${tcPassed}, kwdId:${tcKwdId}, kwdName:${tcKwdName}`)
  }
}
