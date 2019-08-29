import { FeatureType, PermissionType, USER_API } from "../utilities/constants"

import { Router } from "express"
import UserController from "../controllers/user.controller"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new UserController()
const manageWrite = [
  [FeatureType.ALL, PermissionType.WRITE],
  [FeatureType.MANAGE_USER, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_USER, PermissionType.READ],
]

// mapping route
router.post(`${USER_API}/create`, authn, authz(manageWrite), ctrl.createUsers.bind(ctrl))
router.put(`${USER_API}/:id/edit`, authn, authz(manageWrite), ctrl.editUser.bind(ctrl))
router.delete(`${USER_API}/:id/delete`, authn, authz(manageWrite), ctrl.deleteUser.bind(ctrl))
router.get(`${USER_API}/list`, authn, authz(manageRead), ctrl.getUserList.bind(ctrl))
router.get(`${USER_API}/shareable`, authn, authz(manageRead), ctrl.getUserShareable.bind(ctrl))
router.get(`${USER_API}/members`, authn, authz(manageRead), ctrl.getUserMembers.bind(ctrl))
router.get(`${USER_API}/features`, authn, ctrl.getFeature.bind(ctrl))
router.get(`${USER_API}/profile`, authn, ctrl.getProfile.bind(ctrl))
router.put(`${USER_API}/profile`, authn, ctrl.editProfile.bind(ctrl))

export default router
