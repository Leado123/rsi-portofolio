// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import node from "@astrojs/node";

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), "");
const TYPEKIT_ID = env.TYPEKIT_ID;

// https://astro.build/config
export default defineConfig({
  integrations: [react(), (await import("@playform/compress")).default()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },


  experimental: {
    fonts: TYPEKIT_ID ? [{
      provider: fontProviders.adobe({ id: TYPEKIT_ID }),
      name: "Forma DJR Text",
      cssVariable: "--font-forma-text"
    },
    {
      provider: fontProviders.adobe({ id: TYPEKIT_ID }),
      name: "Forma DJR Display",
      cssVariable: "--font-forma-display"
    }] : []
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['sharp']
      }
    }
  },

  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});