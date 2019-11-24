import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Testcase extends BaseModel {
  get idAttribure () { return Fields.TC_ID }
  get tableName () { return Tables.Testcase }
  get hasTimestamps () { return true }

  initialize () {}

  user () {
    return this.belongsTo(Models.USER, Fields.USR_ID)
  }
}

export const Testcases = bookshelf.Collection.extend({model: Testcase})
export default bookshelf.model(Models.TESTCASE, Testcase)
