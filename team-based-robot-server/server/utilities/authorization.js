import R from "ramda"
import { Tables } from "./constants"
import bookshelf from "../config/bookshelf"

export const verifyAuthorization = (featurePermission = [[]]) => async (req, res, next) => {
  const { role_id } = req.currentUser.toJSON()
  const { features = [] } = await getFeaturesByRole(role_id)
  const featureMap = features.map(item => [item.feature, item.permission])
  const isValid = R.intersection(featureMap, featurePermission).length
  if (isValid) {
    next()
  } else {
    return res.status(503).json({ error: "Cannot access to resource" })
  }
}

export const getFeaturesByRole = async (roleId) => {
  const fieldRoleId = `${Tables.ROLE}.role_id`
  const fieldFeatureId = `${Tables.FEATURE}.fea_id`
  const fieldPermissionId = `${Tables.PERMISSION}.pms_id`

  const fieldFeaRoleMapRole = `${Tables.FEATURE_ROLE}.role_id`
  const fieldFeaRoleMapPms = `${Tables.FEATURE_ROLE}.pms_id`
  const fieldFeaRoleMapFea = `${Tables.FEATURE_ROLE}.fea_id`

  const results = await bookshelf.knex(Tables.ROLE)
    .innerJoin(Tables.FEATURE_ROLE, fieldRoleId, fieldFeaRoleMapRole)
    .innerJoin(Tables.PERMISSION, fieldPermissionId, fieldFeaRoleMapPms)
    .innerJoin(Tables.FEATURE, fieldFeatureId, fieldFeaRoleMapFea)
    .where(fieldRoleId, roleId)
  const firstRole = results[0] || { role_name: "" }
  const role = firstRole.role_name
  const features = results.filter(item => item.fea_role_active)
    .map(item => ({ feature: item.fea_name, permission: item.pms_name }))
  return { role, features }
}
