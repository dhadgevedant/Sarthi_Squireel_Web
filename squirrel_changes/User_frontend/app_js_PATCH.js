/**
 * PATCHES for User_frontend/assets/app.js
 * Apply each section to the indicated area of your existing app.js
 * ─────────────────────────────────────────────────────────────────
 */

/* ── PATCH 1: SITE_IMAGE_KEYS (§1.3 key rename) ──────────────────────────────
 * Find the existing SITE_IMAGE_KEYS object (~line 20) and replace
 * about_story_image_main / about_story_image_over with these 4 keys:
 */
const SITE_IMAGE_KEYS_ADDITIONS = {
  // Homepage story teaser (was: aboutStoryMain / aboutStoryOver — REMOVE THOSE)
  homeJarImage:     'home_jar_image',
  homeProteinImage: 'home_protein_image',
  // About / Our Story page
  storyJarImage:     'story_jar_image',
  storyProteinImage: 'story_protein_image',
};
// Also remove: aboutStoryMain / aboutStoryOver from the SITE_IMAGE_KEYS object.


/* ── PATCH 2: resolveImg() — fix port detection (§2.2) ───────────────────────
 * Replace your existing resolveImg function with this version.
 * The old version hard-codes port 5000 on non-standard ports, which breaks
 * behind reverse proxies and on production hosts using port 80/443.
 */
function resolveImg(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // On standard ports (80/443) window.location.port is empty string — use
  // origin directly. Only fall back to :5000 when running on localhost in dev.
  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const devPort = window.location.port || '5000';

  const base = isLocalDev
    ? `${window.location.protocol}//${window.location.hostname}:${devPort}`
    : window.location.origin;

  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}


/* ── PATCH 3: Announcement bar — add truck icon (§3) ─────────────────────────
 * Find the section in app.js that sets announceEl.innerHTML (~line 126).
 * Replace the inner template literal so it prepends the truck icon.
 *
 * BEFORE (example — your exact text may vary slightly):
 *   announceEl.innerHTML = `${data.announcementText} · <span>📞 +91 70833 73681</span>`;
 *
 * AFTER:
 */
function renderAnnounceBar(announceEl, data) {
  const truckSvg = `<svg class="truck-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>`;

  if (data && data.announcementText) {
    announceEl.innerHTML = `${truckSvg} ${data.announcementText} &middot; <span>📞 +91 70833 73681</span>`;
    announceEl.style.display = '';
  }
}
// Call renderAnnounceBar(announceEl, data) in the place where you currently
// set announceEl.innerHTML directly. Remove or replace the old assignment.


/* ── PATCH 4: Dynamic categories for homepage tiles (§5.7) ───────────────────
 * Add this function, then call it from your DOMContentLoaded / init block.
 * It fetches active categories + their SiteImage and renders the tile grid
 * dynamically so new admin categories appear automatically.
 *
 * Prerequisites:
 *  - A public endpoint GET /api/categories (see User_backend patch)
 *  - A public endpoint GET /api/site-images (returns array of {key, imageUrl})
 *  - The tile container in index.html has id="categoryTilesGrid"
 */
async function renderHomepageCategoryTiles() {
  const grid = document.getElementById('categoryTilesGrid');
  if (!grid) return;

  try {
    const [catRes, imgRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/site-images'),
    ]);
    const { data: categories } = await catRes.json();
    const { data: siteImages }  = await imgRes.json();

    const imageMap = {};
    (siteImages || []).forEach(si => { imageMap[si.key] = si.imageUrl; });

    const activeCategories = (categories || []).filter(c => c.isActive);

    grid.innerHTML = activeCategories.map(cat => {
      const imgKey   = `category_${cat.slug}`;
      const uploaded = imageMap[imgKey] ? resolveImg(imageMap[imgKey]) : null;
      // data-default-src keeps the original asset as fallback
      const defaultSrc = `assets/images/category_${cat.slug}.jpg`;
      const src = uploaded || defaultSrc;

      return `
        <a href="shop.html?category=${cat.slug}" class="category-tile">
          <img
            src="${src}"
            data-image-key="${toCamelKey(cat.slug)}"
            data-default-src="${defaultSrc}"
            alt="${cat.name}"
            onerror="this.src=this.dataset.defaultSrc"
          />
          <span class="tile-label">${cat.name}</span>
        </a>`;
    }).join('');
  } catch (e) {
    console.warn('renderHomepageCategoryTiles failed:', e);
  }
}

// Helper: "trail_mix" → "trailMix" for data-image-key attribute
function toCamelKey(slug) {
  return slug.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}
