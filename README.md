# Squirrel Nuts — Full Stack E-Commerce Project

This repository contains the complete Squirrel Nuts storefront + admin panel project.

## Project Structure

```
Sarthi_Squireel_Web/
├── User_backend/          # Customer-facing backend (port 5000)
│   ├── .env               # Server config (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example       # Template for .env
│   ├── server.js          # Entry point
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Route handlers
│   ├── routes/            # Express routers
│   └── public/            # Static files + uploaded images
│       └── uploads/       # Product & site images
│
├── User_frontend/         # Customer-facing website (served by User_backend)
│   ├── assets/
│   │   ├── app.js         # Frontend logic
│   │   └── style.css      # Styles
│   ├── index.html
│   ├── shop.html
│   ├── about.html
│   ├── faq.html
│   ├── contact.html
│   ├── cart.html
│   ├── checkout.html
│   ├── product.html
│   ├── shipping-policy.html
│   ├── returns-cancellation.html
│   └── privacy-policy.html
│
├── admin-backend/         # Admin panel backend (port 5001)
│   ├── .env               # Server config (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example       # Template for .env
│   ├── server.js          # Entry point
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Route handlers
│   ├── routes/            # Express routers
│   ├── middleware/        # Auth + error handling
│   └── public/
│       └── uploads/       # Admin-uploaded site images
│
└── admin-frontend/        # Admin panel UI (served by admin-backend)
    ├── settings.html
    ├── products.html
    ├── orders.html
    ├── dashboard.html
    ├── customers.html
    ├── contacts.html
    ├── subscribers.html
    └── script.js
```

## Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017/`

## Database Setup (Local MongoDB)

### 1. Install MongoDB Community Edition

Download and install MongoDB from https://www.mongodb.com/try/download/community

Or install via Chocolatey (Windows):
```powershell
choco install mongodb
```

### 2. Start MongoDB

Default data directory: `C:\data\db`

```powershell
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB
mongod --dbpath="C:\data\db"
```

Or if installed as a service:
```powershell
net start MongoDB
```

### 3. Create the Database

The database name is **`squirrelnuts`**. It will be created automatically when the first document is inserted. However, to verify it exists:

```powershell
# Open MongoDB shell
mongosh

# Show databases
show dbs

# Switch to squirrelnuts
use squirrelnuts

# Show collections (will be empty until seeded)
show collections
```

### 4. Configure Environment Files

Both backends already have `.env` files pointing to the local database. Verify they contain:

**admin-backend/.env**
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/squirrelnuts
JWT_SECRET=squirrelnuts_admin_secret_2026
JWT_EXPIRES_IN=7d
```

**User_backend/.env**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/squirrelnuts
JWT_SECRET=squirrelnuts_secret_2026
FRONTEND_DIR=User_frontend
```

> **Note:** Change `JWT_SECRET` values to your own random strings before going live.

## Installation & Running

### 1. Install Dependencies

```powershell
# User backend
cd User_backend
npm install

# Admin backend
cd ../admin-backend
npm install
```

### 2. Seed Initial Data

```powershell
# From User_backend directory - seeds products + shipping rules
cd User_backend
npm run seed

# From admin-backend directory - seeds default admin account
cd ../admin-backend
npm run seed
```

Default admin credentials:
```
email:    admin@squirrelnuts.in
password: Admin@123
```

### 3. Start the Servers

Open two separate terminals:

**Terminal 1 — User Backend (port 5000):**
```powershell
cd User_backend
npm run dev
# or: npm start
```

**Terminal 2 — Admin Backend (port 5001):**
```powershell
cd admin-backend
npm run dev
# or: npm start
```

## Access the Application

| URL | Purpose |
|-----|---------|
| http://localhost:5000 | Customer-facing storefront |
| http://localhost:5001 | Admin panel (login required) |
| http://localhost:5000/api/public/settings | Public settings API |
| http://localhost:5000/api/public/products | Public products API |
| http://localhost:5001/api/auth/login | Admin login API |

## Database Collections

The following collections are created automatically:

- `users` — Customer accounts
- `products` — Product catalog
- `categories` — Product categories
- `orders` — Customer orders
- `contacts` — Contact form submissions
- `subscribers` — Newsletter subscribers
- `settings` — Site settings singleton
- `siteimages` — Admin-uploaded homepage images
- `admins` — Admin accounts
- `shippingrules` — Weight-based shipping tiers

## Key Features

- **Dynamic Settings:** Announcement text, festival offers, support phone/email — all editable from Admin → Settings and reflected instantly on the storefront.
- **Category Management:** Admin can add/remove product categories from Settings. Categories appear automatically on the shop page and homepage.
- **Image Management:** Admin can upload site images (cookie pouch, category tiles, story page overlays) from Settings. Images are stored in `public/uploads/` and served statically.
- **Dynamic Footer:** Phone and email in the footer are pulled from admin settings — no code changes needed.
- **Policy Pages:** Shipping, Returns, and Privacy policy pages are included with editable links.

## Troubleshooting

**MongoDB not connecting:**
- Ensure `mongod` is running: `mongod --dbpath="C:\data\db"`
- Verify `MONGO_URI` in both `.env` files matches your MongoDB instance

**Port already in use:**
- Change `PORT` in `.env` files
- Or kill the process: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`

**Images not loading after upload:**
- Check that uploaded files exist in `User_backend/public/uploads/`
- Verify `resolveImg()` in `User_frontend/assets/app.js` uses `window.location.origin`

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens)
- **File Uploads:** Multer
