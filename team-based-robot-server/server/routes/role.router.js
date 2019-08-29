import { FeatureType, PermissionType, ROLE_API } from "../utilities/constants"

import RoleController from "../controllers/role.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new RoleController()
const manageAll = [
  [FeatureType.ALL, PermissionType.WRITE],
]
const manageWrite = [
  ...manageAll,
  [FeatureType.MANAGE_ROLE, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_ROLE, PermissionType.READ],
]

// mapping route
router.post(`${ROLE_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
router.put(`${ROLE_API}/:id/edit`, authn, authz(manageWrite), ctrl.edit.bind(ctrl))
router.delete(`${ROLE_API}/:id/delete`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
router.get(`${ROLE_API}/:id/info`, authn, authz(manageRead), ctrl.get.bind(ctrl))
router.get(`${ROLE_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))

export default router
