// Route definitions for tickets
import { getAllprices, updateTicketPrice } from '../controllers/ticket.controller.js'
// Import Router from Express to create a router
import { Router } from 'express'
import { checkToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'



const router = Router()

router.get('/',  getAllprices)

router.put('/price', checkToken, checkRole("admin"),updateTicketPrice)






export default router