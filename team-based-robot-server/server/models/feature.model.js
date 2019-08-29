import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Feature extends BaseModel {
  get idAttribute () { return Fields.FEA_ID }
  get tableName () { return Tables.FEATURE }
  get hasTimestamps () { return true }

  initialize () {

  }

  featureRole () {
    return this.hasMany(Models.FEATURE_ROLE, Fields.FEA_ID)
  }
}

export const Features = bookshelf.Collection.extend({model: Feature})
export default bookshelf.model(Models.FEATURE, Feature)
