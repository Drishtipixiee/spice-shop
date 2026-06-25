class AdminAPI {
  constructor() {
    this.checkSession();
  }

  checkSession() {
    const loggedIn  = localStorage.getItem('adminLoggedIn');
    const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;
    const path = window.location.pathname;
    const isLogin = path.includes('login');
    
    if (!loggedIn || Date.now() - loginTime > EIGHT_HOURS) {
      localStorage.removeItem('adminLoggedIn');
      if (!isLogin) window.location.href = '/admin/login';
    } else {
      if (isLogin) window.location.href = '/admin/index.html';
    }
  }

  async login(email, password) {
    // Simple hardcoded credentials for now
    // TODO: Replace with Supabase auth later
    const ADMIN_EMAIL    = 'admin@spiceshop.in';
    const ADMIN_PASSWORD = 'Admin@1234';
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      window.location.href = '/admin/index.html'; // show Dashboard
    } else {
      alert('Invalid credentials. Please try again.');
    }
  }

  logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    window.location.href = '/admin/login';
  }

  async fetch(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(url, options);
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
    const [orders, products] = await Promise.all([
      this.getOrders(),
      this.getProducts()
    ]);
    
    let totalRev = 0;
    let pending = 0;
    orders.forEach(o => {
      totalRev += o.total_amount || 0;
      if (o.status === 'placed' || o.status === 'placed'.toUpperCase()) pending++;
    });

    return { 
      totalOrders: orders.length, 
      revenue: totalRev, 
      pending, 
      totalProducts: products.length, 
      orders, 
      products 
    };
  }

  async getOrders() {
    const data = await this.fetch('/api/orders');
    // Map order fields to match frontend expectation
    return data.map(o => ({
      ...o,
      total_amount: o.total, // map total to total_amount
      status: (o.order_status || 'placed').toUpperCase(), // map order_status to status
      payment_id: o.razorpay_payment_id || 'COD'
    }));
  }

  async updateOrderStatus(id, status) {
    return await this.fetch(`/api/orders`, {
      method: 'PUT',
      body: JSON.stringify({ 
        id, 
        order_status: status.toLowerCase() 
      })
    });
  }

  async getProducts() {
    const data = await fetch('/api/products').then(r => r.json());
    // Map database columns to matches
    return data.map(p => ({
      ...p,
      category_id: p.category === 'dairy' ? 2 : (p.category === 'spices' ? 1 : (p.category === 'cakes' ? 4 : 3))
    }));
  }

  async saveProduct(id, payload) {
    // Map category_id back to database category string
    const category = payload.category_id === 2 ? 'dairy' : (payload.category_id === 1 ? 'spices' : (payload.category_id === 4 ? 'cakes' : 'combos'));
    const body = {
      name: payload.name,
      name_hindi: payload.name_hindi || payload.name,
      category,
      price: payload.price,
      mrp: payload.mrp,
      weight: payload.weight,
      image_url: payload.image_url,
      description: payload.description || 'Authentic Product',
      in_stock: true,
      is_bestseller: payload.is_bestseller || false,
      is_new: payload.is_new || false
    };

    if (id) {
      body.id = id;
      return await this.fetch(`/api/products`, { 
        method: 'PUT', 
        body: JSON.stringify(body) 
      });
    } else {
      return await this.fetch(`/api/products`, { 
        method: 'POST', 
        body: JSON.stringify(body) 
      });
    }
  }

  async getSettings() {
    return await this.fetch('/api/settings');
  }

  async saveSetting(key, value) {
    return await this.fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value })
    });
  }
}

window.api = new AdminAPI();

window.formatMoney = function(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};
window.formatDate = function(isoStr) {
  return new Date(isoStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};
