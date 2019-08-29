import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Team extends BaseModel {
  get idAttribute () { return Fields.TEAM_ID }
  get tableName () { return Tables.TEAM }
  get hasTimestamps () { return true }

  initialize () {

  }

  project () {
    return this.belongsTo(Models.PROJECT, Fields.PROJ_ID)
  }
  members () {
    return this.hasMany(Models.USER, Fields.TEAM_ID)
  }
  keywordMapping () {
    return this.hasMany(Models.KEYWORD_MAPPING, Fields.TEAM_ID)
  }
}

export const Teams = bookshelf.Collection.extend({model: Team})
export default bookshelf.model(Models.TEAM, Team)
