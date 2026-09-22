const API_BASE = window.API_BASE || (() => {
  const host = window.location.hostname || '127.0.0.1';
  const port = window.location.port || '5001';
  const protocol = window.location.protocol.startsWith('http') ? window.location.protocol : 'http:';
  return `${protocol}//${host}${port ? `:${port}` : ''}/api`;
})();
window.API_BASE = API_BASE;

function resolveImg(url) {
  if (!url) return url;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  const host = API_BASE.replace(/\/api\/?$/, '');
  return url.startsWith('/') ? host + url : host + '/' + url;
}

const storage = {
  get(key) { return localStorage.getItem(key); },
  set(key, val) { localStorage.setItem(key, val); },
  remove(key) { localStorage.removeItem(key); }
};

const auth = {
  token: () => storage.get('adminToken'),
  user: () => JSON.parse(storage.get('adminUser') || 'null'),
  set(data) { storage.set('adminUser', JSON.stringify(data)); },
  clear() { storage.remove('adminToken'); storage.remove('adminUser'); }
};

function showToast(message, type = 'success') {
  let container = document.getElementById('adminToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'adminToastContainer';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span class="admin-toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('admin-toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function checkAdminAuth() {
  if (!auth.token() || !auth.user()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function adminLogout() {
  auth.clear();
  window.location.href = 'login.html';
}

async function apiCall(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token()}`,
        ...options.headers
      },
      ...options
    });
    if (res.status === 401 || res.status === 403) {
      alert('Session expired. Please login again.');
      auth.clear();
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  } catch (err) {
    console.error('API call failed', endpoint, err);
    throw err;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value;
      const phone = document.getElementById('forgotPhone').value;
      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        document.getElementById('tempPasswordDisplay').textContent = data.tempPassword;
        forgotForm.style.display = 'none';
        document.getElementById('forgotResult').style.display = 'block';
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('loginForm');
  const registerPage = document.getElementById('registerForm');

  if (loginPage) {
    loginPage.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { email, password } = loginPage;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        storage.set('adminToken', data.token);
        auth.set(data);
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert('Login failed: ' + err.message);
      }
    });
  }

  if (registerPage) {
    registerPage.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { name, email, password, phone } = registerPage;
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.value, email: email.value, password: password.value, phone: phone.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        storage.set('adminToken', data.token);
        auth.set(data);
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert('Registration failed: ' + err.message);
      }
    });
  }
});

if (document.querySelector('.admin-layout')) {
  document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;

    const user = auth.user();
    const nameEl = document.getElementById('adminUserName');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];

    const avatar = document.querySelector('.admin-avatar');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();

    const badge = document.querySelector('.admin-role-badge');
    if (badge) badge.textContent = (user.role || 'admin').charAt(0).toUpperCase() + (user.role || 'admin').slice(1);

    const hamburger = document.getElementById('adminHamburger');
    const sidebar = document.querySelector('.admin-sidebar');
    if (hamburger && sidebar) {
      hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    if (document.querySelector('#statRevenue')) loadDashboardStats();
    if (document.querySelector('#allOrdersBody')) loadAllOrders();
    if (document.querySelector('#allProductsBody')) loadAllProducts();
    if (document.querySelector('#allUsersBody')) loadAllCustomers();
    if (document.querySelector('#allMessagesBody')) loadAllMessages();
    if (document.querySelector('#allSubscribersBody')) loadAllSubscribers();
    if (document.querySelector('#settingsName')) loadAdminProfile();
    if (document.querySelector('#siteSettingsForm')) loadSiteSettings();
    if (document.querySelector('#adminsList')) loadAdminsList();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const chip = document.getElementById('adminUserChip');
  if (chip) chip.addEventListener('click', () => { window.location.href = 'settings.html'; });

  const revenueCard = document.getElementById('statCardRevenue');
  if (revenueCard) revenueCard.addEventListener('click', () => showStatsModal('revenue'));

  const ordersCard = document.getElementById('statCardOrders');
  if (ordersCard) ordersCard.addEventListener('click', () => { window.location.href = 'orders.html'; });

  const productsCard = document.getElementById('statCardProducts');
  if (productsCard) productsCard.addEventListener('click', () => { window.location.href = 'products.html'; });

  const customersCard = document.getElementById('statCardCustomers');
  if (customersCard) customersCard.addEventListener('click', () => { window.location.href = 'customers.html'; });

  const pendingCard = document.getElementById('statCardPending');
  if (pendingCard) pendingCard.addEventListener('click', () => { window.location.href = 'orders.html'; });

  const unresolvedCard = document.getElementById('statCardUnresolved');
  if (unresolvedCard) unresolvedCard.addEventListener('click', () => { window.location.href = 'contacts.html'; });

  const subscribersCard = document.getElementById('statCardSubscribers');
  if (subscribersCard) subscribersCard.addEventListener('click', () => { window.location.href = 'subscribers.html'; });
});

function showStatsModal(type) {
  let modal = document.getElementById('adminStatsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'adminStatsModal';
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content" style="max-width:700px;">
      <button class="modal-close" data-close>✕</button>
      <h2>Analysis</h2>
      <div id="statsControls" style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="btn btn-small" data-range="daily">Daily</button>
        <button class="btn btn-small" data-range="weekly">Weekly</button>
        <button class="btn btn-small" data-range="monthly">Monthly</button>
        <button class="btn btn-small" data-range="yearly">Yearly</button>
      </div>
      <div id="statsBody">Loading...</div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').addEventListener('click', () => modal.remove());
    modal.querySelectorAll('#statsControls button').forEach(b => {
      b.addEventListener('click', async (e) => {
        const range = e.target.getAttribute('data-range');
        await loadAnalysis(type, range);
      });
    });
  }
  modal.classList.add('show');
  loadAnalysis(type, 'weekly');
}

async function loadAnalysis(type, range) {
  const body = document.getElementById('statsBody');
  if (!body) return;
  body.innerHTML = `<p style="color:#666;">Loading ${range} data...</p>`;
  try {
    const data = await apiCall('/dashboard/stats');
    const analysis = data.analysis || {};
    const rangeData = analysis[range] || { orders: 0, revenue: 0 };

    if (type === 'revenue') {
      body.innerHTML = `
        <h3 style="margin-top:8px;">${range.charAt(0).toUpperCase()+range.slice(1)} Revenue</h3>
        <p style="font-size:22px; font-weight:800;">₹${(rangeData.revenue || 0).toLocaleString('en-IN')}</p>
        <p style="color:#666; font-size:13px; margin-top:8px;">${rangeData.orders || 0} orders</p>
      `;
    } else if (type === 'orders') {
      body.innerHTML = `
        <h3 style="margin-top:8px;">${range.charAt(0).toUpperCase()+range.slice(1)} Orders</h3>
        <p style="font-size:22px; font-weight:800;">${rangeData.orders || 0}</p>
        <p style="color:#666; font-size:13px; margin-top:8px;">Revenue: ₹${(rangeData.revenue || 0).toLocaleString('en-IN')}</p>
      `;
    }
  } catch (err) {
    body.innerHTML = `<p style="color:#c00;">Failed to load analysis: ${err.message}</p>`;
  }
}

async function loadDashboardStats() {
  try {
    const data = await apiCall('/dashboard/stats');
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('statRevenue', '₹' + (data.totalRevenue || 0).toLocaleString('en-IN'));
    setText('statOrders', data.orderCount || 0);
    setText('statProducts', data.productCount || 0);
    setText('statCustomers', data.userCount || 0);
    setText('statPending', data.pendingOrders || 0);
    setText('statUnresolved', data.unresolvedMessages || 0);
    setText('statSubscribers', data.subscriberCount || 0);

    if (data.recentOrders && data.recentOrders.length > 0) {
      await loadRecentOrders(data.recentOrders);
    } else {
      const tbody = document.getElementById('recentOrdersBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">No orders yet</td></tr>';
    }
  } catch (err) {
    console.error('Dashboard stats error:', err);
    const container = document.querySelector('.stats-grid');
    if (container) {
      container.innerHTML = `<div style="padding:20px; background:#fff; border-radius:12px; border:1px solid #fee; color:#a00;">Failed to load dashboard stats: ${err.message || 'Unknown error'}</div>`;
    }
  }
}

async function loadRecentOrders(orders) {
  const tbody = document.getElementById('recentOrdersBody');
  if (!tbody) return;
  const list = (orders || []).slice(0, 5);
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#999;">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(o => {
    const totalQty = (o.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    return `
    <tr>
      <td><strong>#${o._id.slice(-8)}</strong></td>
      <td>${o.user?.name || 'N/A'}</td>
      <td>${o.shippingAddress?.phone || o.user?.phone || 'N/A'}</td>
      <td><strong>${totalQty}</strong></td>
      <td><strong>₹${(o.grandTotal || 0).toLocaleString('en-IN')}</strong></td>
      <td><span class="badge badge-${o.status}">${o.status}</span></td>
      <td>${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
    </tr>
  `;}).join('');
}

async function loadAllOrders(filterStatus = 'all') {
  try {
    const data = await apiCall('/admin/orders');
    let orders = data.orders || [];
    if (filterStatus !== 'all') {
      orders = orders.filter(o => o.status === filterStatus);
    }
    const tbody = document.getElementById('allOrdersBody');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#999;">No orders found</td></tr>';
      return;
    }
    tbody.innerHTML = orders.map(o => {
      const totalQty = (o.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);
      return `
      <tr>
        <td><strong>#${o._id.slice(-8)}</strong></td>
        <td>${o.user?.name || 'N/A'}</td>
        <td>${o.shippingAddress?.phone || o.user?.phone || 'N/A'}</td>
        <td>${o.items?.map(i => i.name).join(', ') || 'N/A'}</td>
        <td><strong>${totalQty}</strong></td>
        <td><strong>₹${(o.grandTotal || 0).toLocaleString('en-IN')}</strong></td>
        <td><span class="badge badge-${o.status}">${o.status}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <select onchange="updateOrderStatus('${o._id}', this.value)" class="admin-select" style="padding:6px 10px; border-radius:6px; border:1px solid #ddd; font-size:12px;">
            <option value="">Change</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </td>
      </tr>
    `;}).join('');
  } catch (err) {
    console.error('Orders error:', err);
    const tbody = document.getElementById('allOrdersBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color:#c00;">Failed to load orders: ${err.message || 'Unknown'}</td></tr>`;
  }
}

async function updateOrderStatus(orderId, status) {
  if (!status) return;
  try {
    await apiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast('Order status updated successfully');
    loadAllOrders();
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function loadAllProducts() {
  try {
    const data = await apiCall('/admin/products');
    const products = data.products || [];
    const tbody = document.getElementById('allProductsBody');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#999;">No products found</td></tr>';
      return;
    }
    tbody.innerHTML = products.map(p => `
      <tr>
         <td><img src="${resolveImg(p.images?.primary) || ''}" alt="${p.name}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;"></td>
        <td><strong>${p.name}</strong><br><small style="color:#999;">${p.weight || ''}</small></td>
        <td><span class="badge badge-${p.category}">${p.category}</span></td>
        <td>₹${p.priceNew}<br><small style="text-decoration:line-through; color:#aaa;">₹${p.priceOld || ''}</small></td>
        <td>${p.stock} ${p.stock === 0 ? '<span class="badge badge-outofstock">Out of stock</span>' : (p.stock <= 10 ? '<span class="badge badge-lowstock">Low stock</span>' : '')}</td>
        <td><span class="badge ${p.isActive ? 'badge-active' : 'badge-inactive'}">${p.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-small btn-outline" onclick="editProduct('${p._id}')" style="margin-right:5px;">Edit</button>
          <button class="btn btn-small" style="background:#f8d7da; color:#721c24; border:none;" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Products error:', err);
    const tbody = document.getElementById('allProductsBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#c00;">Failed to load products: ${err.message || 'Unknown'}</td></tr>`;
  }
}

function showAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}

async function editProduct(id) {
  try {
    const data = await apiCall(`/admin/products/${id}`);
    const p = data.product;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p._id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPriceNew').value = p.priceNew;
    document.getElementById('productPriceOld').value = p.priceOld || '';
    document.getElementById('productWeight').value = p.weight || '';
    document.getElementById('productStock').value = p.stock;
    document.getElementById('productIsActive').checked = p.isActive !== false;
    document.getElementById('productIsFeatured').checked = p.isFeatured === true;
    document.getElementById('productImagePrimary').value = p.images?.primary || '';
    document.getElementById('productImageSecondary').value = p.images?.secondary || '';
    document.getElementById('productDescription').value = p.description || '';
    document.getElementById('productModal').classList.add('show');
  } catch (err) {
    alert('Failed to load product: ' + err.message);
  }
}

async function uploadProductImageFile(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = auth.token();
  const res = await fetch(`${API_BASE}/admin/products/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Image upload failed');
  }
  const data = await res.json();
  return data.url;
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const primaryFile = document.getElementById('productImagePrimaryFile').files[0];
  const secondaryFile = document.getElementById('productImageSecondaryFile').files[0];
  let primaryUrl = document.getElementById('productImagePrimary').value;
  let secondaryUrl = document.getElementById('productImageSecondary').value;

  try {
    if (primaryFile) {
      primaryUrl = await uploadProductImageFile(primaryFile);
      document.getElementById('productImagePrimary').value = primaryUrl;
    }
    if (secondaryFile) {
      secondaryUrl = await uploadProductImageFile(secondaryFile);
      document.getElementById('productImageSecondary').value = secondaryUrl;
    }
  } catch (err) {
    alert('Image upload failed: ' + err.message);
    return;
  }

  const body = {
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    priceNew: parseFloat(document.getElementById('productPriceNew').value),
    priceOld: document.getElementById('productPriceOld').value ? parseFloat(document.getElementById('productPriceOld').value) : undefined,
    weight: document.getElementById('productWeight').value,
    stock: parseInt(document.getElementById('productStock').value, 10) || 0,
    isActive: document.getElementById('productIsActive').checked,
    isFeatured: document.getElementById('productIsFeatured').checked,
    description: document.getElementById('productDescription').value,
    images: {
      primary: primaryUrl,
      secondary: secondaryUrl || undefined
    }
  };

  try {
    if (id) {
      await apiCall(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/admin/products', { method: 'POST', body: JSON.stringify(body) });
    }
    closeProductModal();
    loadAllProducts();
    showToast('Product saved successfully');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await apiCall(`/admin/products/${id}`, { method: 'DELETE' });
    loadAllProducts();
    showToast('Product deleted');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function loadAllCustomers() {
  try {
    const data = await apiCall('/admin/customers');
    const users = data.users || [];
    const tbody = document.getElementById('allUsersBody');
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">No customers found</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
         <td>${u.email}</td>
         <td>${u.phone || 'N/A'}</td>
         <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
         <td>
           <button class="btn btn-small" style="background:#f8d7da; color:#721c24; border:none;" onclick="deleteCustomer('${u._id}')">Delete</button>
         </td>
       </tr>
     `).join('');
   } catch (err) {
     console.error('Customers error:', err);
   }
 }

 async function deleteCustomer(id) {
   if (!confirm('Are you sure you want to delete this customer?')) return;
  try {
    await apiCall(`/admin/customers/${id}`, { method: 'DELETE' });
    loadAllCustomers();
    showToast('Customer deleted');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function loadAllMessages() {
  try {
    const data = await apiCall('/admin/messages');
    const messages = data.messages || [];
    const tbody = document.getElementById('allMessagesBody');
    if (messages.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#999;">No messages found</td></tr>';
      return;
    }
    tbody.innerHTML = messages.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td>${c.phone || 'N/A'}</td>
        <td>${c.subject || 'N/A'}</td>
        <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.message}">${c.message}</td>
        <td><span class="badge ${c.status === 'resolved' ? 'badge-resolved' : 'badge-unresolved'}">${c.status === 'resolved' ? 'Resolved' : 'Unresolved'}</span></td>
        <td>${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          ${c.status !== 'resolved' ? `<button class="btn btn-small btn-outline" onclick="markResolved('${c._id}')" style="margin-right:5px;">Resolve</button>` : ''}
          <button class="btn btn-small" style="background:#f8d7da; color:#721c24; border:none;" onclick="deleteMessage('${c._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Messages error:', err);
  }
}

async function markResolved(id) {
  try {
    await apiCall(`/admin/messages/${id}/resolve`, { method: 'PUT' });
    loadAllMessages();
    showToast('Marked as resolved');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiCall(`/admin/messages/${id}`, { method: 'DELETE' });
    loadAllMessages();
    showToast('Message deleted');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function loadAdminProfile() {
  try {
    const data = await apiCall('/auth/profile');
    document.getElementById('settingsName').value = data.name || '';
    document.getElementById('settingsEmail').value = data.email || '';
    document.getElementById('settingsPhone').value = data.phone || '';
  } catch (err) {
    console.error('Profile load error:', err);
  }
}

async function updateProfile(e) {
  e.preventDefault();
  try {
    const body = {
      name: document.getElementById('settingsName').value,
      email: document.getElementById('settingsEmail').value,
      phone: document.getElementById('settingsPhone').value,
    };
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    auth.set(data);
    showToast('Profile updated successfully');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function changePassword(e) {
  e.preventDefault();
  try {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    await apiCall('/auth/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    document.getElementById('passwordForm').reset();
    showToast('Password changed successfully');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

function toggleOfferPreview() {
  const preview = document.getElementById('offerPreview');
  if (!preview) return;
  const enabled = document.getElementById('settingsOfferEnabled').checked;
  const pct = document.getElementById('settingsOfferPercent').value || 0;
  const text = document.getElementById('settingsOfferText').value || 'Festival offer on every product!';
  if (enabled) {
    preview.classList.remove('disabled');
    preview.innerHTML = `<span>${text}</span> <span class="pct">${pct}% OFF</span>`;
  } else {
    preview.classList.add('disabled');
    preview.innerHTML = 'Offer banner is currently hidden from customers';
  }
}

async function loadSiteSettings() {
  try {
    const data = await apiCall('/admin/settings/site');
    const s = data.settings || {};
    document.getElementById('settingsAnnouncement').value = s.announcementText || '';
    document.getElementById('settingsOfferEnabled').checked = !!s.offerEnabled;
    document.getElementById('settingsOfferTitle').value = s.offerTitle || '';
    document.getElementById('settingsOfferPercent').value = s.offerPercent ?? '';
    document.getElementById('settingsOfferText').value = s.offerText || '';
    document.getElementById('settingsOfferValidTill').value = s.offerValidTill ? s.offerValidTill.substring(0, 10) : '';
    document.getElementById('settingsFreeShipping').value = s.freeShippingThreshold ?? '';
    document.getElementById('settingsCodEnabled').checked = s.codEnabled !== false;
    document.getElementById('settingsSupportPhone').value = s.supportPhone || '';
    document.getElementById('settingsSupportEmail').value = s.supportEmail || '';

    toggleOfferPreview();
  } catch (err) {
    console.error('Failed to load site settings', err);
  }
}

async function saveSiteSettings(e) {
  e.preventDefault();
  try {
    const body = {
      announcementText: document.getElementById('settingsAnnouncement').value,
      offerEnabled: document.getElementById('settingsOfferEnabled').checked,
      offerTitle: document.getElementById('settingsOfferTitle').value,
      offerPercent: parseFloat(document.getElementById('settingsOfferPercent').value) || 0,
      offerText: document.getElementById('settingsOfferText').value,
      offerValidTill: document.getElementById('settingsOfferValidTill').value || null,
      freeShippingThreshold: parseFloat(document.getElementById('settingsFreeShipping').value) || 0,
      codEnabled: document.getElementById('settingsCodEnabled').checked,
      supportPhone: document.getElementById('settingsSupportPhone').value,
      supportEmail: document.getElementById('settingsSupportEmail').value,
    };
    await apiCall('/admin/settings/site', { method: 'PUT', body: JSON.stringify(body) });
    showToast('Store settings saved. Customers will see the update immediately.');
  } catch (err) {
    alert('Failed to save settings: ' + err.message);
  }
}

async function loadAdminsList() {
  try {
    const data = await apiCall('/admin/settings/admins');
    const admins = data.admins || [];
    const container = document.getElementById('adminsList');
    if (admins.length === 0) {
      container.innerHTML = '<p style="color:#999;">No admins found</p>';
      return;
    }
    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${admins.map(a => `
            <tr>
              <td>${a.name}</td>
              <td>${a.email}</td>
              <td>${a.role ? a.role.charAt(0).toUpperCase() + a.role.slice(1) : 'Admin'}</td>
              <td>${new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
              <td>
                <button class="btn btn-small" style="background:#f8d7da; color:#721c24; border:none;" onclick="deleteAdmin('${a._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Admins list error:', err);
  }
}

function showAddAdminModal() {
  document.getElementById('addAdminForm').reset();
  document.getElementById('addAdminModal').classList.add('show');
}

function closeAddAdminModal() {
  document.getElementById('addAdminModal').classList.remove('show');
}

async function addAdmin(e) {
  e.preventDefault();
  try {
    const body = {
      name: document.getElementById('newAdminName').value,
      email: document.getElementById('newAdminEmail').value,
      password: document.getElementById('newAdminPassword').value,
      phone: document.getElementById('newAdminPhone').value,
      role: 'admin',
    };
    await apiCall('/admin/settings/admins', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    closeAddAdminModal();
    loadAdminsList();
    showToast('Admin created successfully');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

async function deleteAdmin(id) {
  if (!confirm('Delete this admin?')) return;
  try {
    await apiCall(`/admin/settings/admins/${id}`, { method: 'DELETE' });
    loadAdminsList();
    showToast('Admin deleted');
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'productModal') closeProductModal();
  if (e.target.id === 'addAdminModal') closeAddAdminModal();
});
