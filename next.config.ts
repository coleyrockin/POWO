import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Dev needs 'unsafe-eval' for React's runtime callstack reconstruction and
// Turbopack streams its HMR client over websockets. Production builds need
// neither, so prod CSP stays strict.
//
// va.vercel-scripts.com hosts the Vercel Web Analytics + Speed Insights
// client scripts. vitals.vercel-insights.com is the metrics ingest endpoint.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
  : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com";
const connectSrc = isDev
  ? "connect-src 'self' ws: wss: https://vitals.vercel-insights.com"
  : "connect-src 'self' https://vitals.vercel-insights.com";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data:",
              connectSrc,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
