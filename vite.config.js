import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        login: resolve(__dirname, 'login.html'),
        adminRedirect: resolve(__dirname, 'admin.html'),
        deliveryMap: resolve(__dirname, 'delivery-map.html'),
        adminIndex: resolve(__dirname, 'admin/index.html'),
        adminProducts: resolve(__dirname, 'admin/products.html'),
        adminOrders: resolve(__dirname, 'admin/orders.html'),
        adminSettings: resolve(__dirname, 'admin/settings.html'),
        adminLogin: resolve(__dirname, 'admin/login.html')
      }
    }
  }
});
