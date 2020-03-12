import { Fields, Tables } from "../utilities/constants"
import Review, { Reviews } from "../models/review.model"

import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class ReviewController extends BaseController {
  async getReview (req, res) {
    try {
      const usr_id = req.params.userId
      const reviews = await Review.forge().where({ usr_id }).fetchAll()
      this.success(res, reviews)
    } catch (e) {
      this.error(res, e)
    }
  }

  async submitReview (req, res) {
    const reviewData = req.body
    const { kwd_id, usr_id } = reviewData
    const review = await bookshelf.knex(Tables.REVIEW).where({ kwd_id, usr_id })
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
