// Business logic for reservations : handles requests and responses

import type { Request, Response } from "express";
// Talk to the db
import { prisma } from '../lib/prisma.js'

// Retrieves all reservations for the logged-in member
export const getReservations = async (req: Request, res: Response) => {
    try {
        // Query the db to retrieve all reservations
        const reservations = await prisma.reservation.findMany()
        // Return reservations whit a 200 status (success)
        res.status(200).json(reservations)
    } catch {
        // In cas of server error, return a 500 status
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Create a new reservation
export const createReservations = async (req: Request, res: Response) => {
    try {
        const { nb_tickets, date, id_USER, id_TICKET } = req.body
        const reservation = await prisma.reservation.create({
            data: {
                nb_tickets,
                date: new Date(date),
                id_USER,
                id_TICKET,
                total_amount: 0,
            }
        })
        // Return reservation create whit 201 status
        res.status(201).json(reservation)

        } catch {
            res.status(500).json({ message: 'Internal server error'})
        }
    }
