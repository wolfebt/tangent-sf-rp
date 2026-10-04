import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    watch: {
      ignored: ['**/docs/**', '**/*.md']
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const cleanId = id.replace(/\\/g, '/');
          if (cleanId.includes('node_modules/pixi.js') || cleanId.includes('@pixi/')) return 'vendor-pixi';
          if (cleanId.includes('node_modules/three')) return 'vendor-three';
          if (cleanId.includes('node_modules/firebase/')) return 'vendor-firebase';
          if (cleanId.includes('node_modules/livekit-client')) return 'vendor-livekit';
          if (cleanId.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (cleanId.includes('node_modules/react/') || cleanId.includes('node_modules/react-dom/') || cleanId.includes('node_modules/react-router')) return 'vendor-react';
          if (cleanId.includes('node_modules/konva') || cleanId.includes('node_modules/react-konva')) return 'vendor-konva';
          if (cleanId.includes('node_modules/@google/genai')) return 'vendor-genai';
          if (cleanId.includes('node_modules/yjs')) return 'vendor-yjs';
          if (
            cleanId.includes('node_modules/react-markdown') ||
            cleanId.includes('node_modules/remark-gfm') ||
            cleanId.includes('node_modules/marked') ||
            cleanId.includes('node_modules/dompurify') ||
            cleanId.includes('node_modules/micromark') ||
            cleanId.includes('node_modules/mdast') ||
            cleanId.includes('node_modules/unist') ||
            cleanId.includes('node_modules/vfile')
          ) {
            return 'vendor-markdown';
          }
          if (cleanId.includes('node_modules/react-quill-new') || cleanId.includes('node_modules/quill')) return 'vendor-quill';

          // Omnicortex datasets - split into dedicated domain chunks
          if (cleanId.includes('src/data/compendiumSeed.json')) return 'data-compendium-seed';
          if (cleanId.includes('src/data/speciesTraitsData')) return 'data-species-traits';
          if (cleanId.includes('src/data/speciesData')) return 'data-species-catalog';
          if (cleanId.includes('src/data/featuresData')) return 'data-features';
          if (cleanId.includes('src/data/factionsData')) return 'data-factions';
          if (cleanId.includes('src/data/archetypesData')) return 'data-archetypes';
          if (cleanId.includes('src/data/invocationsData')) return 'data-invocations';
          if (cleanId.includes('src/data/weaponryData') || cleanId.includes('src/data/armoringData') || cleanId.includes('src/data/augmentationsData')) return 'data-equipment';
          if (cleanId.includes('src/data/skillsData')) return 'data-skills';
          if (cleanId.includes('src/data/supportingCatalogsData')) return 'data-supporting-catalogs';
          if (cleanId.includes('src/data/')) return 'data-omnicortex-misc';

          // Folio & Codex modular chunks
          if (cleanId.includes('src/components/Codex/')) return 'vendor-codex-studio';
          if (cleanId.includes('src/components/Folio/modals/GuidedCreatorModal')) return 'folio-creator-modal';
          if (cleanId.includes('src/components/Folio/modals/MetaphysicsModal') || cleanId.includes('src/components/Folio/modals/PerceptionEssenceMovementModal')) return 'folio-metaphysics-modal';
          if (cleanId.includes('src/components/Folio/modals/')) return 'folio-modals';
          if (cleanId.includes('src/components/Folio/tabs/')) return 'folio-tabs';
        }
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 10000000,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/__(.*)/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Tangent SFF RPG',
        short_name: 'TangentRPG',
        description: 'Tangent Science Fantasy Roleplaying Game Suite',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ]
})
