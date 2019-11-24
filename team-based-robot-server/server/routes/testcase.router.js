import { FeatureType, TESTCASE_API, PermissionType } from "../utilities/constants"

import TestcaseController from "../controllers/testcase.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new TestcaseController()
const manageWrite = [
  [FeatureType.ALL, PermissionType.WRITE],
  [FeatureType.MANAGE_USER, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_USER, PermissionType.READ],
]

console.log("Here!, I'm in testcase router")

// mapping route
router.get(`${TESTCASE_API}/list`, ctrl.getList.bind(ctrl))
router.post(`${TESTCASE_API}/create`, ctrl.create.bind(ctrl))
router.delete(`${TESTCASE_API}/list`, ctrl.delete.bind(ctrl))
// router.get(`${TESTCASE_API}/list`, authn, authz(manageRead), ctrl.getList.bind(ctrl))
// router.post(`${TESTCASE_API}/create`, authn, authz(manageWrite), ctrl.create.bind(ctrl))
// router.delete(`${TESTCASE_API}/list`, authn, authz(manageWrite), ctrl.delete.bind(ctrl))
// router.get(`${TESTCASE_API}/hello`, ctrl.hello.bind(ctrl))
export default router
