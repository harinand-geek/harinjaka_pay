# Harinjaka Pay — Digital Subscription Madagascar

Application complète de gestion des **moyens de paiement** pour **Digital Subscription Madagascar**.

🌐 **En production : [pay.digitalsub.org](https://pay.digitalsub.org)**

- **Page publique** : affiche les moyens de paiement actifs (Airtel Money, MVola, Orange Money, BRED…) avec boutons « copier » et « copier tout ». Aucune information n'est codée en dur — tout vient de l'API. **Thème clair/sombre** avec bascule mémorisée.
- **Dashboard admin** sécurisé (Laravel Sanctum) : CRUD des méthodes + champs copiables dynamiques, **analytics** respectueuses de la vie privée (visites, appareils, navigateurs, localisation, vues & copies par méthode), **personnalisation du pied de page** et de l'image de fond, et **gestion du compte** (email / mot de passe).
- **SEO & partage social** : balises Open Graph / Twitter Card + JSON-LD dans `index.html`.

| Couche | Stack |
|--------|-------|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · TanStack Query · Axios · Framer Motion · Lucide · Recharts · react-hot-toast |
| Backend | Laravel 13 · Sanctum · MySQL · API REST (Form Requests, API Resources, Services) |

---

## 📁 Structure

```
harinjaka_pay/
├── backend/      → API Laravel
├── frontend/     → SPA React
├── DEPLOY.md     → guide de déploiement (mono-domaine DirectAdmin / LiteSpeed)
└── README.md
```

---

## ✅ Prérequis

- **PHP ≥ 8.2** + Composer
- **Node ≥ 20** + npm
- **MySQL ≥ 8** (une base accessible)

---

## 🚀 Installation & lancement

### 1. Backend (Laravel) — port 8000

```bash
cd backend
composer install
cp .env.example .env          # PowerShell : Copy-Item .env.example .env
php artisan key:generate
```

Configurez la base dans `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=harinjaka_pay
DB_USERNAME=root
DB_PASSWORD=
```

Migrez + seedez :

```bash
php artisan migrate --seed     # tables + admin + 4 méthodes de démo
php artisan storage:link       # expose les logos uploadés (public/storage)
php artisan serve              # http://localhost:8000
```

### 2. Frontend (React) — port 5173

```bash
cd frontend
npm install
cp .env.example .env           # PowerShell : Copy-Item .env.example .env
npm run dev                    # http://localhost:5173
```

`frontend/.env` :

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Accès

| URL | Description |
|-----|-------------|
| `/` | Page publique de paiement |
| `/admin/login` | Connexion admin |
| `/admin` | Dashboard |

**Identifiants admin par défaut** (seeder) — **à changer en production** via *Admin → Compte* :

```
email    : admin@example.com
password : password
```

---

## 🔌 API

### Public

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/payment-methods` | Méthodes actives + champs (triées par `sort_order`) |
| `GET` | `/api/settings` | Réglages publics (fond + pied de page) |
| `POST` | `/api/analytics/visit` | Enregistre une visite (IP anonymisée) |
| `POST` | `/api/analytics/payment-event` | `view_method` / `copy_field` / `copy_all` |

### Admin (Bearer token Sanctum, sauf login)

| Méthode | Endpoint |
|---------|----------|
| `POST` | `/api/admin/login` *(rate-limited)* |
| `POST` | `/api/admin/logout` |
| `GET` | `/api/admin/me` |
| `PUT` | `/api/admin/profile` *(email / mot de passe — mot de passe actuel requis)* |
| `GET` `POST` | `/api/admin/payment-methods` |
| `GET` `PUT` `DELETE` | `/api/admin/payment-methods/{id}` |
| `PATCH` | `/api/admin/payment-methods/{id}/toggle` · `/reorder` |
| `POST` `DELETE` | `/api/admin/payment-methods/{id}/logo` |
| `GET` `PUT` | `/api/admin/settings` *(fond + pied de page)* |
| `GET` | `/api/admin/analytics/{overview,visits,payment-methods,locations,devices,referrers}` |

---

## ⚙️ Réglages personnalisables (Admin → Paramètres)

- **Image de fond** + intensité du voile (s'adapte au thème, lisibilité garantie).
- **Pied de page** : contact (téléphone, WhatsApp, e-mail), liens (Facebook, X, LinkedIn, Shop, Blog, QrCode), adresse, horaires. Un champ vide retombe sur la valeur par défaut.

Stockés dans la table générique `settings` (clés whitelistées exposées publiquement).

---

## 🔐 Sécurité & vie privée

- Routes admin protégées par `auth:sanctum` + middleware `admin` (`is_admin`).
- Modification email/mot de passe : **mot de passe actuel obligatoire** ; le changement de mot de passe révoque les autres sessions.
- **L'IP brute n'est jamais stockée** : seul un hash SHA-256 salé (`ANALYTICS_IP_SALT`).
- Validation via **Form Requests**, rate limiting sur login + analytics.
- Géolocalisation **désactivée par défaut** (`GEO_LOOKUP_ENABLED=false`).

---

## 🚢 Déploiement

Voir **[DEPLOY.md](DEPLOY.md)** — procédure mono-domaine (front servi par Laravel, `VITE_API_URL=/api`, zéro CORS) testée sur **DirectAdmin / LiteSpeed**.

```bash
# Front
cd frontend && npm run build     # utilise .env.production -> VITE_API_URL=/api
# puis copier dist/* dans le web root, à côté de l'index.php de Laravel
```

---

## 🛠️ Commandes utiles

```bash
# Backend
php artisan migrate:fresh --seed          # réinitialise la base + données de démo
php artisan db:seed --class=PaymentMethodSeeder --force   # (ré)injecte les méthodes
php artisan route:list --path=api

# Frontend
npm run build
npm run lint
```
