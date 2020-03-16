import FeatureRole, { FeatureRoles } from "../models/featureRole.model"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import Feature from "../models/feature.model"
import User from "../models/user.model"
import { Tables, Fields } from "../utilities/constants"
import Permission from "../models/permission.model"
import R from "ramda"
import Role from "../models/role.model"
import bookshelf from "../config/bookshelf"

export default class RoleController extends BaseController {
  async get (req, res) {
    try {
      const { id: role_id } = req.params
      const role = await Role.forge({ role_id }).fetch({ withRelated: ["featureRoles"] })
      const featureRoles = role.related("featureRoles")
      const feaIds = R.pluck(Fields.FEA_ID)(featureRoles.toJSON())
      const pmsIds = R.pluck(Fields.PMS_ID)(featureRoles.toJSON())
      const [featureCollection, permissionCollection] = await this.getFeaturePermission(feaIds, pmsIds)
      const features = this.toFeaturePermissionResponse(featureRoles, featureCollection, permissionCollection)
      const data = role.toJSON()
      data.features = features
      data.featureRoles = undefined
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getRoleId (req, res) {
    const { usr_id } = req.params
    // let role_idx
    // const user = await bookshelf.knex(Tables.USER).select(Fields.ROLE_ID).where({ usr_id })
    bookshelf.knex(Tables.USER)
      .where({ usr_id })
      .join(Tables.ROLE, `${Tables.USER}.${Fields.ROLE_ID}`, "=", `${Tables.ROLE}.${Fields.ROLE_ID}`)
      .then(data => {
        this.success(res, ...data)
      })
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const roles = await (isPaging ? Role.forge().fetchPage({ page, pageSize }) : Role.forge().fetchAll())
      this.success(res, { roles, ...getPagination(roles) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      req.check("features", "title is required").exists()
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { name: role_name, title: role_title, features } = req.body
      const feaIds = R.pluck("featureId")(features)
      const pmsIds = R.pluck("permissionId")(features)
      const [featureCollection, permissionCollection] = await this.getFeaturePermission(feaIds, pmsIds)
      const data = await bookshelf.transaction(async (tx) => {
        let featureData = []
        const role = await Role.forge({ role_name, role_title }).save(null, {transacting: tx})
        if (featureCollection && permissionCollection) {
          const feaRoles = features.map(item => FeatureRole.forge({
            role_id: role.get(Fields.ROLE_ID),
            fea_id: featureCollection.get(item.featureId).get(Fields.FEA_ID),
            pms_id: permissionCollection.get(item.permissionId).get(Fields.PMS_ID),
          }))
          const featureRoles = await FeatureRoles.forge(feaRoles).invokeThen("save", null, {transacting: tx})
          featureData = this.toFeaturePermissionResponse(featureRoles, featureCollection, permissionCollection)
        }
        return { role, features: featureData }
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async edit (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { id } = req.params
      const { name: role_name, title: role_title } = req.body
      const role = await Role.update({ role_name, role_title }, { id })
      this.success(res, role.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async delete (req, res) {
    try {
      const { id: role_id } = req.params
      await bookshelf.transaction(async tx => {
        const role = await Role.forge({ role_id }).fetch({ withRelated: ["featureRoles"] })
        const featureRoles = role.related("featureRoles")
        featureRoles.length && await featureRoles.invokeThen("destroy", null, {transacting: tx})
        await role.destroy({transacting: tx})
      })
      this.success(res, { roleId: parseInt(role_id) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getFeaturePermission (feaIds, pmsIds) {
    let featureCollection, permissionCollection
    if (feaIds.length !== 0 && pmsIds.length !== 0) {
      [featureCollection, permissionCollection] = await Promise.all([
        Feature.collection().query(q => q.where(Fields.FEA_ID, "in", feaIds)).fetch(),
        Permission.collection().query(q => q.where(Fields.PMS_ID, "in", pmsIds)).fetch(),
      ])
    }
    return [featureCollection, permissionCollection]
  }

  toFeaturePermissionResponse (featureRoleCollection, featureCollection, permissionCollection) {
    return featureRoleCollection.map(item => {
      const currentFeature = featureCollection.get(item.get(Fields.FEA_ID))
      const currentPermission = permissionCollection.get(item.get(Fields.PMS_ID))
      return {
        feature: currentFeature.get(Fields.FEA_NAME),
        permission: currentPermission.get(Fields.PMS_NAME),
      }
    })
  }

  validateCreateRequest (req) {
    req.check("name", "name is required").notEmpty()
    req.check("title", "title is required").notEmpty()
    return req.validationErrors()
  }
}
