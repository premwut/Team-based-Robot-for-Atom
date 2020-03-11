import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

class Review extends BaseModel {
    get idAttribute () { return Fields.RW_ID }
    get tableName () { return Tables.REVIEW }
    get hasTimestamps () { return true }

    initialize () {}

    user () {
      return this.belongsTo(Models.USER, Fields.USR_ID)
    }
    keyword () {
        return this.belongsTo(Models.KEYWORD, Fields.KWD_ID)
      }
}

export const Reviews = bookshelf.Collection.extend({model: Review})
export default bookshelf.model(Models.REVIEW, Review)
