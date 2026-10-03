import type { NextConfig } from "next";

// Content-Security-Policy: restrict untrusted content execution
// - default-src: block everything not listed
// - script-src: only self + inline nonces (Next.js handles nonces automatically),
//   plus Supabase CDN and Google Fonts loader
// - style-src: self + unsafe-inline (needed for CSS-in-JS / Next.js)
// - img-src: self + data URIs + Supabase storage
// - font-src: Google Fonts
// - connect-src: self + Supabase API endpoints
// - frame-ancestors: none (matches X-Frame-Options DENY)
// - object-src: none (blocks Flash/plugins)
// - base-uri: self (prevents base tag injection)
// Content-Security-Policy: restrict untrusted content execution
// Tailored strictly to verified project runtime dependencies:
// - default-src: 'self'
// - script-src: 'self' 'unsafe-inline' (required for Next.js hydration polyfill in layout.tsx)
// - style-src: 'self' 'unsafe-inline' (required for Tailwind CSS & theme transitions)
// - img-src: 'self' data: blob: https://*.supabase.co https://jcpacademy.com
// - font-src: 'self' (Google Fonts are locally self-hosted via next/font/google)
// - connect-src: 'self' https://*.supabase.co wss://*.supabase.co https://a.nel.cloudflare.com
// - frame-ancestors: 'none' (blocks clickjacking)
// - object-src: 'none' (blocks plugins)
// - base-uri: 'self'
// - form-action: 'self'
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://jcpacademy.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://a.nel.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
