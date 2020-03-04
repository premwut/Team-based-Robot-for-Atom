import { FeatureType, TEST_API, PermissionType } from "../utilities/constants"

import TestController from "../controllers/test.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new TestController()
const manageWrite = [
  [FeatureType.ALL, PermissionType.WRITE],
  [FeatureType.MANAGE_TEST, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_TEST, PermissionType.READ],
]

console.log("Here!, I'm in test router")

// mapping route
router.get(`${TEST_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))
router.get(`${TEST_API}/:id/testcases`, authn, authz(manageRead), ctrl.getTestcases.bind(ctrl))
router.post(`${TEST_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
// router.post(`${TEST_API}/list/delete`, ctrl.delete.bind(ctrl))
// router.put(`${TEST_API}/edit`, authn, authz(manageRead), ctrl.create.bind(ctrl))
export default router
