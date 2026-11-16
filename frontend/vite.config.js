import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Prévia do link no WhatsApp e nas redes sociais: a imagem precisa do endereço completo do site.
// Quando o Django entrega o frontend (Dockerfile), ele mesmo coloca a imagem (config/views.py).
// Só defina VITE_SITE_URL (ex.: https://seu-dominio.com.br) se o frontend for hospedado à parte,
// como na Vercel ou na Netlify.
const socialPreview = (siteUrl) => ({
  name: 'social-preview',
  transformIndexHtml() {
    if (!siteUrl) return []
    const image = `${siteUrl.replace(/\/+$/, '')}/og-image.jpg`
    const meta = (property, content) => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' })
    return [
      meta('og:image', image),
      meta('og:image:type', 'image/jpeg'),
      meta('og:image:width', '1200'),
      meta('og:image:height', '630'),
      meta('og:image:alt', 'Amigo Secreto: sorteio online e um link secreto para cada pessoa'),
    ]
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [react(), socialPreview(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL)],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}))
