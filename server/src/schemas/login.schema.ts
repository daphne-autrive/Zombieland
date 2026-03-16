// Schéma de validation pour la connexion
import * as z from "zod";

const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

export default LoginSchema