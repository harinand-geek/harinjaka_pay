# Déploiement — pay.digitalsub.org (mono-domaine, DirectAdmin)

Front (React) + API (Laravel) servis depuis **un seul** sous-domaine.
Laravel sert l'API sous `/api` et le SPA pour tout le reste. Aucun CORS.

## Arborescence cible (pattern DirectAdmin : Laravel en racine, public_html = web root)
```
<racine sous-domaine>/        <- app Laravel (app/, bootstrap/, vendor/, routes/, .env…)
<racine sous-domaine>/public_html/
        index.php  .htaccess  <- depuis backend/public/
        index.html  assets/   <- depuis frontend/dist/
        storage/              <- symlink (storage:link)
```
public_html contient à la fois le front controller Laravel ET le SPA.
Ne PAS écraser index.php avec index.html : les deux coexistent.

## 1. Backend (Laravel)
1. Uploader l'app `backend/` dans la **racine du sous-domaine** ; copier le contenu de
   `backend/public/` dans `public_html/`.
2. Dépendances : `composer install --no-dev --optimize-autoloader`
   (sans SSH : lancer en local puis uploader `vendor/`).
3. Créer le `.env` à partir de `backend/.env.production.example` et renseigner `DB_PASSWORD`.
4. **Public path** (web root = public_html, pas public) — au choix :
   - `ln -s public_html public` dans la racine, **ou**
   - dans `public_html/index.php`, après le require de `bootstrap/app.php` :
     `$app->usePublicPath(__DIR__);`
5. Initialiser :
   ```bash
   php artisan key:generate
   php artisan migrate --force
   php artisan db:seed --class=AdminUserSeeder   # admin@example.com / password
   php artisan storage:link                      # logos uploadés -> /storage
   php artisan config:cache
   php artisan route:cache
   ```
6. Permissions : `storage/` et `bootstrap/cache/` inscriptibles (775).

## 2. Frontend (SPA)
En local :
```bash
cd frontend
npm install
npm run build        # utilise .env.production -> VITE_API_URL=/api
```
Copier **le contenu** de `frontend/dist/` dans `public_html/`
(à côté de `index.php` ; `index.html` = entrée du SPA, servie par la route catch-all de Laravel).

## 3. SSL
DirectAdmin → *SSL Certificates* → **Let's Encrypt**, cocher `pay.digitalsub.org`
dans la liste des noms → *Save* → activer **Force HTTPS**.

## 4. Vérifications
- `https://pay.digitalsub.org/api/settings` → JSON.
- `https://pay.digitalsub.org/` → page publique.
- `https://pay.digitalsub.org/admin/login` (refresh inclus) → connexion OK.
- Upload d'un logo → visible (storage:link).
- **Changer le mot de passe admin** dans *Compte*.

## Mises à jour
- Front : `npm run build` → ré-uploader `dist/` dans `public/`.
- Back : upload code → `composer install --no-dev` → `php artisan migrate --force && php artisan config:cache && php artisan route:cache`.
