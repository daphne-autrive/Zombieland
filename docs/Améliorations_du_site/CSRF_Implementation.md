# CSRF Token Protection — Résumé des changements

## 1. `server/src/middlewares/csrf.middleware.ts` (NOUVEAU)
Crée le middleware CSRF avec deux fonctions :
- `setCsrfToken` : génère un token aléatoire et le pose dans un cookie `XSRF-TOKEN` lisible par JS (httpOnly: false)
- `checkCsrf` : vérifie que le header `X-XSRF-TOKEN` envoyé par Axios correspond au cookie sur toutes les requêtes POST/PATCH/DELETE
> Pourquoi : les cookies httpOnly protègent contre le XSS mais pas contre le CSRF. Le double-submit cookie pattern (cookie + header) force l'attaquant à lire le cookie JS pour forger une requête — ce qu'il ne peut pas faire depuis un autre domaine.

## 2. `server/src/app.ts` (MODIFIÉ)
Ajout de deux lignes après `cookieParser()` :
- `app.get('/api/auth/csrf', setCsrfToken)` : route publique pour récupérer le token au démarrage
- `app.use(checkCsrf)` : middleware global appliqué à toutes les routes suivantes
> Pourquoi : `checkCsrf` doit être enregistré AVANT les routes pour intercepter toutes les requêtes entrantes. La route CSRF doit être AVANT le middleware pour ne pas se bloquer elle-même.

## 3. `client/src/lib/axiosInstance.ts` (NOUVEAU)
Crée une instance Axios configurée avec :
- `xsrfCookieName: 'XSRF-TOKEN'` : lit le cookie CSRF
- `xsrfHeaderName: 'X-XSRF-TOKEN'` : l'envoie en header
- Un intercepteur manuel qui lit le cookie et l'ajoute au header (nécessaire en cross-origin)
> Pourquoi : Axios ne gère pas automatiquement le CSRF en cross-origin (front sur :5173, back sur :3000). L'intercepteur force l'envoi du header sur chaque requête.

## 4. `client/src/main.tsx` (MODIFIÉ)
Appel à `/api/auth/csrf` au démarrage de l'app avant le rendu React.
Remplacement de tous les imports `axios` par `axiosInstance` dans les pages et composants.
> Pourquoi : le token CSRF doit être récupéré avant toute interaction utilisateur. Toutes les requêtes doivent passer par axiosInstance pour inclure le header automatiquement.

## 5. `server/src/__tests__/integration/*.test.ts` et `scenarios/*.test.ts` (MODIFIÉS)
Ajout du mock CSRF dans tous les fichiers de tests d'intégration et scénarios :
```typescript
vi.mock('../../middlewares/csrf.middleware.js', () => ({
    checkCsrf: (_req: any, _res: any, next: any) => next(),
    setCsrfToken: (_req: any, res: any) => res.json({ csrfToken: 'fake-token' })
}))
```
> Pourquoi : le middleware CSRF bloque toutes les requêtes POST/PATCH/DELETE sans token. En tests d'intégration on teste la logique métier des routes, pas la sécurité réseau — exactement comme on mocke `checkToken` et `checkRole`.