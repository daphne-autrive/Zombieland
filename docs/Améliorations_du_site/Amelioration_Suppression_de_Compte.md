# Soft Delete Users — Résumé des changements

## 1. `server/prisma/schema.prisma` (MODIFIÉ)
Ajout du champ `deleted_at DateTime?` sur le modèle `User`.
> Pourquoi : au lieu de supprimer physiquement l'utilisateur (et ses réservations en cascade), on date la suppression. `null` = compte actif, `DateTime` = compte supprimé. Les réservations restent en BDD pour conserver l'historique et les stats de revenus admin.

## 2. `server/prisma/migrations/20260403085432_add_deleted_at_to_user` (NOUVEAU)
Migration générée automatiquement par `pnpm prisma migrate dev --name add_deleted_at_to_user`.
> Pourquoi : toute modification du schéma Prisma doit être traduite en migration SQL pour être appliquée sur la BDD réelle.

## 3. `server/src/controllers/users.controller.ts` (MODIFIÉ)
Dans `deleteProfile` — remplacement de `prisma.user.delete()` par `prisma.user.update()` :
```typescript
// ❌ avant — suppression physique, cascade sur les réservations
await prisma.user.delete({ where: { id_USER: id } })

// ✅ après — soft delete, réservations conservées
await prisma.user.update({
    where: { id_USER: id },
    data: { deleted_at: new Date() }
})
```
> Pourquoi : `onDelete: Cascade` sur la relation `Reservation` → `User` supprimait toutes les réservations du membre. Avec le soft delete, l'utilisateur est marqué comme supprimé mais ses données restent intactes en BDD.

## 4. `server/src/middlewares/auth.middleware.ts` (MODIFIÉ)
Ajout d'une vérification `deleted_at` après la validation du JWT dans `checkToken` :
```typescript
const user = await prisma.user.findUnique({ where: { id_USER: decoded.id } })
if (user?.deleted_at) {
    next(new UnauthorizedError("Compte supprimé"))
    return
}
```
> Pourquoi : sans cette vérification, un utilisateur supprimé (soft delete) pourrait continuer à utiliser son JWT encore valide pour accéder à l'API. On bloque explicitement les comptes dont `deleted_at` est renseigné.

## 5. `server/src/__tests__/unit/users.controller.test.ts` (MODIFIÉ)
Correction du test `ADMIN can delete any profile` de Yohann :
- `mockPrisma.user.delete` remplacé par `mockPrisma.user.update`
- La valeur mockée retourne `{ id_USER: 2, deleted_at: new Date() }`
> Pourquoi : le controller appelle maintenant `update` au lieu de `delete` — le mock doit refléter le nouveau comportement.

## 6. `server/src/__tests__/unit/auth.controller.test.ts`, `integration/auth.routes.test.ts`, `integration/attractions.routes.test.ts` (MODIFIÉS)
Ajout de `deleted_at: null` dans tous les objets `fakeUser satisfies User`.
> Pourquoi : `satisfies User` vérifie la conformité avec le modèle Prisma complet. Depuis l'ajout de `deleted_at` dans le schéma, TypeScript exige ce champ dans tous les objets typés `User`.