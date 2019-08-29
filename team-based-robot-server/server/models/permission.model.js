import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Permission extends BaseModel {
  get idAttribute () { return Fields.PMS_ID }
  get tableName () { return Tables.PERMISSION }
  get hasTimestamps () { return true }

  initialize () {

  }

  featureRole () {
    return this.hasMany(Models.FEATURE_ROLE, Fields.PMS_ID)
  }
}

export const Permissions = bookshelf.Collection.extend({model: Permission})
export default bookshelf.model(Models.PERMISSION, Permission)
