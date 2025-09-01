import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifestFilename: 'manifest.json',
    //   includeAssets: ['diet-icon.svg', 'diet-icon-192.png', 'diet-icon-512.png'],
    //   workbox: {
    //       runtimeCaching: [
    //         {
    //           urlPattern: ({ url }) => url.origin.includes("catalyst.zoho.com"),
    //           handler: "NetworkFirst", // try network first, fallback to cache
    //           options: {
    //             cacheName: "catalyst-api-cache",
    //             expiration: {
    //               maxEntries: 50,
    //               maxAgeSeconds: 60 * 60 * 24, // 1 day
    //             },
    //           },
    //         },
    //         {
    //           urlPattern: ({ url }) => /\.(?:png|jpg|jpeg|svg|ico|css|js)$/.test(url.pathname),
    //           handler: "CacheFirst",
    //           options: {
    //             cacheName: "static-assets",
    //             expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } // 30 days
    //           }
    //         }

    //       ]
    //     },
    //   devOptions: {
    //     enabled: false,
    //     // type: 'module'
    //   },
    //   useCredentials: true,
    //   manifest: {
    //     name: 'DietSail - Diet Tracking App',
    //     short_name: 'DietSail',
    //     description: 'Track your diet and nutrition goals with DietSail',
    //     theme_color: '#10b981',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     scope: '/',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: '/diet-icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any'
    //       },
    //       {
    //         src: '/diet-icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any'
    //       },
    //       {
    //         src: '/diet-icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'maskable'
    //       }
    //     ],
    //     screenshots: [
    //       {
    //         src: '/screenshots/mobile-home.png',
    //         sizes: '390x844',
    //         type: 'image/png',
    //         form_factor: 'narrow',
    //         label: 'Home screen on mobile'
    //       }
    //     ]
    //   }
    // })
  ],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Ensure proper asset handling
  // publicDir: 'public',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});