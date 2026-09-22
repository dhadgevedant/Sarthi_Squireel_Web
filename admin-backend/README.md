# Squirrel Nuts — Admin Backend

Node.js + Express + MongoDB (Mongoose) API that powers the admin panel, plus a
small **public** API that your customer-facing website can call for the
product catalog, stock availability, and the festival-offer / announcement
banner.

## 1. Requirements

- Node.js 18+ (check with `node -v`)
- MongoDB running locally, **or** a free MongoDB Atlas cluster
- VS Code (or any editor) + a terminal

## 2. Setup (VS Code)

```bash
cd backend-admin
npm install
```

Open `.env` (already included with working defaults) and adjust if needed:

```
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/squirrelnuts
JWT_SECRET=squirrelnuts_admin_secret_2026
JWT_EXPIRES_IN=7d
```

- If you use **MongoDB Atlas** instead of a local database, replace
  `MONGO_URI` with your Atlas connection string
  (`mongodb+srv://user:pass@cluster.mongodb.net/squirrelnuts`).
- Change `JWT_SECRET` to your own random string before going live.

## 3. Create your first admin login

Run the seed script once:

```bash
npm run seed
```

This creates:

```
email:    admin@squirrelnuts.in
password: Admin@123
```

(Change the password from the Settings page after your first login.) You can
also just use the **Register** page in the admin frontend instead of seeding.

## 4. Run the server

```bash
npm run dev      # auto-restarts on file changes (nodemon)
# or
npm start
```

The API + the admin frontend are both served from the same server:

```
http://localhost:5001            → Admin panel (login, dashboard, etc.)
http://localhost:5001/api/...    → REST API
```

Because the admin frontend (`../frontend-admin`) is served as static files by
this same server, you don't need a separate frontend server — just open
`http://localhost:5001` in your browser.

## 5. Folder structure

```
backend-admin/
├── config/db.js              MongoDB connection
├── controllers/               Route handlers (business logic)
├── middleware/                 JWT auth (protect) + role guard (adminOnly)
├── models/                    Mongoose schemas
├── routes/                    Express routers
├── public/uploads/            Product images uploaded from the admin panel
├── seed.js                    Creates the first admin login
└── server.js                  App entry point
```

## 6. Admin API (requires `Authorization: Bearer <token>`)

| Method | Endpoint                          | Purpose                          |
|--------|------------------------------------|-----------------------------------|
| POST   | `/api/auth/login`                  | Admin login                      |
| POST   | `/api/auth/register`               | Create an admin account          |
| GET    | `/api/auth/profile`                | Current admin profile            |
| PUT    | `/api/auth/profile`                | Update profile                   |
| PUT    | `/api/auth/profile/change-password`| Change password                  |
| GET    | `/api/dashboard/stats`             | Dashboard numbers                |
| GET/POST/PUT/DELETE | `/api/admin/products`   | Product CRUD                     |
| POST   | `/api/admin/products/upload-image` | Upload/replace a product photo   |
| GET/PUT/DELETE | `/api/admin/orders`        | Manage orders                    |
| GET/DELETE | `/api/admin/customers`         | Manage customers                 |
| GET/PUT/DELETE | `/api/admin/messages`      | Contact form messages            |
| GET/DELETE | `/api/admin/subscribers`       | Newsletter subscribers           |
| GET/PUT | `/api/admin/settings/site`        | **Announcement bar + festival offer, COD, free-shipping threshold** |
| GET/POST/DELETE | `/api/admin/settings/admins` | Manage other admin accounts (admin/super_admin role only) |

## 7. Public API (no login needed — for your customer-facing website)

| Method | Endpoint                              | Purpose |
|--------|-----------------------------------------|---------|
| GET    | `/api/public/settings`                  | Announcement text + festival offer (title, %, message) so the home page can show the banner |
| GET    | `/api/public/products`                  | Active products (`?category=`, `?featured=true`, `?search=`) — each item includes `inStock` |
| GET    | `/api/public/products/:slug`            | Single product detail |
| POST   | `/api/public/products/check-stock`      | Body: `{ items:[{productId, qty}] }` → tells the cart which items are out of stock **before** checkout, so you can show "Product out of stock" instead of letting the order fail |

### How the festival-offer banner works

1. Go to **Admin → Settings → Store Announcement & Festival Offer**.
2. Toggle "Show festival offer banner", set a title (e.g. *Diwali Dhamaka*),
   a message, and a discount percentage (e.g. `10`).
3. Save. Your customer website should call `GET /api/public/settings` on page
   load and, if `offerEnabled` is `true`, render a banner using
   `offerTitle`, `offerText`, and `offerPercent`.

## 8. Notes

- Product images are stored in `public/uploads/` inside this project and
  served at `http://localhost:5001/uploads/<filename>` — fully self-contained,
  no dependency on any other project folder.
- `role: "admin"` and `role: "super_admin"` can manage other admins;
  `editor` can manage products/orders/settings but not admins;
  `viewer` is read-only (enforced both in the UI and — for admin management —
  on the server).
