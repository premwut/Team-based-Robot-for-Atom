import { FeatureType, PermissionType, REVIEW_API } from "../utilities/constants"

import { Router } from "express"
import ReviewController from "../controllers/review.controller"
import { verifyAuthentication as authn } from "../utilities/authentication"
import { verifyAuthorization as authz } from "../utilities/authorization"

const router = Router()
const ctrl = new ReviewController()

const manageWrite = [
  [FeatureType.ALL, PermissionType.WRITE],
  [FeatureType.MANAGE_REVIEW, PermissionType.WRITE],
]
const manageRead = [
  ...manageWrite,
  [FeatureType.MANAGE_REVIEW, PermissionType.READ],
]

// router.get(`${REVIEW_API}/get`, ctrl.getReview.bind(ctrl))
router.get(`${REVIEW_API}/get`, authn, authz(manageRead), ctrl.getReview.bind(ctrl))
router.post(`${REVIEW_API}/submit`, ctrl.submitReview.bind(ctrl))

export default router
