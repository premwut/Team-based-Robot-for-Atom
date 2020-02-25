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
                usr_id,
                test_tc_no,
                test_failed,
                test_file_link
            }
            const testMapCollection = TestMappings.forge(testData).save()
            .then(result => {
                const testMapCollection = TestMappings.forge()
                test_result.forEach(kwd, index => {
                    const { tc_name, tc_passed, kwd_list } = element
                    const test = await this.convertToTest(index, element)  
                });
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

    convertToTest (index, data) {
        if (!data) return undefined
        const {
            tc_name,
            tc_passed,
            kwd_list
        } = data
        return Test
    }
}