
import * as z from "zod";

// Schéma de validation pour l'inscription
const RegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit faire minimum 8 caractères"),
  firstname: z.string().min(2, "Le prénom doit faire minimum 2 caractères"),
  lastname: z.string().min(2, "Le nom doit faire minimum 2 caractères"),
})


// On exporte aussi les types générés par Zod
// Ça te donne des types TypeScript automatiquement depuis tes schémas
export default RegisterSchema
