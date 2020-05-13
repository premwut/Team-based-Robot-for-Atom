import { Fields, Tables } from "../utilities/constants"
import Review, { Reviews } from "../models/review.model"
import User, { Users } from "../models/user.model"
import Team from "../models/team.model"
import TestMapping, { TestMappings } from "../models/testMapping.model"

import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class ReviewController extends BaseController {
  async getReview (req, res) {
    try {
      // For Debugging when error with handler in review router
      // const usr_id = req.params.userId
      // const user = await User.forge({ usr_id }).fetch()
      // const team_id = user.get(Fields.TEAM_ID)

      // 1st Method
      let leaderId = req.params.userId
      const { role_id, team_id } = req.currentUser.toJSON()
      if (role_id !== 2) {
        const leader = await User.forge({ team_id, role_id: 2 }).fetch()
        leaderId = leader.get(Fields.USR_ID)
      }

      // 2rd Method
      // const usr_id = req.params.userId
      // const { team_id } = (await bookshelf.knex(Tables.USER).select(Fields.TEAM_ID).where({ usr_id })).pop()
      // const leaderId = (await bookshelf.knex(Tables.USER).where({ team_id, role_id: 2 })).pop().usr_id
      const reviews = await Review.forge().where({ usr_id: leaderId }).fetchAll()
      this.success(res, reviews)
    } catch (e) {
      this.error(res, e)
    }
  }

  async submitReview (req, res) {
    const reviewData = req.body
    const { kwd_id, usr_id } = reviewData
    const review = await bookshelf.knex(Tables.REVIEW).where({ kwd_id }) // usr_id
    let isExist = true
    if (review.length < 1) isExist = !isExist
    if (!isExist) {
      const submit = await Review.create(reviewData)
    }

    this.success(res, { review: review.pop(), isExist })
  }

  async editReview (req, res) {
    console.log("editReview")
    const data = req.body
    console.log(data, "request body")
    const { reviewData } = req.body
    const { updateId } = req.body
    const test = await Review.update(reviewData, { id: updateId })
    this.success(res, { edit: data, test })
  }
}
