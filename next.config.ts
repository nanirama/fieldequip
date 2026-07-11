/** @type {import('next').NextConfig} */
const redirectsList = require("./redirects.json");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const isDev = process.env.NODE_ENV === "development";

const nextConfig = withBundleAnalyzer({
  logging: {
    browserToTerminal: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  trailingSlash: true,
  async redirects() {
    return redirectsList;
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Every entry here becomes another (long) Sanity URL inside each <img srcset>.
    // With 8 device sizes + 10 image sizes the page was carrying ~305 Sanity URLs
    // (~77KB of the 241KB markup) just in srcsets. Trimmed to the widths that are
    // actually useful — mobile (640/828), tablet (1080) and desktop retina (1920).
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [32, 64, 128, 256, 384],
    qualities: [20, 25, 50, 60, 65, 70, 72, 75, 78, 80, 82, 85, 86, 88, 90],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    unoptimized: isDev,
    minimumCacheTTL: isDev ? 0 : 60 * 60 * 24,
  },
  experimental: {
    // Inline the stylesheets into the HTML instead of shipping <link rel=stylesheet>.
    // Those links were render-blocking, and PSI showed the LCP element's render
    // delay tracking FCP exactly: FCP 2.0s -> ~2100ms delay, FCP 1.4s -> ~570ms.
    // Removing the blocking round-trip is what lets the first paint happen early.
    inlineCss: true,
    // optimizeCss (critters) is Pages-Router only — a no-op here.
    optimizeCss: false,
    dynamicIO: true,      // ← enables "use cache" directive
    useCache: true,       // ← enables cacheLife / cacheTag
    // Tree-shake barrel imports so only the used exports ship to the client.
    optimizePackageImports: [
      "@portabletext/react",
      "@sanity/image-url",
      "next-sanity",
    ],
  },
  compress: true,
  poweredByHeader: false,
  //output: "standalone",
  productionBrowserSourceMaps: false,

  async headers() {
    return isDev
      ? [
          // 🚫 No caching in development
          {
            source: "/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            ],
          },
        ]
      : [
          // ✅ Catch-all — CSP + cache for HTML pages
          // s-maxage=3600: CDN caches the rendered HTML for 1 hour.
          // stale-while-revalidate=86400: after expiry, CDN serves the stale
          // page *immediately* while revalidating in the background — users
          // never wait for a cold SSR render after a tag revalidation.
          // max-age=0: browser always checks the CDN; ensures fresh content
          // after on-demand revalidation without a browser hard-refresh.
          {
            source: "/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
              },              
              {
                key: "Content-Security-Policy",
                value: [
                  // Fallback for any directive not explicitly listed
                  "default-src 'self'",

                  // Scripts — Next.js + HubSpot + Google Tag Manager + YouTube
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval'" +
                    " https://js.hsforms.net" +
                    " https://js.hs-scripts.com" +
                    " https://js.hs-analytics.net" +
                    " https://js.hubspot.com" +
                    " https://js.hscollectedforms.net" +
                    " https://js.usemessages.com" +
                    " https://hubspot-forms-static-embed.s3.amazonaws.com" + // ← ADD THIS
                    " https://www.googletagmanager.com" +
                    " https://www.google-analytics.com" +
                    " https://www.youtube.com" +
                    " https://s.ytimg.com",

                  // Styles — Next.js inline + HubSpot injected CSS
                  "style-src 'self' 'unsafe-inline' https://forms.hsforms.com",

                  // Frames — HubSpot forms + YouTube embeds
                  "frame-src 'self'" +
                    " https://*.hsforms.com" +   
                    " https://forms.hsforms.com" +
                    " https://share.hsforms.com" +
                    " https://www.youtube.com" +
                    " https://www.youtube-nocookie.com" +
                    " https://youtube.com",

                  // Connections — HubSpot API + GTM + Analytics
                  "connect-src 'self'" +
                    " https://api.hsforms.com" +
                    " https://forms.hubspot.com" +
                    " https://*.hsforms.com" +     
                    " https://forms.hsforms.com" +           // ← ADD THIS
                    " https://collector.hubspot.com" +
                    " https://*.hubspot.com" +
                    " https://hubspot-forms-static-embed.s3.amazonaws.com" + // ← ADD THIS
                    " https://*.hubapi.com" +
                    " https://www.google-analytics.com" +
                    " https://analytics.google.com" +
                    " https://stats.g.doubleclick.net",

                  // Images — Sanity CDN + HubSpot + YouTube thumbnails + Unsplash
                  "img-src 'self' data: blob:" +
                    " https://cdn.sanity.io" +
                    " https://*.hubspot.com" +
                    " https://*.hsforms.com" +
                    " https://*.hubapi.com" +
                    " https://img.youtube.com" +
                    " https://i.ytimg.com" +
                    " https://source.unsplash.com" +
                    " https://via.placeholder.com" +
                    " https://www.google-analytics.com" +
                    " https://www.googletagmanager.com",

                  // Fonts — self-hosted only (add Google Fonts if needed)
                  "font-src 'self' data:",

                  // Media — self-hosted video/audio only
                  "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",

                  // Block Flash, Java, etc.
                  "object-src 'none'",

                  // Restrict <base> tag
                  "base-uri 'self'",

                  // Prevent clickjacking
                  "frame-ancestors 'self'",
                ].join("; "),
              },
              // Security headers
              {
                key: "X-Content-Type-Options",
                value: "nosniff",
              },
              {
                key: "X-Frame-Options",
                value: "SAMEORIGIN",
              },
              {
                key: "Referrer-Policy",
                value: "strict-origin-when-cross-origin",
              },
              {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=()",
              },
            ],
          },
          {
            source: "/:file(favicon\\.ico|favicon\\.png|apple-touch-icon\\.png)",
            headers: [
              { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
            ],
          },
          // Next.js image optimizer — 24h browser, 7d CDN
          {
            source: "/_next/image(.*)",
            headers: [
              {
                key: "Cache-Control",
                value:
                  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
              },
            ],
          },

          // Hashed JS/CSS build assets — immutable forever
          {
            source: "/_next/static/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          },

          // Self-hosted fonts — immutable forever
          {
            source: "/fonts/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          },

          // Public images folder — immutable forever
          {
            source: "/images/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          },
        ];
  },
});

export default nextConfig;
