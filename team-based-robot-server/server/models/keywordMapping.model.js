import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class KeywordMapping extends BaseModel {
  get idAttribute () { return Fields.KWD_MAP_ID }
  get tableName () { return Tables.KEYWORD_MAPPING }
  get hasTimestamps () { return true }

  initialize () {

  }

  project () {
    return this.belongsTo(Models.PROJECT, Fields.PROJ_ID)
  }
  team () {
    return this.belongsTo(Models.TEAM, Fields.TEAM_ID)
  }
  user () {
    return this.belongsTo(Models.USER, Fields.USR_ID)
  }
  keyword () {
    return this.belongsTo(Models.KEYWORD, Fields.KWD_ID)
  }
}

export const KeywordMappings = bookshelf.Collection.extend({model: KeywordMapping})
export default bookshelf.model(Models.KEYWORD_MAPPING, KeywordMapping)
