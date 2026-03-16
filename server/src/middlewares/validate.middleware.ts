// server/src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from "express"
import { ZodType, ZodError } from "zod"

// Un garde qui vérifie le contenu du formulaire avec Zod
// Il prend un schéma en paramètre et vérifie que req.body correspond
export function validate(schema: ZodType) {

  return (req: Request, res: Response, next: NextFunction): void => {

    // safeParse vérifie les données sans planter
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const zodError = result.error as ZodError
      // Les données ne correspondent pas au schéma
      // On renvoie les erreurs formatées
      res.status(400).json({
        error: "Données invalides",
        details: zodError.issues.map((issue) => ({
          champ: issue.path.join("."),
          message: issue.message,
        })),
      })
      return
    }

    // Les données sont valides, on remplace req.body par les données nettoyées
    // Zod enlève les champs non prévus dans le schéma (sécurité)
    req.body = result.data

    next()
  }
}