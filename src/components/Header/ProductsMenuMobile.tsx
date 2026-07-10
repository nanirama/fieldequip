"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useState } from "react";

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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

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

function MenuSection({ section, onClose }: { section: MenuItem; onClose?: () => void }) {
  return (
    <li className="py-3">
      <span className="block text-[16px] font-bold text-[#020210] leading-tight mb-3">
        <Link href={section?.href ?? "#"}>{section.title}</Link>
      </span>

      <ul className="space-y-3" role="menu">
        {section.children?.map((item) => (
          <li key={item.title}>
            <Link
              href={item?.href ?? "#"}
              role="menuitem"
              onClick={onClose}
              prefetch={false}
              className="inline-flex items-center gap-2 text-[16px] font-normal text-[#020210] leading-tight transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              {item.title}
              <ChevronRightIcon className="h-4 w-4 text-teal-500" />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={section.href ? `${section?.href}#features` : "#"}
        scroll={false}
        prefetch={false}
        onClick={() => {
          onClose?.();
          const targetPath = (section?.href ?? "").replace(/\/$/, "");
          const currentPath = window.location.pathname.replace(/\/$/, "");
          if (currentPath !== targetPath) return;
          document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="mt-7 inline-flex items-center gap-2 text-[16px] font-normal text-[#020210] leading-[130%] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
      >
        Explore More Features
        <ChevronRightIcon className="h-4 w-4 text-teal-500" />
      </Link>
    </li>
  );
}

type ProductsMenuMobileProps = {
  className?: string;
  menuTitle?: string | null;
  menuDescription?: string | null;
  items?: CmsProductNavItem[] | null;
};

function ProductsMenuMobileComponent({ className = "", menuTitle, menuDescription, items }: ProductsMenuMobileProps) {
  const menuItems = toMenuItems(items);
  const title = menuTitle?.trim() || "Products";
  const description = menuDescription?.trim() || "Explore all of our products that can help your growth";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="products-mobile-drawer"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors text-black"
      >
        Products
        <ChevronRightIcon
          className={[
            "inline-block h-4 w-4 shrink-0 text-teal-500 transition-transform duration-200",
            isMenuOpen ? "rotate-90" : "rotate-0",
          ].join(" ")}
        />
      </button>

      <div
        className={[
          "absolute inset-0 z-[60] bg-white transition-opacity duration-200 overflow-hidden",
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        // @ts-expect-error — inert is valid HTML but absent from React 18 types
        inert={!isMenuOpen}
      >
        <nav
          id="products-mobile-drawer"
          aria-label="Products menu"
          className="h-full max-h-full overflow-y-auto overscroll-contain px-6 pb-8 pt-6"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Link href="/"><Image src="/images/logo.png" alt="FieldEquip" width={187} height={35} className="h-auto mb-4" /></Link>
              <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
              <p className="mt-3 max-w-[24ch] text-[16px] leading-[1.35] text-[#020210]">{description}</p>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close products menu"
              className="rounded-md p-2 text-slate-900 transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="h-px w-full bg-slate-300" aria-hidden="true" />

          <ul className="mt-3 divide-y divide-slate-200">
            {menuItems.map((section) => (
              <MenuSection
                key={section.title}
                section={section}
                onClose={closeMenu}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

const ProductsMenuMobile = memo(ProductsMenuMobileComponent);
ProductsMenuMobile.displayName = "ProductsMenuMobile";

export default ProductsMenuMobile;
