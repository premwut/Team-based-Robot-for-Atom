import { FeatureType, KEYWORD_API, PermissionType } from "../utilities/constants"

import KeywordController from "../controllers/keyword.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new KeywordController()
const manageAll = [
  [FeatureType.ALL, PermissionType.WRITE],
]
const manageWrite = [
  ...manageAll,
  [FeatureType.MANAGE_KEYWORD, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_KEYWORD, PermissionType.READ],
]

// mapping route
router.post(`${KEYWORD_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
router.put(`${KEYWORD_API}/:id/edit`, authn, authz(manageWrite), ctrl.edit.bind(ctrl))
router.delete(`${KEYWORD_API}/:id/delete`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
router.get(`${KEYWORD_API}/:id/info`, authn, authz(manageRead), ctrl.get.bind(ctrl))
router.get(`${KEYWORD_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))
router.get(`${KEYWORD_API}/shared`, authn, authz(manageRead), ctrl.getSharedList.bind(ctrl))
router.post(`${KEYWORD_API}/name/verify`, authn, authz(manageRead), ctrl.verifyByNames.bind(ctrl))

export default router
