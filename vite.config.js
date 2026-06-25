import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        shop: resolve(__dirname, 'frontend/shop.html'),
        login: resolve(__dirname, 'frontend/login.html'),
        adminRedirect: resolve(__dirname, 'frontend/admin.html'),
        deliveryMap: resolve(__dirname, 'frontend/delivery-map.html'),
        adminIndex: resolve(__dirname, 'frontend/admin/index.html'),
        adminProducts: resolve(__dirname, 'frontend/admin/products.html'),
        adminOrders: resolve(__dirname, 'frontend/admin/orders.html'),
        adminSettings: resolve(__dirname, 'frontend/admin/settings.html'),
        adminLogin: resolve(__dirname, 'frontend/admin/login.html')
      }
    }
  }
});
