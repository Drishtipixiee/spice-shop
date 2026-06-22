const API_BASE = 'https://spice-shop-backend.onrender.com';

class AdminAPI {
  constructor() {
    this.token = localStorage.getItem('zomatoAdminToken');
    this.checkAuth();
  }

  checkAuth() {
    const path = window.location.pathname;
    const isLogin = path.includes('login.html');
    if (!this.token && !isLogin) {
      window.location.href = 'login.html';
    } else if (this.token && isLogin) {
      window.location.href = 'index.html';
    }
  }

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      this.token = data.access_token;
      localStorage.setItem('zomatoAdminToken', this.token);
      window.location.href = 'index.html';
    } catch (e) {
      alert(e.message);
    }
  }

  logout() {
    localStorage.removeItem('zomatoAdminToken');
    window.location.href = 'login.html';
  }

  async fetch(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(API_BASE + url, options);
      if (res.status === 401) {
        this.logout();
      }
      return await res.json();
    } catch (e) {
      console.error('API Error:', e);
      throw e;
    }
  }

  async getDashboardStats() {
    const orders = await this.fetch('/admin/orders');
    const products = await fetch(API_BASE + '/api/products').then(r => r.json());
    
    let totalRev = 0;
    let pending = 0;
    orders.forEach(o => {
      totalRev += o.total_amount;
      if (o.status === 'PENDING') pending++;
    });

    return { totalOrders: orders.length, revenue: totalRev, pending, totalProducts: products.length, orders, products };
  }

  async getOrders() {
    return await this.fetch('/admin/orders');
  }

  async updateOrderStatus(id, status) {
    return await this.fetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getProducts() {
    return await fetch(API_BASE + '/api/products').then(r => r.json());
  }

  async saveProduct(id, payload) {
    if (id) {
      return await this.fetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      return await this.fetch(`/admin/products`, { method: 'POST', body: JSON.stringify(payload) });
    }
  }
}

const api = new AdminAPI();

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(isoStr) {
  return new Date(isoStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
