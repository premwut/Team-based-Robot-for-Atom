import Testcase, { Testcases } from "../models/testcase.model"
import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class TestcaseController extends BaseController {
  async get (req, res) {
    const testcases = await Testcase.forge().fetchAll()
    // const testcases = await bookshelf.knex("testcase")

    res.json(testcases)
  }

  async create (req, res) {

  }
}
