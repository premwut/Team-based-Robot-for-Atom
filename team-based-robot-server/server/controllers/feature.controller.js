import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import Feature from "../models/feature.model"
import { Fields } from "../utilities/constants"

export default class FeatureController extends BaseController {
  async get (req, res) {
    try {
      const { id } = req.params
      const feature = await Feature.findById(id)
      this.success(res, feature.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const features = await (isPaging ? Feature.forge().fetchPage({ page, pageSize }) : Feature.forge().fetchAll())
      this.success(res, { features, ...getPagination(features) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { name: fea_name, title: fea_title, desc: fea_desc } = req.body
      const feature = await Feature.create({ fea_name, fea_title, fea_desc })
      this.success(res, feature.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async edit (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { id } = req.params
      const { name: fea_name, title: fea_title, desc: fea_desc } = req.body
      const feature = await Feature.update({ fea_name, fea_title, fea_desc }, { id })
      this.success(res, feature.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async delete (req, res) {
    try {
      const { id } = req.params
      const feature = await Feature.findById(id)
      const isFeatureSystem = feature.get(Fields.FEA_IS_SYS)
      if (isFeatureSystem) throw new Error("Cannot remove this feature")
      await feature.destroy()
      this.success(res, { fea_id: parseInt(id) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  validateCreateRequest (req) {
    req.check("name", "name is required").notEmpty()
    req.check("title", "title is required").notEmpty()
    req.check("desc", "desc is required").notEmpty()
    return req.validationErrors()
  }
}
