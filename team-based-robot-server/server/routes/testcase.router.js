import { FeatureType, PermissionType, TESTCASE_API } from "../utilities/constants"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()

router.get(`${TESTCASE_API}/list`, (req, res) => {
  res.send("<h1>Hello World!</h1>")
})

export default router
