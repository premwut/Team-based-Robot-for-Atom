import { Router } from "express"
import authRouter from "./auth.router"
import featureRouter from "./feature.router"
import keywordRouter from "./keyword.router"
import projectRouter from "./project.router"
import roleRouter from "./role.router"
import teamRouter from "./team.router"
import userRouter from "./user.router"

const router = Router()

// Add Routes
router.use(authRouter)
router.use(userRouter)
router.use(featureRouter)
router.use(projectRouter)
router.use(teamRouter)
router.use(roleRouter)
router.use(keywordRouter)

router.use("/*", (req, res) => res.status(404).json({ error: "not found" }))

export default router
