/**
 * ADDITIONS for admin-frontend/script.js
 *
 * 1. Category management (§5.4 + §5.5)
 * 2. Dynamic product category dropdown (§5.4)
 * 3. previewSiteImageUpload helper — ensures admin panel never pre-fills
 *    a live production image, only shows preview after file selection (§1.4)
 * 4. offerStartIcon save race-condition fix note (§2.1)
 */


/* ════════════════════════════════════════════════════════════════════════════
 * 1. CATEGORY MANAGEMENT
 * ══════════════════════════════════════════════════════════════════════════ */

// Call on page load (add to your existing DOMContentLoaded / init function)
async function loadCategories() {
  try {
    const res  = await fetch('/api/admin/categories', { headers: authHeaders() });
    const json = await res.json();
    renderCategoriesList(json.data || []);
  } catch (err) {
    console.error('loadCategories:', err);
  }
}

function renderCategoriesList(categories) {
  const list = document.getElementById('categoriesList');
  if (!list) return;

  if (!categories.length) {
    list.innerHTML = '<li class="empty-state">No categories yet.</li>';
    return;
  }

  list.innerHTML = categories.map(cat => `
    <li class="category-item ${cat.isActive ? '' : 'inactive'}" data-id="${cat._id}">
      <span class="cat-name">${cat.name}</span>
      <span class="cat-slug">${cat.slug}</span>
      <span class="cat-status">${cat.isActive ? '✅ Active' : '⏸ Inactive'}</span>
      <div class="cat-actions">
        ${cat.isActive
          ? `<button onclick="adminToggleCategory('${cat._id}', false)">Deactivate</button>`
          : `<button onclick="adminToggleCategory('${cat._id}', true)">Reactivate</button>`
        }
        <button class="danger" onclick="adminDeleteCategory('${cat._id}', '${cat.name}')">
          Delete
        </button>
      </div>
    </li>
  `).join('');
}

async function adminAddCategory() {
  const nameEl = document.getElementById('newCategoryName');
  const slugEl = document.getElementById('newCategorySlug');
  const name   = nameEl.value.trim();
  const slug   = slugEl.value.trim();

  if (!name) { alert('Please enter a category name.'); return; }

  try {
    const res  = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name, slug }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    nameEl.value = '';
    slugEl.value = '';
    await loadCategories();
    // Also refresh the category tile image slots so the new one appears
    await loadSiteImages && loadSiteImages();
    showToast(`Category "${name}" added.`);
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function adminToggleCategory(id, isActive) {
  try {
    const res  = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ isActive }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    await loadCategories();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function adminDeleteCategory(id, name) {
  if (!confirm(`Delete category "${name}"?\n\nIf products exist in this category, it will be deactivated instead.`)) return;

  try {
    const res  = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    if (json.softDeleted) {
      alert(`⚠️ ${json.message}`);
    } else {
      showToast(`Category "${name}" deleted.`);
    }
    await loadCategories();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Auto-fill slug from name as the user types
document.getElementById('newCategoryName')?.addEventListener('input', function () {
  const slugEl = document.getElementById('newCategorySlug');
  if (!slugEl.dataset.manuallyEdited) {
    slugEl.value = this.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
});
document.getElementById('newCategorySlug')?.addEventListener('input', function () {
  this.dataset.manuallyEdited = this.value ? '1' : '';
});


/* ════════════════════════════════════════════════════════════════════════════
 * 2. DYNAMIC PRODUCT CATEGORY DROPDOWN (§5.4)
 * Call populateCategoryDropdown() when the Add/Edit Product modal opens.
 * ══════════════════════════════════════════════════════════════════════════ */

async function populateCategoryDropdown(selectedSlug) {
  const select = document.getElementById('productCategorySelect'); // adjust ID to match yours
  if (!select) return;

  try {
    const res  = await fetch('/api/admin/categories', { headers: authHeaders() });
    const json = await res.json();
    const cats = (json.data || []).filter(c => c.isActive);

    select.innerHTML = `<option value="">— Select category —</option>` +
      cats.map(c =>
        `<option value="${c.slug}" ${c.slug === selectedSlug ? 'selected' : ''}>${c.name}</option>`
      ).join('');
  } catch (err) {
    console.error('populateCategoryDropdown:', err);
  }
}


/* ════════════════════════════════════════════════════════════════════════════
 * 3. SITE IMAGE PREVIEW — never pre-fill from live production URL (§1.4)
 * Replace any existing previewOfferIcon / inline onchange handlers with this.
 * ══════════════════════════════════════════════════════════════════════════ */

function previewSiteImageUpload(previewId, inputEl) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  const file = inputEl.files[0];
  if (!file) { preview.classList.add('hidden'); preview.src = ''; return; }

  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// Make sure on page load you do NOT pre-populate image previews from settings.
// In your existing loadSiteSettings() / initSettingsPage(), remove any lines like:
//   document.getElementById('somePreview').src = settings.homeHeroImage;
// The preview should only appear after a user chooses a new file.


/* ════════════════════════════════════════════════════════════════════════════
 * 4. OFFER ICON SAVE — race condition fix note (§2.1)
 *
 * In saveSiteSettings() (~line 853), ensure the image upload resolves BEFORE
 * the settings PUT fires. Pattern:
 *
 *   // ✅ CORRECT — await the upload first
 *   let startIconUrl = currentSettings.offerStartIcon; // keep existing if no new file
 *   const iconFile = document.getElementById('offerStartIconInput').files[0];
 *   if (iconFile) {
 *     const formData = new FormData();
 *     formData.append('image', iconFile);
 *     formData.append('key', 'offerStartIcon');
 *     const uploadRes = await fetch('/api/admin/settings/images/upload', {
 *       method: 'POST', headers: authHeaders(), body: formData,
 *     });
 *     const uploadJson = await uploadRes.json();
 *     if (uploadJson.success) startIconUrl = uploadJson.imageUrl;
 *   }
 *   // NOW fire the settings PUT with the resolved URL
 *   await fetch('/api/admin/settings/site', {
 *     method: 'PUT',
 *     headers: { 'Content-Type': 'application/json', ...authHeaders() },
 *     body: JSON.stringify({ ..., offerStartIcon: startIconUrl }),
 *   });
 *
 * ══════════════════════════════════════════════════════════════════════════ */


/* ════════════════════════════════════════════════════════════════════════════
 * UTILITY — returns auth headers (adjust to match your existing helper)
 * ══════════════════════════════════════════════════════════════════════════ */
function authHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Simple toast (if your project doesn't already have one)
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'admin-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
