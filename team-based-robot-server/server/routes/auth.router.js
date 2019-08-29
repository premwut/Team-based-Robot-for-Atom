import { AUTH_API } from "../utilities/constants"
import AuthController from "../controllers/auth.controller"
import { Router } from "express"
import { verifyAuthentication as authn } from "../utilities/authentication"

const router = Router()
const authCtrl = new AuthController()

// mapping route
router.post(`${AUTH_API}/login`, authCtrl.login.bind(authCtrl))
router.post(`${AUTH_API}/logout`, authn, authCtrl.logout.bind(authCtrl))
router.post(`${AUTH_API}/password/change`, authn, authCtrl.changePassword.bind(authCtrl))

export default router
