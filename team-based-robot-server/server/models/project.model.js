import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"
class Project extends BaseModel {
  get idAttribute () { return Fields.PROJ_ID }
  get tableName () { return Tables.PROJECT }
  get hasTimestamps () { return true }

  initialize () {

  }

  teams () {
    return this.hasMany(Models.TEAM, Fields.PROJ_ID)
  }
  keywordMapping () {
    return this.hasMany(Models.KEYWORD_MAPPING, Fields.PROJ_ID)
  }
}

export const Projects = bookshelf.Collection.extend({model: Project})
export default bookshelf.model(Models.PROJECT, Project)
