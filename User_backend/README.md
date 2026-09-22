# Squirrel Nuts — User_backend

Express + MongoDB API for the storefront. Fixed, extended, and wired to the
User_frontend package.

## Setup

```bash
cd User_backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET for your setup
npm run seed            # loads 8 products + shipping rules into MongoDB
npm run dev              # or: npm start
```

Folder layout expected on disk (so the backend can serve the storefront on
one origin, avoiding CORS entirely):

```
squirrelnuts/
  User_backend/    ← this package
  User_frontend/   ← the other package, unzipped as a sibling folder
```

Visit `http://localhost:5000` — index.html etc. are served by this backend,
and every page talks to `/api/...` on the same origin. If you keep the
frontend folder under a different name, set `FRONTEND_DIR=your-folder-name`
in `.env`.

## What was fixed

1. **Checkout crash (bug)** — `orderController.createOrder` referenced a
   `cart` variable that was declared inside an `if/else` block and so was
   out of scope afterward. Any checkout that used the saved cart (rather
   than a guest cart passed in the request body) threw `cart is not
   defined` and failed. Fixed by declaring `cart` in the outer scope.
2. **Admin stats bug** — `getStats` read `Order.totalAmount` and
   `Contact.resolved`, but those fields don't exist on the schemas
   (`grandTotal` and `isResolved` do), so revenue and unresolved-message
   counts always showed 0. Fixed.
3. **Hardcoded shipping fee** — checkout used a flat `₹49` (free over
   ₹499) regardless of what was actually ordered. Replaced with a real
   weight-based shipping engine (see below).

## New: weight-based shipping (client requirement #4)

- `models/ShippingRule.js` — weight-band tiers (`minWeightGrams` →
  `maxWeightGrams` → `fee`) plus a settings doc for the free-shipping
  threshold and a fallback fee.
- `GET /api/shipping/calculate?weightGrams=&amount=` — public, used by the
  cart page to show the fee live.
- `GET /api/shipping/rules` — public, read-only chart of active tiers.
- `GET/POST/PUT/DELETE /api/admin/shipping` — admin-only CRUD so rates can
  be updated any time from the (future) admin panel, without a code
  deploy. `PUT /api/admin/shipping/settings` updates the free-shipping
  threshold / fallback fee.
- `Order` checkout now computes `shippingFee` from this engine using the
  total weight of everything in the cart (`Product.weightGrams × qty`).
- Seeded default tiers: ≤500g ₹49, 501g–1kg ₹79, 1–2kg ₹119, above 2kg
  ₹179, free shipping over ₹499 subtotal. Edit via the admin routes above.

## New: guest checkout

The frontend had no login page, and every cart/order endpoint requires a
logged-in user. Rather than block "Add to Cart" behind a signup form,
`POST /api/auth/guest { deviceId }` creates (or reuses) a lightweight guest
account keyed to a random id the browser stores in `localStorage`. A
visitor who wants to log in for real can still do so — the frontend's
"Login" link opens a login/signup modal that calls the existing
`/api/auth/login` and `/api/auth/register` endpoints.

## New: product fields

- `Product.weightGrams` (Number) — used by the shipping calculator.
- `Product.stockStatus` (virtual: `"in_stock"` / `"out_of_stock"`) — the
  storefront shows availability, not the exact stock count, per client
  requirement #5. The raw `stock` number is still on the model for admin
  use.

## Still required from you (not code-fixable)

- A payment gateway integration (Razorpay/Stripe/etc.) needs your live
  merchant credentials — the checkout flow is ready to plug one in
  (`paymentMethod: "online"` is already reserved in the schema and the
  checkout UI has a disabled placeholder for it).
- Automated transactional emails / CRM — needs you to pick a provider
  (e.g. SendGrid, Zoho) and give me an API key; happy to wire it in once
  you have one.
- The full **admin panel** (per-product management, festival discount
  campaigns, etc.) is a separate build, as discussed — this delivery is
  scoped to "make the storefront + backend fully work together."

## Sanity-checked

Every file was run through `node --check` (syntax) and a full
require-graph load (catches typo'd imports/exports). I don't have network
access to spin up a live MongoDB in this environment, so please run
`npm run seed` and click through Shop → Add to Cart → Checkout once on
your machine before going live — that's the one thing I couldn't verify
end-to-end myself.
