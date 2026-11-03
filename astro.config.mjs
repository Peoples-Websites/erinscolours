// @ts-check
import { defineConfig } from 'astro/config';

// Tailwind CSS v4 integration via Vite.
// This enables zero-config Tailwind using default settings.
import tailwindcss from "@tailwindcss/vite";

// Preact integration for interactive "islands".
// Most pages remain static HTML; only components marked with
// client:* directives will hydrate in the browser.
import preact from "@astrojs/preact";

// https://astro.build/config

export default defineConfig({

  // Astro uses Vite internally; here we inject the Tailwind plugin
  // so utility classes are processed at build time.
  vite: {

    plugins: [tailwindcss()],

    server: {
      proxy: {
        '/.netlify/functions': {
          target: 'http://localhost:9999',
          changeOrigin: true,
        },
      },
    },

  },

  // Enable Preact for client-side interactivity where needed
  integrations: [preact()],

});
