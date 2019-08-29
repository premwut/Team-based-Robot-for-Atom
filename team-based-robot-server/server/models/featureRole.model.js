import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class FeatureRole extends BaseModel {
  get idAttribute () { return Fields.FEA_ROLE_ID }
  get tableName () { return Tables.FEATURE_ROLE }
  get hasTimestamps () { return true }

  initialize () {

  }

  feature () {
    return this.belongsTo(Models.FEATURE, Fields.FEA_ID)
  }
  permission () {
    return this.belongsTo(Models.PERMISSION, Fields.PMS_ID)
  }
  role () {
    return this.belongsTo(Models.ROLE, Fields.ROLE_ID)
  }
}

export const FeatureRoles = bookshelf.Collection.extend({model: FeatureRole})
export default bookshelf.model(Models.FEATURE_ROLE, FeatureRole)
