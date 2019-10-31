import { FeatureType, PermissionType, TESTCASE_API } from "../utilities/constants"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"
import Testcase from "../controllers/testcase.controller"

const router = Router()
const ctrl = new Testcase()

router.get(`${TESTCASE_API}/list`, ctrl.get.bind(ctrl))
router.post(`${TESTCASE_API}/create`, ctrl.create.bind(ctrl))

export default router
