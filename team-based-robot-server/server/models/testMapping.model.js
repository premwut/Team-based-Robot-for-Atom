import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class TestMapping extends BaseModel {
  get idAttribute () { return Fields.TEST_MAP_ID }
  get tableName () { return Tables.TEST_MAPPING }
  get hasTimestamps () { return true }

  initialize () {}

  keyword () {
    return this.belongsTo(Models.KEYWORD, Fields.KWD_ID)
  }
  test () {
    return this.belongsTo(Models.TEST, Fields.TEST_ID)
  }
}

export const TestMappings = bookshelf.Collection.extend({model: TestMapping})
export default bookshelf.model(Models.TEST_MAPPING, TestMapping)
