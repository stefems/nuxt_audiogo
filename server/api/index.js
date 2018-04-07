import { Router } from 'express'

import users from './users'
import user_routes from './user_routes'
import auth_routes from './auth_routes'

const router = Router();

console.log("ROUTES INITIALIZED");

// Add USERS Routes
router.use(users)
router.use('/auth', auth_routes)
router.use('/users', user_routes)

export default router
