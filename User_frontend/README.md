# Squirrel Nuts — User_frontend

The storefront. Was a fully static HTML demo (hardcoded products, cart
button that just incremented a counter, forms that showed a toast and did
nothing). Now wired to the real API in `User_backend`.

## Run it

This package has no build step — it's plain HTML/CSS/JS. The easiest way
to run it is to let `User_backend` serve it (see that package's README):
unzip this folder as a **sibling** of `User_backend` named `User_frontend`,
start the backend, and open `http://localhost:5000`.

(You can also open the .html files directly for design/layout review, but
the API calls will fail unless the backend is reachable at `/api` — same
reason to prefer running via the backend's static file server.)

## What changed

- **`assets/app.js`** replaces `assets/static.js`. Every page now talks to
  the real backend: products load from MongoDB, Add to Cart hits
  `POST /api/cart`, Quick View reads live product data, the contact form
  posts to `/api/contact`, the newsletter form posts to `/api/subscribe`.
- **`shop.html`** — product grid and category filters (Cookies, Spreads &
  Butters, Bars, Brownies & Cakes, Gift Hampers, Trail Mix & Seeds) are now
  live, backed by `GET /api/products?category=`.
- **`product.html`** — fully dynamic; reads `?slug=...` from the URL and
  renders whichever product that is. No more "No description available" —
  falls back to a friendly generic line if a product's description is
  ever left blank in the admin. Shows **stock status** (Available / Out of
  Stock), not a raw count, per your requirement.
- **`cart.html`** and **`checkout.html`** are new pages — the original
  upload had a cart icon but no actual cart or checkout page. Cart shows
  live items, quantity controls, and the real shipping fee (calculated by
  weight). Checkout requires all shipping fields (name, phone, address,
  city, state, pincode) and has Cash on Delivery live, with Online Payment
  shown as "coming soon" until you provide gateway credentials.
- **Quick View → "View More Details"** now links to the actual product's
  page (it was hardcoded to the same URL for every product before).
- **"Healthy Category" USP box** added beside "All-Natural" on the home
  page, per your requirement #8.
- **More FAQs added**: shipping cost calculation, payment methods,
  cancellation/returns.
- Removed the unused static demo script.

## Already in this file when I received it (confirmed, not re-done)

10+ snack varieties wording, "© Squirrel Nuts and Sartthi" footer credit,
Shraddha listed as co-founder, no map or "Visit Us" on the contact page.

## Things I could not do without more from you

- **Real product photography** and a **logo file** — I can't fabricate
  your actual brand photos/logo; send them over and I'll drop them in.
- **Home page colour palette** — this was listed as a "to-do / ideas"
  item on your side, not a specific instruction, so I left the current
  palette in place rather than guessing at a new one.
- **FSSAI license number / icon** — footer already says "FSSAI Licensed,"
  happy to add the actual badge/number once you share it.
