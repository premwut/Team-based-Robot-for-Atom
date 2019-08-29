import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Role extends BaseModel {
  get idAttribute () { return Fields.ROLE_ID }
  get tableName () { return Tables.ROLE }
  get hasTimestamps () { return true }

  initialize () {

  }

  featureRoles () {
    return this.hasMany(Models.FEATURE_ROLE, Fields.ROLE_ID)
  }
  users () {
    return this.hasMany(Models.USER, Fields.ROLE_ID)
  }

  static findByName (roleName) {
    return this.forge().query({where: { role_name: roleName }}).fetch()
  }
}

export const Roles = bookshelf.Collection.extend({model: Role})
export default bookshelf.model(Models.ROLE, Role)
