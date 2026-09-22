# Squirrel Nuts — Admin Frontend

Plain HTML / CSS / JavaScript admin panel (no build step, no framework) —
styled to match the Squirrel Nuts brand (cream background, teal + orange +
gold accents, Baloo 2 / Nunito fonts), same palette as the customer website.

## How to run it

This frontend talks to the `backend-admin` API. The simplest setup:

1. Start `backend-admin` first (`npm run dev` inside that folder, default
   port `5001`).
2. The backend already serves this frontend as static files, so just open:

   ```
   http://localhost:5001
   ```

   No separate server needed for the frontend.

### Running it on a different port (optional)

If you'd rather open these HTML files with a different static server (e.g.
VS Code "Live Server" on port `5500`), tell `script.js` where the API lives
by setting this **before** `script.js` loads, in every HTML file's `<head>`:

```html
<script>window.API_BASE = "http://localhost:5001/api";</script>
<script src="script.js"></script>
```

## Pages

| File                  | Purpose |
|------------------------|---------|
| `login.html`            | Admin login |
| `register.html`         | Create a new admin account |
| `forgot-password.html`  | Reset password via email + phone |
| `dashboard.html`        | Revenue, orders, products, customers stats |
| `products.html`         | Add / edit / delete products, upload & replace images, set stock, active/featured, price |
| `orders.html`           | View & update order status |
| `customers.html`        | View / remove customers |
| `contacts.html`         | Contact-form messages |
| `subscribers.html`      | Newsletter subscribers |
| `settings.html`         | Profile, password, **Store Announcement & Festival Offer banner**, manage other admins |

## Login / logout

- Login stores a JWT in `localStorage` (`adminToken`, `adminUser`).
- Every page (except `login.html`, `register.html`, `forgot-password.html`)
  checks `checkAdminAuth()` on load and redirects to `login.html` if there's
  no valid token.
- Click **Logout** in the sidebar to clear the session and return to login.

## Managing products (images, stock, out-of-stock)

Open **Products → + Add Product** (or **Edit** on an existing row):

- Upload a new photo any time — it replaces the old one and updates the URL
  automatically ("Primary Image Upload" / "Secondary Image Upload").
- Set **Stock** to `0` to mark a product out of stock — it's flagged with a
  red *"Out of stock"* badge in the table, and the public API
  (`/api/public/products`) will report `inStock: false` for it, so your
  customer site can show "Product out of stock" when someone tries to add it
  to their cart.

## Festival offer banner

Open **Settings → Store Announcement & Festival Offer**:

- Turn the banner on/off, set a title, message, and discount percentage
  (e.g. *"Diwali is coming! 10% off everything"*).
- A live preview shows exactly what customers will see.
- Saving updates `/api/admin/settings/site`, which your customer website
  reads from `/api/public/settings` (no login required) to render the banner.

## Roles

- **admin / super_admin** — full access, can manage other admins.
- **editor** — can manage products, orders, customers, messages, settings —
  cannot manage other admin accounts.
- **viewer** — read-only; action buttons are hidden automatically.
