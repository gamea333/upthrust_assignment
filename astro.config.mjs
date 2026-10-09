// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://upthrust-assignment-rho.vercel.app',
  // Pages are pre-rendered; only routes with `prerender = false` (the form API) run on Vercel.
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],

  // CMS images are downloaded from Sanity's CDN at build time and optimised
  // (AVIF/WebP, responsive sizes) exactly like local assets.
  image: {
    domains: ['cdn.sanity.io'],
  },

  // Typed environment variables. Secrets are server-only: Astro refuses to import
  // them into client code, and they're read at runtime, never baked into the build.
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: 'server', access: 'secret', url: true }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret' }),
      // Sanity project (public: the dataset is read-only to the public anyway).
      PUBLIC_SANITY_PROJECT_ID: envField.string({
        context: 'server',
        access: 'public',
        default: '1rk7384s',
      }),
      PUBLIC_SANITY_DATASET: envField.string({
        context: 'server',
        access: 'public',
        default: 'production',
      }),
      // Google Tag Manager container. Public by design (it's in the page source anyway);
      // override per environment in Vercel if needed.
      PUBLIC_GTM_ID: envField.string({
        context: 'client',
        access: 'public',
        default: 'GTM-K7FCMLW3',
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        treeshake: {
          // The server build leaves a bare `import "rolldown"` in the function entry.
          // Rolldown is a build tool with native binaries that aren't deployed, so on
          // Vercel the function crashed on start. Nothing from it is used at runtime,
          // so treat it as side-effect free and let the import be dropped.
          moduleSideEffects: (id) => !/^rolldown(\/|$)/.test(id),
        },
      },
    },
  },
});
