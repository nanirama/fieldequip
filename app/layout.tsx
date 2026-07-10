import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

import { getMetadataBase } from "@/src/utils/siteUrl";
import { OrganizationSchema } from "@/src/components/SchemaOrg";
import { GoogleAnalytics } from "@/src/components/GoogleAnalytics";
import HubSpotChat from "@/src/components/HubSpotChat";
import HashScrollHandler from "@/src/components/HashScrollHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // 👈 this creates CSS variable
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // ← fixes iPhone notch/Dynamic Island
};

const isProduction = process.env.NEXT_DEVELOPMENT_ENV === 'production';
export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  ...(!isProduction && { robots: { index: false, follow: false } }),
  title: "Digital Field Service Management Software",
  description: "Embrace digital transformation using our field service management software. Increase equipment productivity and technician performance!",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FieldEquip",
  },
  verification: {
    google: "hz0ClXxpSTy3CnM69L7_DZYCQK10DA_VIdeSRm4aGTc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationSchema />
        {!isProduction && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        
        {/* Sanity image CDN */}
        {/* Sanity CDN Preconnect - removed crossOrigin so img tags can reuse the socket! */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        {/* Google Analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <HashScrollHandler />
        <GoogleAnalytics />
        <HubSpotChat portalId="2624857" />
      </body>
    </html>
  );
}