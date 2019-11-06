import Testcase, { Testcases } from "../models/testcase.model"
import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class TestcaseController extends BaseController {
  async get (req, res) {
    const testcases = await Testcase.forge().fetchAll()
    // const testcases = await bookshelf.knex("testcase")
    console.log(req.currentUser, "currentUser")
    const { currentUser } = req
    console.log(currentUser.usr_id)
    this.success(res, { testcases })
  }

  async create (req, res) {

  }
}
