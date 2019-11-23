import Testcase, { Testcases } from "../models/testcase.model"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class TestcaseController extends BaseController {
  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const testcases = await (isPaging ? Testcase.forge().fetchPage({ page, pageSize }) : Testcase.forge().fetchAll())
      this.success(res, { testcases, ...getPagination(testcases) })
    } catch (error) {
      this.failure(req, error)
    }
  }

  async create (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { testcases, usr_id } = req.body
      const testcaseCollection = Testcases.forge({ usr_id })
      testcases.forEach(item => {
        const testcase = this.convertToKeyword(item)
        testcaseCollection.push(testcase)
      })

      const data = await bookshelf.transaction(async (tx) => {
        const processList = [testcaseCollection.invokeThen("save", null, {transacting: tx})]
        const [testcaseSavedList] = await Promise.all(processList)
        return { testcases: testcaseSavedList, usr_id: usr_id }
      })
      this.success(res, data)
    } catch (error) {
      this.failure(req, error)
    }
  }

  validateCreateRequest (req) {
    req.check("testcases.*.name", "name is required").notEmpty()
    req.check("testcases.*.result", "content is required").notEmpty()
    req.check("testcases.*.start", "run start is required").notEmpty()
    req.check("testcases.*.end", "run end is required").notEmpty()
    req.check("testcases.*.date", "run date is required").notEmpty()
    return req.validationErrors()
  }

  convertToKeyword (data) {
    if (!data) return undefined
    const {
      id: tc_id,
      name: tc_name,
      result: tc_run_result,
      start: tc_run_start,
      end: tc_run_end,
      date: tc_run_date,
    } = data
    return Testcase.forge({ tc_id, tc_name, tc_run_result, tc_run_start, tc_run_end, tc_run_date })
  }

  async delete (req, res) {
    try {
      const testcaseIdDeleteList = req.body.id_list
      const data = await bookshelf.transaction(async (tx) => {
        testcaseIdDeleteList.forEach(async (tc_id) => {
          await Testcase.forge({ tc_id }).desytoy({ transacting: tx })
        })
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }
}
