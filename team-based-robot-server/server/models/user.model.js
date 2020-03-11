import { Fields, Models, Tables } from "../utilities/constants"
import bookshelf, { BaseModel } from "../config/bookshelf"

import bcrypt from "bcrypt-nodejs"

class User extends BaseModel {
  get idAttribute () { return Fields.USR_ID }
  get tableName () { return Tables.USER }
  get hasTimestamps () { return true }
  get hidden () { return [Fields.PASSWORD] }

  initialize () {
    this.on("saving", this.hashPassword, this)
  }

  hashPassword (model, attrs, options) {
    return new Promise((resolve, reject) => {
      const password = options.patch ? attrs.password : model.get(Fields.PASSWORD)
      if (password) {
        bcrypt.genSalt(10, (err, salt) => {
          err && (console.log("genSalt error:", err))
          bcrypt.hash(password, salt, null, (err, hash) => {
            err && (console.log("hash error:", err))
            options.patch && (attrs.password = hash)
            model.set(Fields.PASSWORD, hash)
            resolve()
          })
        })
      } else {
        model.set(Fields.PASSWORD, null)
        resolve()
      }
    })
  }

  comparePassword (password) {
    return new Promise((resolve, reject) => {
      const actualPassword = this.get(Fields.PASSWORD)
      bcrypt.compare(password, actualPassword, (err, isMatch) => {
        err ? reject(new Error("password not match")) : resolve(isMatch)
      })
    })
  }

  toMinimal () {
    const { usr_id, usr_fname, usr_lname, team_id, email, username } = this.toJSON()
    return { usr_id, usr_fname, usr_lname, team_id, email, username }
  }

  role () {
    return this.belongsTo(Models.ROLE, Fields.ROLE_ID)
  }
  team () {
    return this.belongsTo(Models.TEAM, Fields.TEAM_ID)
  }
  keywordMapping () {
    return this.hasMany(Models.KEYWORD_MAPPING, Fields.USR_ID)
  }

  test () {
    return this.hasMany(Models.TEST, Fields.TEST_ID)
  }

  static dependents = ["testcase"]

  static findByUsername (username) {
    return this.forge()
      .query({where: { username: username }})
      .fetch()
  }
}

export const Users = bookshelf.Collection.extend({model: User})
export default bookshelf.model(Models.USER, User)
