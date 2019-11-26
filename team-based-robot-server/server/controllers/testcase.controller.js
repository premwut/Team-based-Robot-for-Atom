import Testcase, { Testcases } from "../models/testcase.model"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class TestcaseController extends BaseController {
  async getList (req, res) {
    try {
      console.log("Here!, I'm in testcase controller get fn")
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const testcases = await (isPaging ? Testcase.forge().fetchPage({ page, pageSize }) : Testcase.forge().fetchAll())
      this.success(res, { testcases, ...getPagination(testcases) })
      // const testcaseC = await Testcase.forge().fetchAll()
      // this.success(res, testcaseC)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      console.log("Here!, I'm in testcase controller create fn")
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      console.log(JSON.stringify(req.body))
      const { testcases, usr_id } = req.body
      const testcaseCollection = Testcases.forge()
      console.log("testcasea = ")
      console.log(testcases)
      console.log("usr_id")
      console.log(usr_id)
      testcases.forEach(item => {
        const testcase = this.convertToTestcase(item, usr_id)
        testcaseCollection.push(testcase)
      })
      const data = await bookshelf.transaction(async (tx) => {
        const processList = [testcaseCollection.invokeThen("save", null, {transacting: tx})]
        const [testcaseSavedList] = await Promise.all(processList)
        return {testcaseSavedList}
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
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

  convertToTestcase (data, usr_id) {
    if (!data) return undefined
    const {
      id: tc_id,
      name: tc_name,
      result: tc_run_result,
      start: tc_run_start,
      end: tc_run_end,
      date: tc_run_date,
    } = data
    if (tc_id === undefined) {
      console.log("tc_id =", tc_id)
      return Testcase.forge({ tc_name, tc_run_result, tc_run_start, tc_run_end, tc_run_date, usr_id })
    } else {
      console.log("tc_id =", tc_id)
      return Testcase.forge({ tc_id, tc_name, tc_run_result, tc_run_start, tc_run_end, tc_run_date, usr_id })
    }
  }

  async delete (req, res) {
    try {
      const deletedKwIdList = []
      const { id_list } = req.body
      const testcaseDeletingCollection = Testcases.forge()
      id_list.forEach(async (tcId) => {
        console.log(typeof (tcId))
        testcaseDeletingCollection.push(Testcase.forge({ tc_id: tcId }))
        deletedKwIdList.push(tcId)
      })
      console.log(testcaseDeletingCollection)
      const data = await bookshelf.transaction(async (tx) => {
        // const deleteKwId =
        const processList = [testcaseDeletingCollection.invokeThen("destroy", null, {transacting: tx})]
        // const [testcaseDeletedList] = await Promise.all(processList)
        await Promise.all(processList)
        return deletedKwIdList
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  // async edit (req, res) {
  //   try {
  //     console.log("In edit now")
  //     const errors = req.validationErrors()
  //     if (errors) throw errors
  //     const { testcases, usr_id } = req.body
  //     const savedTestcase = []
  //     // const testcaseCollection = Testcases.forge()
  //     const testcaseCollection = []
  //     testcases.forEach(item => {
  //       const testcase = this.convertToTestcase(item, usr_id)
  //       testcaseCollection.push(testcase)
  //     })
  //     testcaseCollection.forEach(async (tc) => {
  //       const tc_id = tc.tc_id
  //       delete tc.tc_id
  //       console.log("tc =", tc)
  //       savedTestcase.push(await Testcase.update(tc.toJSON(), { tc_id }))
  //     })
  //     this.success(res, savedTestcase)
  //   } catch (error) {
  //     this.failure(res, error)
  //   }
  // }
}
