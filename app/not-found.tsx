import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import BaseLayout from "@/src/components/BaseLayout";
import { loadHeader } from "@/src/sanity/loader/loadQuery";
import { ButtonComponent } from "@/src/components/ButtonComponent";
const getHeader = cache(loadHeader)
export const metadata: Metadata = {
  title: "404 - Page Not Found | FieldEquip",
  description:
    "The FieldEquip page you requested could not be found. Return home or explore field service resources.",
  // 404 pages must not be indexed — no canonical, no hreflang.
  robots: { index: false, follow: true },
};

const helpfulLinks = [
  {
    href: "/field-service-management-software",
    label: "Field Service Management",
  },
  {
    href: "/digital-field-ticketing-software",
    label: "Digital Field Ticketing",
  },
  {
    href: "/case-studies",
    label: "Case Studies",
  },
  {
    href: "/contact-us",
    label: "Contact Us",
  },
];

export default async function NotFound() {
  const headerResult = await getHeader();
  const settings = headerResult.data ?? {}
  return (
    <BaseLayout layout="dark" settings={settings}>
      <div className="relative w-full sm:h-screen notfound-bg bg-[linear-gradient(180deg,#162A4A_0%,#3C5B8D_40%,#6f8fc4_55%,#ffffff_70%)] bg-white sm:py-28 py-60">
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Image
            src={`/images/404-bg.png`}
            alt=""
            fill
            priority
            className="object-cover w-full h-full border"
          />
        </div>
        <div className="pointer-events-none sm:absolute inset-0 flex items-center justify-center max-w-7xl mx-auto">
          <h1 className="text-[180px] sm:text-[260px] md:text-[600px] font-bold opacity-60 bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_100.03%)] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* 📦 Content */}
        <div className="relative z-30 max-w-xl px-6 flex flex-col sm:min-h-screen items-center justify-center mx-auto">
          <h2 className="text-4xl sm:text-[58px] text-white font-semibold mb-4 text-center">
            Page Not Found
          </h2>

          <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-2xl text-center">
            We can’t find the page that you’re looking for. The requested page
            either doesn’t exist or you don’t have access to it.
          </p>

          <Link
            href="/"
            className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0b1f3a] shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </BaseLayout>
  );
}

