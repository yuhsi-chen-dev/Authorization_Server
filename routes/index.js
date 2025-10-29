import express from "express"
import authorizeRouter from "./authorize.js"
import loginRouter from './login.js'
import consentRouter from './consent.js'
import logoutRouter from './logout.js'
import tokenRouter from './token.js'

const router = express.Router()

router.use('/', authorizeRouter)
router.use('/', loginRouter)
router.use('/', consentRouter)
router.use('/', logoutRouter)

router.use('/oauth', tokenRouter)

export default router