import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Test extends BaseModel {
    get idAttribute () { return Fields.TEST_ID }
    get tableName () { return Tables.TEST }
    get hasTimestamps () { return true }

    initialize () {}

    user () {
      return this.belongsTo(Models.USER, Fields.USR_ID)
    }
}

export const Tests = bookshelf.Collection.extend({model: Test})
export default bookshelf.model(Models.TEST, Test)
