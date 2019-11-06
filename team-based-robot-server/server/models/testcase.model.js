import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Testcase extends BaseModel {
  get idAttribute () {
    return Fields.TC_ID
  }
  get tableName () {
    return Tables.TESTCASE
  }
  get hasTimestamps () {
    return true
  }

  user () {
    return this.belongsTo(Models.USER, Fields.USR_ID)
  }

  initialize () {}
}

export default Testcase
export const Testcases = bookshelf.Collection.extend({ model: Testcase })
