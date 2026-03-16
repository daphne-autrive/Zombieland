// middleware rôle 

import { Request, Response, NextFunction } from "express"

// Le VIP checker : vérifie que le visiteur a le bon rang
// C'est une usine à gardes : checkRole("ADMIN") fabrique un garde qui vérifie ADMIN
export function checkRole(requiredRole: string) {

  return (req: Request, res: Response, next: NextFunction): void => {

    // 1. Récupérer l'étiquette collée par checkToken
    const user = req.user

    // 2. Pas d'étiquette = pas passé par checkToken
    if (!user) {
      res.status(401).json({ error: "Non authentifié" })
      return
    }

    // 3. Vérifier le rang
    if (user.role !== requiredRole) {
      res.status(403).json({ error: "Accès interdit : rôle non autorisé" })
      return
    }

    next()
  }
}