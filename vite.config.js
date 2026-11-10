import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SITE_URL (e.g. https://yogesh.vercel.app) makes social-preview links absolute.
// Set it as an environment variable on your host; without it they stay relative.
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '')

export default defineConfig({
  plugins: [
    react(),
    { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL) },
  ],
  // absolute base so nested routes like /projects/repo_lens load their assets
  base: '/',
})
