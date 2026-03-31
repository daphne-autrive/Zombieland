//logic for ticket management
import { prisma } from '../lib/prisma.js'
import { Request, Response } from 'express'

export const getAllprices = async (req: Request, res: Response) => {
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id_TICKET: 1 },
        })

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket non trouvé' })
        }

        res.json({ price: ticket.amount })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erreur lors de la récupération du tarif' })
    }
}

export const updateTicketPrice = async (req: Request, res: Response) => {
    const { price } = req.body

    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ message: 'Prix invalide' })
    }

    try {
        await prisma.ticket.update({
            where: { id_TICKET: 1 },
            data: { amount: price }, // <-- IMPORTANT
        })

        res.json({ message: 'Prix mis à jour avec succès' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Erreur lors de la mise à jour du prix' })
    }
}