// Route definitions for reservations

// Import Router from Express to create a router
import { Router } from 'express'
// Import function from the controller
import { getReservations } from '../controllers/reservations.js'

// Create an router Express
const router = Router()

// When someone calls GET /api/reservations execute getReservations
router.get('/', getReservations)

export default router