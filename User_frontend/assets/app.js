/* Squirrel Nuts — live frontend, talks to the Express/MongoDB backend at /api */
const API_BASE = window.API_BASE || (() => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return '/api';
})();

function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const isLocalDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const devPort = window.location.port || '5000';

  const base = isLocalDev
    ? `${window.location.protocol}//${window.location.hostname}:${devPort}`
    : window.location.origin;

  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}

const publicSiteImages = {};
const SITE_IMAGE_KEYS = {
  homeCookie: 'home_cookie_image',
  categoryCookies: 'category_cookies',
  categorySpreads: 'category_spreads',
  categoryBars: 'category_bars',
  categoryCakes: 'category_cakes',
  categoryGiftHampers: 'category_gift_hampers',
  categoryTrailMix: 'category_trail_mix',
  homeJarImage: 'home_jar_image',
  homeProteinImage: 'home_protein_image',
  storyJarImage: 'story_jar_image',
  storyProteinImage: 'story_protein_image',
};

async function loadPublicSiteImages() {
  try {
    const res = await fetch(`${API_BASE}/public/site-images`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load site images');
    Object.assign(publicSiteImages, data.images || {});
    applySiteImages();
  } catch (err) {
    console.error('Failed to load site images:', err);
  }
}

function applySiteImages() {
  document.querySelectorAll('[data-image-key]').forEach((img) => {
    const attr = img.dataset.imageKey;
    const lookup = SITE_IMAGE_KEYS[attr] || attr;
    const src = publicSiteImages[lookup];
    // store the original/default src so we can fall back if uploaded image is missing
    if (!img.dataset.defaultSrc) img.dataset.defaultSrc = img.src || '';
    if (src) {
      img.onerror = function () {
        const def = img.dataset.defaultSrc || '';
        try { img.onerror = null; } catch (e) {}
        img.src = def ? ( /^(https?:)?\/\//i.test(def) || def.startsWith('data:') ? def : resolveImg(def) ) : '';
      };
      img.src = resolveImg(src);
    } else {
      // if no uploaded image for this key, ensure original default is used
      const def = img.dataset.defaultSrc || img.src || '';
      if (def) img.src = def;
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Page chrome: nav scroll state, burger menu, scroll reveal, counters    */
/* ---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  window.addEventListener("scroll", () => nav && nav.classList.toggle("scrolled", scrollY > 10), { passive: true });
  const burger = document.querySelector(".burger"), menu = document.querySelector(".menu");
  burger && burger.addEventListener("click", () => menu.classList.toggle("open"));

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));

  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
    let t0 = null;
    const step = (ts) => { if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1400, 1);
      el.textContent = Math.floor(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  document.querySelectorAll(".pd-thumbs img").forEach((t) => t.addEventListener("click", () => {
    document.querySelector(".pd-gal .main img").src = t.src;
    document.querySelectorAll(".pd-thumbs img").forEach((x) => x.classList.remove("on"));
    t.classList.add("on");
  }));

  refreshCartCount();
  wireNewsletterForms();
  wireContactForms();
  wireLoginNav();
  loadPublicSettings();
  loadPublicSiteImages();
  applyAuthUI();

  if (document.body.dataset.page === "shop") initShopPage();
  if (document.body.dataset.page === "home") initHomeFeatured();
  if (document.body.dataset.page === "product") initProductPage();
  if (document.body.dataset.page === "cart") initCartPage();
  if (document.body.dataset.page === "checkout") initCheckoutPage();
});

/* ---------------------- Authentication helpers ----------------------- */
function getUser() { try { return JSON.parse(localStorage.getItem('sn_user') || 'null'); } catch { return null; } }
function setUser(u) { if (!u) localStorage.removeItem('sn_user'); else localStorage.setItem('sn_user', JSON.stringify(u)); }
function isAuthenticated() { return !!localStorage.getItem('sn_user'); }
function clearAuth() { localStorage.removeItem('sn_token'); localStorage.removeItem('sn_user'); }

async function loadPublicSettings() {
  try {
    const res = await fetch(`${API_BASE}/public/settings`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load settings");

    const announceEl = document.querySelector(".announce");
    if (announceEl && data.announcementText) {
      const truckSvg = `<svg class="truck-ico" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
      const phone = data.supportPhone ? `📞 ${data.supportPhone}` : '';
      const phoneHtml = phone ? ` &middot; <span>${phone}</span>` : '';
      announceEl.innerHTML = `${truckSvg} ${data.announcementText}${phoneHtml}`;
    }

    if (data.supportPhone) {
      document.querySelectorAll('[data-dynamic-phone]').forEach(el => {
        el.textContent = data.supportPhone;
      });
    }

    if (data.supportEmail) {
      document.querySelectorAll('[data-dynamic-email]').forEach(el => {
        el.textContent = data.supportEmail;
      });
      document.querySelectorAll('a[data-dynamic-email]').forEach(el => {
        el.href = `mailto:${data.supportEmail}`;
      });
    }

    const offerBanner = document.getElementById("festivalOfferBanner");
    if (offerBanner) {
      if (data.offerEnabled) {
        offerBanner.classList.remove("hidden");
        const iconImg = data.offerStartIcon ? `<img src="${resolveImg(data.offerStartIcon)}" class="offer-icon-img" alt="" onerror="this.replaceWith('🎉')">` : `<span class="offer-emoji">🎉</span>`;
        const content = `${iconImg} <span class="offer-title">${data.offerTitle || "Festival Special"}</span> <span class="offer-text">${data.offerText || ""}</span> <span class="offer-pct">${data.offerPercent || 0}% OFF</span> ${iconImg}`;
        offerBanner.innerHTML = `<div class="marquee-track">${content} &nbsp;&nbsp;&nbsp; ${content} &nbsp;&nbsp;&nbsp; ${content} &nbsp;&nbsp;&nbsp; ${content}</div>`;
      } else {
        offerBanner.classList.add("hidden");
      }
    }

  } catch (err) {
    console.error("Failed to load public settings:", err);
  }
}

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

function getUser() { try { return JSON.parse(localStorage.getItem('sn_user') || 'null'); } catch { return null; } }
function setUser(u) { if (!u) localStorage.removeItem('sn_user'); else localStorage.setItem('sn_user', JSON.stringify(u)); }
function isAuthenticated() { return !!localStorage.getItem('sn_user'); }
function clearAuth() { localStorage.removeItem('sn_token'); localStorage.removeItem('sn_user'); }

function applyAuthUI() {
  const user = getUser();
  document.querySelectorAll('.menu a').forEach((a) => {
    if (a.textContent.trim() !== 'Login') return;
    if (user) {
      const name = (user.name || user.email || 'User').split(' ')[0];
      const initial = (user.name && user.name.charAt(0).toUpperCase()) || (user.email && user.email.charAt(0).toUpperCase()) || 'U';
      const userA = document.createElement('a');
      userA.href = '#';
      userA.className = 'user-link';
      userA.innerHTML = `<span class="avatar" style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#f1c40f;color:#6d4f3a;text-align:center;line-height:28px;margin-right:6px;font-weight:800">${initial}</span><span class="user-name">${name}</span>`;
      userA.addEventListener('click', (e) => { e.preventDefault(); openProfileModal(); });
      a.replaceWith(userA);
    } else {
      a.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
    }
  });
}

function openProfileModal() {
  let ov = document.querySelector('.profile-overlay');
  if (!ov) {
    ov = document.createElement('div'); ov.className = 'qv-overlay profile-overlay';
    ov.innerHTML = `<div class="qv-modal" style="position:relative;max-width:420px">
      <button class="qv-close" onclick="this.closest('.qv-overlay').classList.remove('open')">✕</button>
      <div class="qv-body" style="width:100%">
        <h3 style="margin-bottom:6px">Your Profile</h3>
        <form id="profileForm">
          <div class="fg"><label>Name</label><input id="profileName"></div>
          <div class="fg"><label>Phone</label><input id="profilePhone"></div>
          <div class="fg"><label>Current Password</label><input id="profileCurrentPassword" type="password" minlength="6" placeholder="Required to change password"></div>
          <div class="fg"><label>New Password</label><input id="profileNewPassword" type="password" minlength="6" placeholder="Leave blank to keep current"></div>
          <div style="display:flex;gap:10px;margin-top:10px">
            <button type="button" class="btn" id="profileSaveBtn" style="flex:1">Save</button>
            <button type="button" class="btn" id="profileLogoutBtn" style="flex:1;background:#f8d7da;color:#721c24;border:none;">Logout</button>
          </div>
        </form>
      </div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });

    ov.querySelector('#profileSaveBtn').addEventListener('click', async () => {
      try {
        const payload = {
          name: document.getElementById('profileName').value.trim(),
          phone: document.getElementById('profilePhone').value.trim(),
        };
        const newPassword = document.getElementById('profileNewPassword').value;
        const currentPassword = document.getElementById('profileCurrentPassword').value;
        if (newPassword) {
          if (!currentPassword) {
            toast('Current password is required to change your password');
            return;
          }
          payload.newPassword = newPassword;
          payload.currentPassword = currentPassword;
        }
        const data = await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
        setUser(data);
        toast('Profile updated');
        ov.classList.remove('open');
        applyAuthUI();
      } catch (err) { toast(err.message); }
    });

    ov.querySelector('#profileLogoutBtn').addEventListener('click', () => {
      if (confirm('Logout?')) { clearAuth(); location.reload(); }
    });
  }
  const u = getUser();
  if (u) {
    document.getElementById('profileName').value = u.name || '';
    document.getElementById('profilePhone').value = u.phone || '';
    document.getElementById('profileCurrentPassword').value = '';
    document.getElementById('profileNewPassword').value = '';
  }
  ov.classList.add('open');
}

/* ---------------------------------------------------------------------- */
/* Auth: silent guest account so Cart/Checkout work with no login screen  */
/* (a returning visitor can still log in for real via the nav "Login")    */
/* ---------------------------------------------------------------------- */
function uuid() {
  return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

async function ensureAuth() {
  let token = localStorage.getItem("sn_token");
  if (token) return token;

  let deviceId = localStorage.getItem("sn_device");
  if (!deviceId) { deviceId = uuid(); localStorage.setItem("sn_device", deviceId); }

  const res = await fetch(`${API_BASE}/auth/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });
  if (!res.ok) throw new Error("Could not start a session — please refresh and try again.");
  const data = await res.json();
  localStorage.setItem("sn_token", data.token);
  setUser({ name: data.name, email: data.email, phone: data.phone, isGuest: data.isGuest });
  return data.token;
}

async function apiFetch(path, options = {}) {
  const token = await ensureAuth();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function wireLoginNav() {
  document.querySelectorAll('a.js-login, .menu a[href="#"]').forEach((a) => {
    if (a.textContent.trim() !== "Login") return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openLoginModal();
    });
  });
}

function openLoginModal() {
  let ov = document.querySelector(".auth-overlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.className = "qv-overlay auth-overlay";
    ov.innerHTML = `<div class="qv-modal" style="position:relative;max-width:380px">
      <button class="qv-close" onclick="this.closest('.qv-overlay').classList.remove('open')">✕</button>
      <div class="qv-body" style="width:100%">
        <h3 style="margin-bottom:6px">Log in or create an account</h3>
        <p style="color:#6d4f3a;font-size:.85rem;margin-bottom:14px">Track your orders across visits. You can keep shopping as a guest too — this is optional.</p>
        <form id="authForm">
          <div class="fg"><label>Name (new account only)</label><input id="authName"></div>
          <div class="fg"><label>Email *</label><input id="authEmail" type="email" required></div>
          <div class="fg"><label>Password *</label><input id="authPassword" type="password" required minlength="6"></div>
          <div style="display:flex;gap:10px;margin-top:10px">
            <button type="button" class="btn" id="authLoginBtn" style="flex:1">Log In</button>
            <button type="button" class="btn teal" id="authRegisterBtn" style="flex:1">Sign Up</button>
          </div>
        </form>
      </div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.remove("open"); });

    ov.querySelector("#authLoginBtn").addEventListener("click", () => submitAuth("login"));
    ov.querySelector("#authRegisterBtn").addEventListener("click", () => submitAuth("register"));
  }
  ov.classList.add("open");
}

async function submitAuth(mode) {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const name = document.getElementById("authName").value.trim();
  if (!email || !password) { toast("Email and password are required"); return; }
  try {
    const body = mode === "register" ? { name: name || "Squirrel Nuts Customer", email, password } : { email, password };
    const res = await fetch(`${API_BASE}/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not authenticate");
    localStorage.setItem("sn_token", data.token);
    setUser({ name: data.name, email: data.email, phone: data.phone });
    document.querySelector(".auth-overlay").classList.remove("open");
    toast(`Welcome${data.name ? ", " + data.name : ""}! 🐿️`);
    refreshCartCount();
    applyAuthUI();
  } catch (err) {
    toast(err.message);
  }
}

/* ---------------------- Auth UI helpers ----------------------- */
function applyAuthUI() {
  const user = getUser();
  document.querySelectorAll('.menu a').forEach((a) => {
    if (a.textContent.trim() === 'Login') {
      if (user) {
        const name = (user.name || user.email || 'User').split(' ')[0];
        const initial = (user.name && user.name.charAt(0).toUpperCase()) || (user.email && user.email.charAt(0).toUpperCase()) || 'U';
        const userA = document.createElement('a');
        userA.href = '#';
        userA.className = 'user-link';
        userA.innerHTML = `<span class="avatar" style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#f1c40f;color:#6d4f3a;text-align:center;line-height:28px;margin-right:6px;font-weight:800">${initial}</span><span class="user-name">${name}</span>`;
        userA.addEventListener('click', (e) => { e.preventDefault(); openProfileModal(); });
        a.replaceWith(userA);
      } else {
        a.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
      }
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Cart                                                                    */
/* ---------------------------------------------------------------------- */
async function refreshCartCount() {
  try {
    const { cart } = await apiFetch("/cart");
    const count = (cart.items || []).filter((i) => i.product).reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll(".cart-btn .count").forEach((el) => (el.textContent = count));
    return cart;
  } catch (err) {
    return null;
  }
}

async function isInCart(productId) {
  try {
    const { cart } = await apiFetch("/cart");
    return (cart.items || []).some((i) => i.product && i.product._id === productId);
  } catch {
    return false;
  }
}

async function refreshProductCartStates() {
  const btns = document.querySelectorAll(".add-btn[data-product-id]");
  if (!btns.length) return;
  const ids = Array.from(btns).map((b) => b.dataset.productId);
  try {
    const { cart } = await apiFetch("/cart");
    const inCart = new Set((cart.items || []).filter((i) => i.product).map((i) => i.product._id));
    btns.forEach((btn) => {
      const id = btn.dataset.productId;
      if (inCart.has(id)) {
        btn.disabled = true;
        btn.innerHTML = "✓ Added to Cart";
        btn.style.opacity = ".7";
        btn.style.cursor = "not-allowed";
      } else {
        btn.disabled = false;
        btn.innerHTML = "🛒 Add to Cart";
        btn.style.opacity = "";
        btn.style.cursor = "";
      }
    });
  } catch {
    // leave buttons as-is on failure
  }
}

async function addToCart(productId, quantity = 1, btn) {
  try {
    const { cart } = await apiFetch("/cart");
    const existingIds = (cart.items || []).filter((i) => i.product).map((i) => String(i.product._id));
    const alreadyThere = existingIds.includes(String(productId));
    if (!alreadyThere) {
      await apiFetch("/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
    }
    toast("✓ Added to cart!");
    const newCart = await refreshCartCount();
    const c = document.querySelector(".cart-btn .count");
    if (c) c.animate([{ transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 300 });
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "✓ Added to Cart";
      btn.style.opacity = ".7";
      btn.style.cursor = "not-allowed";
    }
    await refreshProductCartStates();
    return newCart;
  } catch (err) {
    toast(err.message);
  }
}

async function removeFromCart(productId) {
  try {
    await apiFetch(`/cart/${productId}`, { method: "DELETE" });
    await refreshCartCount();
    const btns = document.querySelectorAll(`.add-btn[data-product-id="${productId}"]`);
    btns.forEach((btn) => {
      btn.disabled = false;
      btn.innerHTML = "🛒 Add to Cart";
      btn.style.opacity = "";
      btn.style.cursor = "";
    });
  } catch (err) {
    toast(err.message);
  }
}

/* ---------------------------------------------------------------------- */
/* Products: rendering + quick view                                       */
/* ---------------------------------------------------------------------- */
const CATEGORY_LABELS = {
  cookies: "Cookies",
  spreads: "Spreads & Butters",
  bars: "Nutritional Bars",
  cakes: "Brownies & Cakes",
  giftbox: "Gift Hampers",
  trailmix: "Trail Mix & Seeds",
};

function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

function productCardHTML(p, i) {
  const catLabel = CATEGORY_LABELS[p.category] || p.category;
  const discount = p.discountPercent > 0 ? `<span class="badge">-${p.discountPercent}%</span>` : "";
  const oldPrice = p.priceOld && p.priceOld > p.priceNew ? `<s>${money(p.priceOld)}</s>` : "";
  const link = `product.html?slug=${encodeURIComponent(p.slug)}`;
  const desc = (p.description || "").replace(/"/g, "&quot;");

  return `<div class="pcard rv in d${i % 4}">
    ${discount}
    <a href="${link}" class="imgbox"><img class="main" src="${p.images.primary}" alt="${p.name}" loading="lazy">${p.images.secondary ? `<img class="alt" src="${p.images.secondary}" alt="" loading="lazy">` : ""}</a>
    <div class="body"><span class="cat">${catLabel}</span>
      <h3><a href="${link}">${p.name}${p.weight ? " – " + p.weight : ""}</a></h3>
      <div class="price">${oldPrice}<b>${money(p.priceNew)}</b></div>
      <button class="qv-btn" onclick='quickViewProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})'>👁 Quick View</button>
      ${p.stockStatus === "out_of_stock"
        ? `<button class="add-btn" disabled style="opacity:.5;cursor:not-allowed">Out of Stock</button>`
        : `<button class="add-btn" data-product-id="${p._id}" onclick="addToCart('${p._id}', 1, this)">🛒 Add to Cart</button>`}
    </div>
  </div>`;
}

async function quickViewProduct(p) {
  const catLabel = CATEGORY_LABELS[p.category] || p.category;
  let ov = document.querySelector(".qv-overlay:not(.auth-overlay)");
  if (!ov) {
    ov = document.createElement("div"); ov.className = "qv-overlay";
    ov.innerHTML = '<div class="qv-modal" style="position:relative">'
      + '<button class="qv-close" onclick="this.closest(\'.qv-overlay\').classList.remove(\'open\')">✕</button>'
      + '<div class="qv-img"><img></div>'
      + '<div class="qv-body"><span class="cat" style="font-size:.72rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--sky)"></span>'
      + '<h3></h3><div class="qv-price"><b></b><s></s></div><p></p>'
      + '<button class="add-btn qv-add">🛒 Add to Cart</button>'
      + '<a class="qv-more">View More Details →</a></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.remove("open"); });
  }
  ov.querySelector(".qv-img img").src = p.images.primary;
  ov.querySelector(".cat").textContent = catLabel;
  ov.querySelector("h3").textContent = p.name + (p.weight ? ` – ${p.weight}` : "");
  ov.querySelector(".qv-price b").textContent = money(p.priceNew);
  const s = ov.querySelector(".qv-price s");
  s.textContent = p.priceOld && p.priceOld > p.priceNew ? money(p.priceOld) : "";
  s.style.display = s.textContent ? "" : "none";
  ov.querySelector("p").textContent = p.description || "";
  ov.querySelector(".qv-more").href = `product.html?slug=${encodeURIComponent(p.slug)}`;
  const addBtn = ov.querySelector(".qv-add");
  addBtn.onclick = async () => {
    await addToCart(p._id, 1, addBtn);
    await refreshProductCartStates();
  };
  if (await isInCart(p._id)) {
    addBtn.disabled = true;
    addBtn.innerHTML = "✓ Added to Cart";
    addBtn.style.opacity = ".7";
    addBtn.style.cursor = "not-allowed";
  }
  ov.classList.add("open");
}

/* ---------------------------------------------------------------------- */
/* Shop page                                                              */
/* ---------------------------------------------------------------------- */
async function initShopPage() {
  const grid = document.querySelector(".grid.c4");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  let activeCategory = params.get("category") || "all";

  document.querySelectorAll(".chip-f").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = chip.dataset.category || "all";
      activeCategory = cat;
      document.querySelectorAll(".chip-f").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const url = new URL(location.href);
      cat === "all" ? url.searchParams.delete("category") : url.searchParams.set("category", cat);
      history.replaceState(null, "", url);
      loadProducts(cat);
    });
    if (chip.dataset.category === activeCategory || (activeCategory === "all" && !chip.dataset.category)) {
      document.querySelectorAll(".chip-f").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    }
  });

  async function loadProducts(category) {
    grid.innerHTML = `<p style="padding:40px 0;text-align:center;color:#9a7a5f">Loading products…</p>`;
    try {
      const qs = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
      const res = await fetch(`${API_BASE}/products${qs}`);
      const data = await res.json();
      if (!data.products || !data.products.length) {
        grid.innerHTML = `<p style="padding:40px 0;text-align:center;color:#9a7a5f">No products in this category yet.</p>`;
        return;
      }
      grid.innerHTML = data.products.map((p, i) => productCardHTML(p, i)).join("");
      await refreshProductCartStates();
    } catch (err) {
      grid.innerHTML = `<p style="padding:40px 0;text-align:center;color:#c0392b">Couldn't load products. Please refresh.</p>`;
    }
  }

  loadProducts(activeCategory);
}

/* ---------------------------------------------------------------------- */
/* Home page — featured products                                          */
/* ---------------------------------------------------------------------- */
async function initHomeFeatured() {
  const grid = document.querySelector(".grid.c4.js-featured");
  if (!grid) return;
  try {
    let res = await fetch(`${API_BASE}/products?featured=true`);
    let data = await res.json();
    if (!data.products || !data.products.length) {
      res = await fetch(`${API_BASE}/products`);
      data = await res.json();
    }
    grid.innerHTML = data.products.slice(0, 8).map((p, i) => productCardHTML(p, i)).join("");
    await refreshProductCartStates();
  } catch (err) {
    grid.innerHTML = `<p style="padding:40px 0;text-align:center;color:#c0392b">Couldn't load products. Please refresh.</p>`;
  }
}

/* ---------------------------------------------------------------------- */
/* Product detail page                                                    */
/* ---------------------------------------------------------------------- */
async function initProductPage() {
  const root = document.querySelector(".pd");
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const idOrSlug = params.get("slug") || params.get("id");
  if (!idOrSlug) { root.innerHTML = `<p>No product specified.</p>`; return; }

  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(idOrSlug)}`);
    const data = await res.json();
    if (!res.ok || !data.product) throw new Error("Product not found");
    const p = data.product;
    const catLabel = CATEGORY_LABELS[p.category] || p.category;

    document.title = `${p.name} — Squirrel Nuts`;
    document.querySelector(".crumb-current") && (document.querySelector(".crumb-current").textContent = p.name);

    document.querySelector(".pd-gal .main img").src = p.images.primary;
    document.querySelector(".pd-gal .main img").alt = p.name;
    const thumbsWrap = document.querySelector(".pd-thumbs");
    const thumbs = [p.images.primary, p.images.secondary].filter(Boolean);
    thumbsWrap.innerHTML = thumbs.map((src, i) => `<img src="${src}" class="${i === 0 ? "on" : ""}" alt="">`).join("");
    thumbsWrap.querySelectorAll("img").forEach((t) => t.addEventListener("click", () => {
      document.querySelector(".pd-gal .main img").src = t.src;
      thumbsWrap.querySelectorAll("img").forEach((x) => x.classList.remove("on"));
      t.classList.add("on");
    }));

    document.querySelector(".pd-info .cat").textContent = catLabel;
    document.querySelector(".pd-info h1").textContent = p.name + (p.weight ? ` – ${p.weight}` : "");
    document.querySelector(".pd-price b").textContent = money(p.priceNew);
    const oldEl = document.querySelector(".pd-price s");
    const saveEl = document.querySelector(".pd-price .save");
    if (p.priceOld && p.priceOld > p.priceNew) {
      oldEl.textContent = money(p.priceOld); oldEl.style.display = "";
      saveEl.textContent = `You save ${money(p.priceOld - p.priceNew)}`; saveEl.style.display = "";
    } else {
      oldEl.style.display = "none"; saveEl.style.display = "none";
    }

    const shortDesc = document.querySelector(".pd-short-desc");
    const longDesc = document.querySelector(".pd-long-desc");
    const desc = p.description && p.description.trim() ? p.description.trim() : `Freshly made by Squirrel Nuts using honest, wholesome ingredients.`;
    if (shortDesc) shortDesc.textContent = desc;
    if (longDesc) longDesc.textContent = desc;

    document.querySelectorAll(".pd-meta [data-field]").forEach((el) => {
      const field = el.dataset.field;
      if (field === "weight") el.textContent = p.weight || "—";
      if (field === "availability") {
        el.textContent = p.stockStatus === "out_of_stock" ? "✘ Out of Stock" : "✔ Available";
        el.style.color = p.stockStatus === "out_of_stock" ? "#c0392b" : "#1F8A4C";
      }
    });

    const addBtn = document.querySelector(".pd-add-btn");
    const buyBtn = document.querySelector(".pd-buy-btn");
    const qtyInput = document.querySelector(".qty input");
    if (p.stockStatus === "out_of_stock") {
      if (addBtn) { addBtn.disabled = true; addBtn.textContent = "Out of Stock"; addBtn.style.opacity = .5; }
      if (buyBtn) { buyBtn.style.pointerEvents = "none"; buyBtn.style.opacity = .5; }
    } else {
      const alreadyInCart = await isInCart(p._id);
      if (addBtn) {
        addBtn.disabled = alreadyInCart;
        addBtn.textContent = alreadyInCart ? "✓ Added to Cart" : "🛒 Add to Cart";
        addBtn.style.opacity = alreadyInCart ? ".7" : "";
        addBtn.style.cursor = alreadyInCart ? "not-allowed" : "";
        if (!alreadyInCart) {
          addBtn.addEventListener("click", () => addToCart(p._id, Number(qtyInput?.value || 1), addBtn));
        }
      }
      if (buyBtn) {
        buyBtn.addEventListener("click", async (e) => {
          e.preventDefault();
          await addToCart(p._id, Number(qtyInput?.value || 1), addBtn);
          location.href = "cart.html";
        });
      }
    }
  } catch (err) {
    root.innerHTML = `<p style="padding:60px 0;text-align:center">Sorry, we couldn't find that product. <a href="shop.html">Back to Shop</a></p>`;
  }
}

/* ---------------------------------------------------------------------- */
/* Cart page                                                              */
/* ---------------------------------------------------------------------- */
async function initCartPage() {
  const list = document.querySelector(".cart-list");
  if (!list) return;
  await renderCartPage();
}

async function renderCartPage() {
  const list = document.querySelector(".cart-list");
  const summary = document.querySelector(".cart-summary");
  list.innerHTML = `<p style="padding:20px;color:#9a7a5f">Loading your cart…</p>`;

  let cartData;
  try {
    cartData = await apiFetch("/cart");
  } catch (err) {
    list.innerHTML = `<p style="padding:40px;text-align:center;color:#c0392b">Unable to load your cart. Please refresh.</p>`;
    summary.innerHTML = "";
    return;
  }

  const items = (cartData.cart && cartData.cart.items) || [];
  const validItems = items.filter((i) => i.product);

  if (!validItems.length) {
    list.innerHTML = `<p style="padding:40px 0;text-align:center;color:#9a7a5f">Your cart is empty or items are no longer available. <a href="shop.html">Start shopping →</a></p>`;
    summary.innerHTML = "";
    return;
  }

  if (validItems.length !== items.length) {
    toast('Some unavailable products were removed from your cart.');
  }

  list.innerHTML = validItems.map((i) => {
    const p = i.product;
    return `
      <div class="cart-row" data-id="${p._id}" style="display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #f0e4d8">
        <img src="${p.images.primary}" alt="${p.name}" style="width:64px;height:64px;object-fit:cover;border-radius:10px">
        <div style="flex:1">
          <b>${p.name}</b><br><span style="color:#9a7a5f;font-size:.85rem">${p.weight || ""} · ${money(p.priceNew)}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div style="min-width:70px;text-align:right"><b>${money(p.priceNew * i.quantity)}</b></div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="number" min="1" value="${i.quantity}" data-id="${p._id}" class="cart-qty" style="width:64px;padding:6px;border:1px solid #ddd;border-radius:6px">
            <button type="button" class="qv-close" data-action="remove" data-id="${p._id}" style="position:static">✕</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // wire up qty and remove handlers
  list.querySelectorAll('.cart-qty').forEach((input) => {
    input.addEventListener('change', (e) => {
      const id = input.dataset.id;
      let q = Number(input.value) || 1;
      if (q < 1) q = 1; input.value = q;
      updateQty(id, q);
    });
  });
  list.querySelectorAll('[data-action="remove"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeItem(id);
    });
  });

  const itemsTotal = validItems.reduce((s, i) => s + i.product.priceNew * i.quantity, 0);
  const totalWeight = validItems.reduce((s, i) => s + (i.product.weightGrams || 250) * i.quantity, 0);

  let shippingFee = 0;
  try {
    const shipRes = await fetch(`${API_BASE}/shipping/calculate?weightGrams=${totalWeight}&amount=${itemsTotal}`);
    const shipData = await shipRes.json();
    shippingFee = shipData.fee ?? 0;
  } catch (err) { /* fall back to 0 if the shipping endpoint is unreachable */ }

  summary.innerHTML = `
    <div class="fg" style="display:flex;justify-content:space-between"><span>Subtotal</span><b>${money(itemsTotal)}</b></div>
    <div class="fg" style="display:flex;justify-content:space-between"><span>Shipping</span><b>${shippingFee === 0 ? "FREE" : money(shippingFee)}</b></div>
    <div class="fg" style="display:flex;justify-content:space-between;font-size:1.15rem;border-top:1px solid #f0e4d8;padding-top:10px"><span>Total</span><b>${money(itemsTotal + shippingFee)}</b></div>
    <a href="checkout.html" class="btn teal" style="width:100%;text-align:center;margin-top:14px">Proceed to Checkout →</a>`;
}

async function updateQty(productId, quantity) {
  try {
    await apiFetch(`/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) });
    await refreshCartCount();
    await renderCartPage();
  } catch (err) { toast(err.message); }
}

async function removeItem(productId) {
  try {
    await apiFetch(`/cart/${productId}`, { method: "DELETE" });
    await refreshCartCount();
    await refreshProductCartStates();
    await renderCartPage();
  } catch (err) { toast(err.message); }
}

/* ---------------------------------------------------------------------- */
/* Checkout page                                                          */
/* ---------------------------------------------------------------------- */
async function initCheckoutPage() {
  const form = document.querySelector("#checkoutForm");
  if (!form) return;

  const { cart } = await apiFetch("/cart");
  if (!cart.items.length) {
    document.querySelector(".checkout-grid").innerHTML = `<p style="padding:40px;text-align:center">Your cart is empty. <a href="shop.html">Go shopping →</a></p>`;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const shippingAddress = {
      fullName: fd.get("fullName")?.trim(),
      phone: fd.get("phone")?.trim(),
      line1: fd.get("line1")?.trim(),
      city: fd.get("city")?.trim(),
      state: fd.get("state")?.trim(),
      pincode: fd.get("pincode")?.trim(),
    };
    const paymentMethod = fd.get("paymentMethod") || "cod";

    const missing = Object.entries(shippingAddress).filter(([, v]) => !v);
    if (missing.length) { toast("Please fill in all shipping fields — they're all required."); return; }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = "Placing order…";
    try {
      const { order } = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddress, paymentMethod }),
      });
      await apiFetch("/cart", { method: "DELETE" });
      await refreshCartCount();
      document.querySelector(".checkout-grid").innerHTML = `
        <div class="form-card rv in" style="grid-column:1/-1;text-align:center">
          <h3>🎉 Order placed!</h3>
          <p style="color:#6d4f3a">Order <b>#${order._id.slice(-8).toUpperCase()}</b> — ${money(order.grandTotal)} total.</p>
          <p style="color:#6d4f3a">We'll reach out on ${shippingAddress.phone} to confirm delivery.</p>
          <a href="shop.html" class="btn teal" style="margin-top:16px">Continue Shopping</a>
        </div>`;
    } catch (err) {
      toast(err.message);
      btn.disabled = false; btn.textContent = "Place Order";
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Contact + newsletter forms (generic — works on any page)               */
/* ---------------------------------------------------------------------- */
function wireContactForms() {
  document.querySelectorAll("form.js-contact-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: fd.get("name")?.trim(),
        email: fd.get("email")?.trim(),
        phone: fd.get("phone")?.trim(),
        message: fd.get("message")?.trim(),
      };
      if (!payload.name || !payload.email || !payload.message) { toast("Please fill in the required fields."); return; }
      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not send your message");
        toast("📨 " + data.message);
        form.reset();
      } catch (err) { toast(err.message); }
    });
  });
}

function wireNewsletterForms() {
  document.querySelectorAll("form.nl-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      try {
        const res = await fetch(`${API_BASE}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not subscribe");
        toast("🎉 " + data.message);
        form.reset();
      } catch (err) { toast(err.message); }
    });
  });
}
