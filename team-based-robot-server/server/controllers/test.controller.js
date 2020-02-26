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
            const testData = {
                test_tc_no,
                test_passed,
                test_failed,
                test_file_link,
                usr_id,
            }
            const testMapCollection = TestMappings.forge(testData).save()
            .then(result => {
                const testMapCollection = TestMappings.forge()
                test_result.forEach(testcase, tcId => {
                    const testId = result.get(Fields.TEST_ID)
                    const { kwd_list } = testcase
                    const keywordNames = R.uniq(kwd_list)
                    const queryKeyword = q => q.where(Fields.KWD_NAME, "in", R.uniq(keywordNames))
                    const keywords = Keywords.query(queryKeyword).fetch([require=false])
                    keywords.forEach(kwd => {
                        const testMapping = this.convertToTestMappings(kwd, testId, tcId, testcase)
                        testMapCollection.push(testMapping)
                    })
                })
                const savedTestdMapping = await testMapCollection.invokeThen("save", null, {transacting: tx})
                return savedTestdMapping
            })
        } catch (error) {
            console.log(error)
        }
    }

    async getList (req, res) {
        try {
            const { usr_id, team_id } = req.currentUser.toJSON()
            const { date } = req.query
            const date = new Date(date)
            console.log('Date =', date)
            const tests = await Test.forge()
        } catch (error) {
            this.failure(res, error)
        }
    }

    async saveTestMapping(tx, testCollection) {

    }

    convertToTestMappings (kwd, testId, tcId, testcase) {
        const kwdId, kwdName = null
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
}