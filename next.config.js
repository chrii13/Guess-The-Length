/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Disabilita l'ottimizzazione per permettere SVG e immagini dinamiche
  },
  // Headers di sicurezza e cache
  // Nota: Gli header di sicurezza principali sono gestiti dal middleware.ts
  // Qui configuriamo solo CSP e cache per risorse statiche
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' necessario per Next.js dev, 'unsafe-inline' per alcuni script inline
              "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' necessario per Tailwind CSS
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "media-src 'self'",
              "worker-src 'self' blob:",
            ].join('; ')
          },
          // Altri header di sicurezza sono gestiti dal middleware.ts
          // per evitare duplicazioni e per poter applicare logica condizionale
        ]
      }
    ]
  },
}

module.exports = nextConfig

