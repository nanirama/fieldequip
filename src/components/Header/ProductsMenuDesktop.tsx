"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { getSlugUrl } from "@/src/lib/utils";
import type { CmsProductNavItem, MenuItem } from "./menu-types";
function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ProductsMenuDesktopProps = {
  buttonClassName?: string;
  layout?: "dark" | "light";
  menuTitle?: string | null;
  menuDescription?: string | null;
  items?: CmsProductNavItem[] | null;
};

function toMenuItems(cmsItems: CmsProductNavItem[] | null | undefined): MenuItem[] {
  if (!cmsItems?.length) return [];
  return cmsItems.map((cat) => ({
    title: cat.title,
    href: cat._type ? getSlugUrl(cat._type, cat.slug ?? undefined) : undefined,
    children: cat.featuresNav?.map((f) => ({
      title: f.title,
      href: f._type ? getSlugUrl(f._type, f.slug ?? undefined) : undefined,
    })),
  }));
}

function ProductsMenuDesktopComponent({
  buttonClassName = "",
  layout = "light",
  menuTitle,
  menuDescription,
  items,
}: ProductsMenuDesktopProps) {
  const isDark = layout === "dark";
  const categories = toMenuItems(items);
  const title = menuTitle?.trim() || "Products";
  const description = menuDescription?.trim() || "Explore all of our products that can help your growth";

  // Safari/iPad: CSS :hover doesn't fire on tap. A click-toggle state is the
  // only reliable mechanism for touch users at the lg breakpoint (≥1024px).
  // Mouse hover via group-hover/products CSS classes continues to work unchanged.
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  // Close on outside click/tap
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onOutside, true);
    document.addEventListener("touchstart", onOutside, true);
    return () => {
      document.removeEventListener("mousedown", onOutside, true);
      document.removeEventListener("touchstart", onOutside, true);
    };
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <li ref={containerRef} className="group/products relative list-none">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1 rounded-md px-2 py-6 text-sm font-medium",
          isDark ? "text-white" : "text-slate-800",
          "transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          isDark ? "focus-visible:ring-offset-transparent" : "focus-visible:ring-offset-white",
          buttonClassName,
        ].join(" ")}
      >
        Products
        <ChevronRightIcon className="h-3 w-3 rotate-90 text-teal-500 transition-transform duration-200 group-hover/products:-rotate-90 group-focus-within/products:-rotate-90" />
      </button>

      <div
        aria-label="Products"
        className={[
          "fixed left-1/2 top-20 z-50 w-[calc(100vw-2rem)] max-w-7xl",
          "-translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10",
          "transition duration-200 ease-out",
          "group-hover/products:pointer-events-auto group-hover/products:visible group-hover/products:opacity-100",
          "group-focus-within/products:pointer-events-auto group-focus-within/products:visible group-focus-within/products:opacity-100",
          isOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
      >
        <div className="grid grid-cols-[230px_1fr] gap-6 items-end">
          <div className="border-r border-[#8B9DBA]/50 pr-6 h-full flex flex-col justify-end">
            <Link href="/">
            <Image src="/images/tinylogo.png" alt="FieldEquip" width={41} height={35} className="h-auto" />
            </Link>
            <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
            <p className="mt-3 text-base leading-[130%] text-[#020210]">{description}</p>
          </div>

          <ul className="grid grid-cols-3 gap-8" role="none">
            {categories.map((category) => (
              <li key={category.title} className="min-w-0">
                <Link
                  href={category?.href ?? "#"}
                  prefetch={false}
                  className="inline-flex items-center gap-2 text-base font-bold text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  {category.title}
                  <ChevronRightIcon className="h-3 w-3 text-teal-500" />
                </Link>

                <ul className="mt-8 space-y-3">
                  {category.children?.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item?.href ?? "#"}
                        prefetch={false}
                        className="inline-flex items-center gap-2 text-base text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                      >
                        <span>{item.title}</span>
                        <ChevronRightIcon className="h-3 w-3 text-teal-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={category.href ? `${category.href}#features` : "#"}
                  scroll={false}
                  prefetch={false}
                  onClick={() => {
                    close();
                    const poll = (n = 0) => {
                      const el = document.getElementById("features");
                      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
                      if (n < 20) setTimeout(() => poll(n + 1), 100);
                    };
                    setTimeout(poll, 50);
                  }}
                  className="mt-8 inline-flex items-center gap-2 text-base text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  Explore More Features
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

const ProductsMenuDesktop = memo(ProductsMenuDesktopComponent);
ProductsMenuDesktop.displayName = "ProductsMenuDesktop";
export default ProductsMenuDesktop;
