# Squirrel Nuts — Implementation Patch Package

This package contains all new/changed files for the audit items.
Apply them to your project as described below.

---

## Files in this package

### admin-backend/
- `models/Category.js` — **NEW** Category mongoose model
- `models/Product.js` — **REPLACE** category field (remove enum, use plain String)
- `controllers/categoryController.js` — **NEW** CRUD + seeder
- `controllers/siteImageController_PATCH.js` — Add 4 new keys to your defaults map
- `routes/categoryRoutes.js` — **NEW** admin category API routes
- `server_js_PATCH.js` — Instructions to mount routes + seed in server.js

### admin-frontend/
- `settings_html_ADDITIONS.html` — Insert into settings.html: new image sections + Categories panel
- `script_js_ADDITIONS.js` — Add to script.js: category management, dropdown, preview fixes

### User_frontend/
- `shipping-policy.html` — **NEW** page
- `returns-cancellation.html` — **NEW** page
- `privacy-policy.html` — **NEW** page
- `HTML_PATCHES.md` — Find-and-replace guide for index.html, about.html, all pages (announce bar, footer)
- `app_js_PATCH.js` — Patches for SITE_IMAGE_KEYS, resolveImg(), announce bar, dynamic tiles
- `style_additions.css` — Append to assets/style.css
- `User_backend_categoryRoutes_public.js` — Copy to User_backend/routes/categoryRoutes.js

---

## Apply order (safest sequence)

1. **backend first**: add `Category.js` model → `categoryController.js` → `categoryRoutes.js` → patch `server.js`
2. **patch Product.js** category field
3. **patch siteImageController.js** with the 4 new image keys
4. **start the server once** — `seedDefaultCategories()` runs and populates the DB
5. **admin frontend**: insert the HTML additions into `settings.html`, add the JS additions to `script.js`
6. **User frontend**: apply `HTML_PATCHES.md` changes, append CSS, copy the 3 policy pages, patch `app.js`
7. Run the QA checklist from the original audit document
