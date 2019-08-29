import { FeatureType, PermissionType, TEAM_API } from "../utilities/constants"

import { Router } from "express"
import TeamController from "../controllers/team.controller"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new TeamController()
const manageAll = [
  [FeatureType.ALL, PermissionType.WRITE],
]
const manageWrite = [
  ...manageAll,
  [FeatureType.MANAGE_TEAM, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_TEAM, PermissionType.READ],
]
const teamLeaderSavable = [
  ...manageWrite,
  [FeatureType.MANAGE_TEAM_MEMBER, PermissionType.WRITE],
]

// mapping route
router.post(`${TEAM_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
router.put(`${TEAM_API}/:id/edit`, authn, authz(manageWrite), ctrl.edit.bind(ctrl))
router.delete(`${TEAM_API}/:id/delete`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
router.get(`${TEAM_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))
router.get(`${TEAM_API}/shareable`, authn, authz(manageRead), ctrl.getShareable.bind(ctrl))
router.get(`${TEAM_API}/:id/info`, authn, authz(manageRead), ctrl.get.bind(ctrl))

router.get(`${TEAM_API}/:id/members`, authn, authz(manageRead), ctrl.getMember.bind(ctrl))
router.put(`${TEAM_API}/:id/save-members`, authn, authz(teamLeaderSavable), ctrl.saveMember.bind(ctrl))
router.put(`${TEAM_API}/:id/update`, authn, authz(teamLeaderSavable), ctrl.edit.bind(ctrl))

export default router
