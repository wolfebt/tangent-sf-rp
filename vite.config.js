import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { syncCanonicalCompendium } from './scripts/syncMasterCanonicalCompendium.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function rulesCompendiumPlugin() {
  const rulesDir = path.resolve(__dirname, 'docs/game rules')
  const seedFile = path.resolve(__dirname, 'src/data/compendiumSeed.json')

  return {
    name: 'vite-plugin-rules-compendium',
    buildStart() {
      // Ensure compendium is 100% synchronized on every dev server startup and build start
      try {
        syncCanonicalCompendium({ silent: true })
      } catch (err) {
        console.error('[rulesCompendiumPlugin] Build start sync error:', err)
      }
    },
    configureServer(server) {
      if (fs.existsSync(rulesDir)) {
        server.watcher.add(rulesDir)

        let debounceTimer = null
        const handleRuleChange = (action, filePath) => {
          if (!filePath.toLowerCase().endsWith('.md')) return
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            try {
              console.log(`\n[rulesCompendiumPlugin] Detected rule change (${action}): ${path.basename(filePath)}. Syncing compendium...`)
              syncCanonicalCompendium({ silent: false })

              const mod = server.moduleGraph.getModuleById(seedFile)
              if (mod) {
                server.moduleGraph.invalidateModule(mod)
              }
              server.ws.send({ type: 'full-reload' })
            } catch (err) {
              console.error('[rulesCompendiumPlugin] Live update failed:', err)
            }
          }, 150)
        }

        server.watcher.on('add', p => {
          if (p.includes('game rules')) handleRuleChange('add', p)
        })
        server.watcher.on('change', p => {
          if (p.includes('game rules')) handleRuleChange('change', p)
        })
        server.watcher.on('unlink', p => {
          if (p.includes('game rules')) handleRuleChange('unlink', p)
        })
      }
    }
  }
}

export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    watch: {
      ignored: [
        '**/docs/!(game rules)/**',
        '**/src/data/omnicortex/compendium/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/.git/**'
      ]
    }
  },
  build: {
    chunkSizeWarningLimit: 5000,
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
            cleanId.includes('node_modules/vfile') ||
            cleanId.includes('node_modules/hast') ||
            cleanId.includes('node_modules/property-information') ||
            cleanId.includes('node_modules/space-separated-tokens') ||
            cleanId.includes('node_modules/comma-separated-tokens') ||
            cleanId.includes('node_modules/bail') ||
            cleanId.includes('node_modules/trough')
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
          if (cleanId.includes('src/components/Codex/') || cleanId.includes('src/pages/Codex/')) return 'vendor-codex-studio';
          if (cleanId.includes('src/components/Folio/modals/AssetModal')) return 'vendor-codex-studio';
          if (cleanId.includes('src/components/Folio/modals/CustomSelectorModal') || cleanId.includes('src/components/UI/UniversalCatalogModal')) return 'folio-catalog-selector-modal';
          if (cleanId.includes('src/components/Folio/modals/GuidedCreatorModal')) return 'folio-creator-modal';
          if (cleanId.includes('src/components/Folio/modals/EconomyModal')) return 'folio-economy-modal';
          if (cleanId.includes('src/components/Folio/modals/RosterModal')) return 'folio-roster-modal';
          if (cleanId.includes('src/components/Folio/BastionDrawer')) return 'folio-bastion-drawer';
          if (cleanId.includes('src/components/Folio/modals/MetaphysicsModal') || cleanId.includes('src/components/Folio/modals/PerceptionEssenceMovementModal')) return 'folio-metaphysics-modal';
          if (
            cleanId.includes('src/components/Folio/modals/DiscreetFateOverrideModal') ||
            cleanId.includes('src/components/Folio/modals/KarmaCodexModal') ||
            cleanId.includes('src/components/Folio/modals/ExperienceCodexModal') ||
            cleanId.includes('src/components/Folio/modals/AugmentationDiagnosticsModal')
          ) {
            return 'folio-rules-modals';
          }
          if (cleanId.includes('src/components/Folio/modals/')) return 'folio-modals';
          if (cleanId.includes('src/components/Folio/tabs/')) return 'folio-tabs';
        }
      }
    }
  },
  plugins: [
    rulesCompendiumPlugin(),
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
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
