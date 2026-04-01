// Testing users controller
import { vi, test, expect, beforeEach, it, describe } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { getAllUsers } from '../controllers/users.controller.js'
import request from "supertest"
import app from '../app.js'

// --- MOCKS ------------------------------------------------------------------

// Mock Prisma client (hoisted)
const mockPrisma = vi.hoisted(() => ({
  reservation: { groupBy: vi.fn(), findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), delete: vi.fn(), update: vi.fn() },
  user: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), delete: vi.fn(), update: vi.fn() },
  ticket: { findUnique: vi.fn() },
  setting: { findUnique: vi.fn() }
}))

// 👉 Mock Prisma UNE SEULE FOIS pour tout le fichier
vi.mock('../lib/prisma.js', () => ({
  prisma: mockPrisma
}))

// Mock middleware auth
const mockCheckToken = vi.hoisted(() => vi.fn())
vi.mock('../middlewares/auth.middleware.js', () => ({
  checkToken: mockCheckToken
}))

// Mock argon2
vi.mock('argon2', () => ({
  verify: vi.fn().mockResolvedValue(true)
}))

// ---------------------------------------------------------------------------

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()

  mockCheckToken.mockImplementation(
    (req: Request & { user?: { id: number; role: string } }, res: Response, next: NextFunction) => {
      req.user = { id: 1, role: 'ADMIN' }
      next()
    }
  )
})


// --- TESTS UNITAIRES --------------------------------------------------------

describe('getAllUsers - unit test', () => {

  test('should return 200 and a list of users', async () => {
    const fakeUsers = [
      { id_USER: 1, email: 'test@test.com', firstname: 'John', lastname: 'Doe', role: 'ADMIN', created_at: new Date(), _count: { reservations: 0 } },
      { id_USER: 2, email: 'test2@test.com', firstname: 'Jane', lastname: 'Doe', role: 'MEMBER', created_at: new Date(), _count: { reservations: 1 } }
    ]

    mockPrisma.user.findMany.mockResolvedValue(fakeUsers)

    const mockReq = { user: { id: 1, role: 'ADMIN' } } as Request
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as unknown as Response
    const mockNext = vi.fn()

    await getAllUsers(mockReq, mockRes, mockNext)

    expect(mockPrisma.user.findMany).toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(fakeUsers)
  })

  test("should throw if Prisma throws", async () => {
    const error = new Error("DB error")
    mockPrisma.user.findMany.mockRejectedValue(error)

    const req: any = { user: { id: 1, role: "ADMIN" } }
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    const next = vi.fn()

    await expect(getAllUsers(req, res, next)).rejects.toThrow("DB error")

    expect(next).not.toHaveBeenCalled()
  })
})


// --- TEST D’INTÉGRATION -----------------------------------------------------

describe("GET /api/users - integrationTest", () => {

  // Mock Prisma pour l’intégration
  beforeEach(() => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id_USER: 1,
        email: "test@test.com",
        firstname: "John",
        lastname: "Doe",
        role: "ADMIN",
        created_at: new Date(),
        _count: { reservations: 0 }
      }
    ])
  })

  it("should return 200 and a list of users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer faketoken")

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})