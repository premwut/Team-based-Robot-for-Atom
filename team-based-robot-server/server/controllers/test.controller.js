/* eslint-disable no-unused-vars */
import Test, { Tests } from "../models/test.model"
import TestMapping, { TestMappings } from "../models/testMapping.model"
import Keyword, { Keywords } from "../models/keyword.model"
import Team from "../models/team.model"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import R, { flatten } from "ramda"
import { Users } from "../models/user.model"
import bookshelf from "../config/bookshelf"

export default class TestController extends BaseController {
  async create (req, res) {
    try {
      const { test_tc_no, test_passed, test_failed, test_file_link, test_result } = req.body
      const usr_id = req.currentUser.get(Fields.USR_ID)
      console.log("usr_id ===>", usr_id)
      const testData = {
        test_tc_no,
        test_passed,
        test_failed,
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

      const testMapCollection3 = test_result.reduce((acc, testcase, tcId) => {
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
        testMapCollection3.forEach(testMap => this.logTestMapping(testMap))
        const results = await testMapCollection3.invokeThen("save", null, {transacting: tx})
        console.log("results ===> ", results.length)
        return results
      })
      this.success(res, data)
    } catch (error) {
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
      const queryTest = q => q.where(Fields.USR_ID, "in", R.uniq(memberIds)).orderBy("created_at", "des")
      const tests = await (isPaging ? Tests.query(queryTest).fetchPage({ page, pageSize })
        : Tests.query(queryTest).fetchAll())
      this.success(res, { tests, ...getPagination(tests) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getTestcaseList (req, res) {
    // const fetchTestMapping = promiseTest.map(test => {
    //   const { test_id, test_tc_no } = test
    //   const tcIds = Array.from({length: test_tc_no}, (v, k) => k + 1)
    //   const testMappingCollection = tcIds
    //     .map(tcId => q => q.where({test_id, test_tc_id: tcIds}).orderBy("test_map_id", "asc"))
    //     .map((queryTestMap) => TestMappings.query(queryTestMap).fetch())
    //   testMappingCollection.map(x => console.log(x.toJSON()))
    //   test.testcases = testMappingCollection
    //   return test
    // })
  }

  convertToTestMapping (kwd, testId, tcId, testcase, name) {
    // console.log(`In convertTestMap tcId = ${tcId}`)
    let kwdId = null
    let kwdName = null
    const { tc_name, tc_passed } = testcase

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
