// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import node from "@astrojs/node";

const { TYPEKIT_ID } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  prefetch: {
    prefetchAll: true
  },

  experimental: {
    fonts: [{
      provider: fontProviders.adobe({ id: TYPEKIT_ID }),
      name: "Forma DJR Text",
      cssVariable: "--font-forma-text"
    },
    {
      provider: fontProviders.adobe({ id: TYPEKIT_ID }),
      name: "Forma DJR Display",
      cssVariable: "--font-forma-display"
    }]
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});