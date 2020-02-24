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
            const
        } catch (error) {
            
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
}