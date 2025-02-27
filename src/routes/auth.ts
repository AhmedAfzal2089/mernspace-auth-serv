import express from 'express'
import { AuthController } from '../controllers/AuthController'

const router = express.Router()
const authController = new AuthController()

// because of binding problem we pass req & res like this

router.post('/register', (req, res) => authController.register(req, res))

export default router
