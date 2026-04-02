// Functional test — Admin scenario
// Simulates a complete admin workflow: login, update ticket price, create and delete attraction
// Each step depends on the previous one succeeding

// ─── MOCK SETUP (hoisted before imports) ────────────────────────────────────

// Create a hoisted mock Prisma client with methods for user, ticket and attraction
const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  ticket: { update: vi.fn() },
  attraction: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() }
}))

// Create a hoisted mock function for the auth middleware
const mockCheckToken = vi.hoisted(() => vi.fn())

// Mock the Prisma PostgreSQL adapter
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class { } }))

// Mock the Prisma client to use our mockPrisma object
vi.mock('@prisma/client', () => ({
  PrismaClient: class { constructor() { Object.assign(this, mockPrisma) } }

}))

// Mock the auth middleware with our mockCheckToken function
vi.mock('../../middlewares/auth.middleware.js', () => ({
  checkToken: mockCheckToken
}))

// Mock the role middleware to always call next (all scenario steps run as ADMIN)
vi.mock('../../middlewares/role.middleware.js', () => ({
  checkRole: vi.fn(() => (req: Request, res: Response, next: NextFunction) => next())
}))

// Mock argon2 password hashing library
vi.mock('argon2', () => ({
  hash: vi.fn().mockResolvedValue('hashedPassword123'),
  verify: vi.fn().mockResolvedValue(true)
}))

// Mock jsonwebtoken sign to return a predictable fake token
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn().mockReturnValue('fake-token') }
}))

// ─── IMPORTS ────────────────────────────────────────────────────────────────

// Import test utilities from Vitest
import { vi, test, expect, beforeEach, describe } from 'vitest'
// Import Express types for middleware typing
import { Request, Response, NextFunction } from 'express'
// Import supertest to make HTTP requests without starting the server
import supertest from 'supertest'
// Import the Express app
import app from '../../app.js'
// Import argon2 to override verify mock in specific tests
import * as argon2 from 'argon2'
// ─── SHARED STATE ────────────────────────────────────────────────────────────

// Declare a variable to store the auth cookie shared between all scenario steps
let authCookie = ''
// Declare a variable to store the created attraction ID for the delete step
let createdAttractionId = 0
// ─── BEFORE EACH ─────────────────────────────────────────────────────────────

// Run before each test: reset mocks and set default authenticated admin behavior
beforeEach(() => {
  // Clear all mock calls from previous tests
  vi.clearAllMocks()
  // Default: simulate an authenticated ADMIN (all scenario routes require ADMIN role)
  mockCheckToken.mockImplementation((req: Request & { user?: { id: number; role: string } }, res: Response, next: NextFunction) => {
    req.user = { id: 1, role: 'ADMIN' }
    next()
  })
})

// ─── SCENARIO ────────────────────────────────────────────────────────────────

// Wrap all steps in a single describe block to group them as one workflow
describe('Admin scenario — login → update price → create → delete', () => {

  // ── Step 1: Login ──────────────────────────────────────────────────────────

  // Test step 1: admin logs in and receives an auth cookie
  test('Step 1 — should login as admin and receive an auth cookie', async () => {
    // Arrange: mock DB to return an admin user
    mockPrisma.user.findUnique.mockResolvedValue({ id_USER: 1, email: "john.doe@example.com", password:'Password1!' })
    // Arrange: mock argon2 to confirm the password matches
    vi.mocked(argon2.verify).mockResolvedValueOnce(true)
    // Act: send POST request to login endpoint with admin credentials
    const response = await supertest(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'Password1!'
    // Assert: verify the response status is 200

    // Assert: capture and store the Set-Cookie header for use in subsequent steps

    // Assert: verify that an auth cookie was actually returned

  })

  // ── Step 2: Update ticket price ───────────────────────────────────────────

  // Test step 2: admin updates the ticket price
  test('Step 2 — should update ticket price successfully', async () => {
    // Arrange: mock DB to return the admin user (needed for password verification)

    // Arrange: mock argon2 to confirm the password matches

    // Arrange: mock DB to return the updated ticket

    // Act: send PATCH request with new price, password and the auth cookie

    // Assert: verify the response status is 200

    // Assert: verify the response body contains a confirmation message

  })

  // ── Step 3: Create attraction ─────────────────────────────────────────────

  // Test step 3: admin creates a new attraction
  test('Step 3 — should create a new attraction successfully', async () => {
    // Arrange: mock DB to return the admin user (for password check)

    // Arrange: mock argon2 to confirm the password matches

    // Arrange: mock DB to return the newly created attraction with its ID

    // Act: send POST request with full attraction data, password and auth cookie

    // Assert: verify the response status is 201

    // Assert: store the created attraction ID for use in step 4

    // Assert: verify the response body contains the attraction name

  })

  // ── Step 4: Delete attraction ─────────────────────────────────────────────

  // Test step 4: admin deletes the attraction created in step 3
  test('Step 4 — should delete the attraction successfully', async () => {
    // Arrange: mock DB to return the admin user (for password verification)

    // Arrange: mock DB to return the attraction targeted for deletion

    // Arrange: mock argon2 to confirm the password matches

    // Arrange: mock DB to confirm the deletion succeeded

    // Act: send DELETE request using the stored attraction ID, password and auth cookie

    // Assert: verify the response status is 200

  })

})
