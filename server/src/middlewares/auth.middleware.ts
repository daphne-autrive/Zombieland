// Middleware for JWT token verification and permissions

// server/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JwtPayload } from "../types/express.js"

// Le videur : vérifie que le visiteur a un badge valide (token JWT)
export function checkToken(req: Request, res: Response, next: NextFunction): void {

  // 1. Récupérer le header Authorization du sac du visiteur
  const authorization = req.headers.authorization

  // 2. Vérifier qu'il existe et qu'il a le bon format
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token manquant" })
    return
  }

  // 3. Extraire le token (enlever le mot "Bearer ")
  const token = authorization.split(" ")[1]

  try {
    // 4. Vérifier et décoder le token avec la clé secrète
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload

    // 5. Coller les infos du user sur la requête
    req.user = decoded

    // 6. Ouvrir la porte
    next()

  } catch (error) {
    // 7. Badge invalide ou expiré → dehors
    res.status(401).json({ error: "Token invalide ou expiré" })
    return
  }
}