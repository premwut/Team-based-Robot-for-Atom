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