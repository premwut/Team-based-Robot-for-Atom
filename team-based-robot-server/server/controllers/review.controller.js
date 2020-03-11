import { Fields } from "../utilities/constants"
import Review, { Reviews } from "../models/review.model"

import BaseController from "./base.controller"

export default class ReviewController extends BaseController {
  async getReview (req, res) {
    try {
      const reviews = await Review.forge().fetch()
      this.success(res, reviews)
    } catch (e) {
      this.error(res, e)
    }
  }

  async submitReview (req, res) {
    this.success(res, { submit: "Review" })
  }
}
