import { Fields, Tables } from "../utilities/constants"
import Review, { Reviews } from "../models/review.model"

import BaseController from "./base.controller"
import bookshelf from "../config/bookshelf"

export default class ReviewController extends BaseController {
  async getReview (req, res) {
    try {
      const reviews = await Reviews.forge().fetch()
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
    // const submit = await Review.create(reviewData)
    // const submit = (!reviewExists) ? await Review.create(reviewData) : await Review.set(reviewData, {kwd_id, usr_id})

    this.success(res, { review, isExist })
  }
}
