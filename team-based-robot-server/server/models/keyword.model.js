import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Keyword extends BaseModel {
  get idAttribute () { return Fields.KWD_ID }
  get tableName () { return Tables.KEYWORD }
  get hasTimestamps () { return true }

  initialize () {}

  parentKeyword () {
    return this.belongsTo(Models.KEYWORD, Fields.KWD_PARENT_ID)
  }
  childKeywords () {
    return this.hasMany(Models.KEYWORD, Fields.KWD_PARENT_ID)
  }
  keywordMappings () {
    return this.hasMany(Models.KEYWORD_MAPPING, Fields.KWD_ID)
  }
  review () {
    return this.hasOne(Models.REVIEW, Fields.RW_ID)
  }

  static dependents = ["keywordMappings"]

  hasParent () {
    return this.get(Fields.KWD_PARENT_ID) !== null
  }
}

export const Keywords = bookshelf.Collection.extend({model: Keyword})
export default bookshelf.model(Models.KEYWORD, Keyword)
