import { FeatureType, PROJECT_API, PermissionType } from "../utilities/constants"

import ProjectController from "../controllers/project.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new ProjectController()
const manageAll = [
  [FeatureType.ALL, PermissionType.WRITE],
]
const manageWrite = [
  ...manageAll,
  [FeatureType.MANAGE_PROJECT, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_PROJECT, PermissionType.READ],
]

// mapping route
router.post(`${PROJECT_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
router.put(`${PROJECT_API}/:id/edit`, authn, authz(manageWrite), ctrl.edit.bind(ctrl))
router.delete(`${PROJECT_API}/:id/delete`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
router.get(`${PROJECT_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))
router.get(`${PROJECT_API}/shareable`, authn, authz(manageRead), ctrl.getShareable.bind(ctrl))
router.get(`${PROJECT_API}/:id/info`, authn, authz(manageRead), ctrl.get.bind(ctrl))

router.get(`${PROJECT_API}/:id/teams`, authn, authz(manageRead), ctrl.getTeam.bind(ctrl))

export default router
