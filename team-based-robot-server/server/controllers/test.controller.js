import Test, { Tests } from "../models/test.model"
import TestMapping, { TestMappings } from "../models/testMapping.model"
import Keyword, { Keywords } from "../models/keyword.model"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import R from "ramda"
import { Users } from "../models/user.model"
import bookshelf from "../config/bookshelf"

export default class TestController extends BaseController {
    async create (req, res) {
        try {
            const { test_tc_no, test_passed, test_failed, test_file_link, test_result } = req.body
            const { usr_id } = req.currentUser
            const testMapCollection = TestMappings.forge()
            console.log("usr_id =", usr_id)
            const testData = {
                test_tc_no,
                test_passed,
                test_failed,
                test_file_link,
                usr_id,
            }
            const test = await Test.forge(testData).save()
            const testId = test.get(Fields.TEST_ID)

            const list = await test_result.map( async (testcase, tcId) => { 
                testcase.tc_id = tcId + 1
                const { tc_id, kwd_list } = testcase
                const keywordNames = R.uniq(kwd_list)
                const queryKeyword = q => q.where(Fields.KWD_NAME, "in", R.uniq(keywordNames))

                const keywords =  await Keywords.query(queryKeyword).fetch() //[require=true]
                // keywords.map((kwd) => console.log("kwd.length =", kwd.get(Fields.KWD_NAME)))

                await keywords.map( (kwd) => {
                    const testMapping = this.convertToTestMapping(kwd, testId, tc_id, testcase)
                    this.logTestMapping(testMapping)
                    testMapCollection.add(testMapping)
                })
            })
            const data = await bookshelf.transaction( async (tx) => {
                console.log("testMapColl =", testMapCollection)
                const process = [testMapCollection.invokeThen("save", null, {transacting: tx})]
                const [savedTestMapping] = await Promise.all(process)
                return savedTestMapping 
            })

            // const data = await bookshelf.transaction( async (tx) => {
            //     const savedTestMapping = await testMapCollection.invokeThen("save", null, {transacting: tx})
            //     return savedTestMapping 
            // })
            // const data = {}
          this.success(res, data)
        } catch (error) {
          this.failure(res, error)
        }
    }

    // async getList (req, res) {
    //     try {
    //         const { usr_id, team_id } = req.currentUser.toJSON()
    //         const { date } = req.query
    //         const date = new Date(date)
    //         console.log('Date =', date)
    //         const tests = await Test.forge()
    //     } catch (error) {
    //         this.failure(res, error)
    //     }
    // }

    // async saveTestMapping(tx, testCollection) {

    // }

    convertToTestMapping (kwd, testId, tcId, testcase) {
        // console.log(`In convertTestMap tcId = ${tcId}`)
        let kwdId = null
        let kwdName = null
        const { tc_name, tc_passed } = testcase
        if (kwd.get(Fields.KWD_NAME) != null) {
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

    logTestMapping(testMapping) {
        let tcId = testMapping.get(Fields.TEST_MAP_TC_ID)
        let tcName = testMapping.get(Fields.TEST_MAP_TC_NAME)
        let tcPassed = testMapping.get(Fields.TEST_MAP_TC_PASSED)
        let tcKwdId = testMapping.get(Fields.KWD_ID)
        let tcKwdName = testMapping.get(Fields.TEST_KWD_NAME)
        console.log(`testMapping => id:${tcId}, name:${tcName}, passed:${tcPassed}, kwdId:${tcKwdId}, kwdName:${tcKwdName}`)
    }
}