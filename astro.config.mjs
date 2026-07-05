// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pixelfixmexico.com',
  redirects: {
    '/venta-google-pixel-monterrey': '/equipos'
  },
  integrations: [sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});