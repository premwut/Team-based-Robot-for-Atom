import { FEATURE_API, FeatureType, PermissionType } from "../utilities/constants"

import FeatureController from "../controllers/feature.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new FeatureController()
const manageAll = [
  [FeatureType.ALL, PermissionType.WRITE],
]
const manageWrite = [
  ...manageAll,
  [FeatureType.MANAGE_FEATURE, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_FEATURE, PermissionType.READ],
]

// mapping route
router.post(`${FEATURE_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
router.put(`${FEATURE_API}/:id/edit`, authn, authz(manageWrite), ctrl.edit.bind(ctrl))
router.delete(`${FEATURE_API}/:id/delete`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
router.get(`${FEATURE_API}/:id/info`, authn, authz(manageRead), ctrl.get.bind(ctrl))
router.get(`${FEATURE_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))

export default router
