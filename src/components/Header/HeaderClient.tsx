"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";

// All menus are statically imported so their JS is bundled with HeaderClient
// and available the instant the page hydrates — no chunk download delay on
// first hover/tap. Dynamic imports caused 1-3s blank menus on iPhone/MacBook.
import ProductsMenuMobile from "./ProductsMenuMobile";
import IndustriesMenuMobile from "./IndustriesMenuMobile";
import CompanyMenuMobile from "./CompanyMenuMobile";
import ResourcesMenuMobile from "./ResourcesMenuMobile";
import ProductsMenuDesktop from "./ProductsMenuDesktop";
import IndustriesMenuDesktop from "./IndustriesMenuDesktop";
import CompanyMenuDesktop from "./CompanyMenuDesktop";
import ResourcesMenuDesktop from "./ResourcesMenuDesktop";

import type { SettingsMenuData } from "./menu-types";
import type { HeaderProps } from "./index";

type HeaderClientProps = HeaderProps & { settings: SettingsMenuData };

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative z-50 flex h-5 w-5 flex-col justify-between">
      <span className={["block h-[1.5px] w-full rounded-full bg-current origin-center transition-all duration-300", open ? "translate-y-2.5 rotate-45" : ""].join(" ")} />
      <span className={["block h-[1.5px] w-full rounded-full bg-current transition-all duration-300", open ? "scale-x-0 opacity-0" : ""].join(" ")} />
      <span className={["block h-[1.5px] w-full rounded-full bg-current origin-center transition-all duration-300", open ? "-translate-y-[8.5px] -rotate-45" : ""].join(" ")} />
    </span>
  );
}

function HeaderClientComponent({ layout = "light", settings }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // The mobile menu items are only mounted once the drawer is first opened, so
  // their (duplicate of the desktop nav) DOM doesn't get server-rendered and
  // hydrated on every initial page load. The desktop <nav> keeps all nav links
  // in the initial HTML for crawlers. JS stays bundled, so opening is instant.
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isDark = layout === "dark";

  const openMobile = useCallback(() => {
    setMobileMenuMounted(true);
    setMobileOpen((v) => !v);
  }, []);

  // Scroll lock: overflow:hidden on html+body freezes scroll without any layout
  // shift, position change, or window.scrollTo — avoiding two known bugs:
  // 1. Mac Safari: position:fixed removes the scrollbar → ICB widens → the
  //    (min-width:1024px) media query fires false-positive → closeMobile() runs
  //    immediately after open → menu appears to not open at all.
  // 2. iOS Safari: window.scrollTo after removing position:fixed causes the URL
  //    bar to appear/hide, shifting layout mid-frame and misplacing the hamburger
  //    button's touch hit-test on the next tap.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (mobileOpen) {
      const sbw = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      // Compensate scrollbar width so content doesn't jump (Mac only, sbw=0 on iOS)
      if (sbw > 0) body.style.paddingRight = `${sbw}px`;
    } else {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
    }
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      body.style.paddingRight = "";
    };
  }, [mobileOpen]);

  // Scroll-based header background — RAF-throttled to reduce reflows.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 8);
          ticking = false;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on genuine resize to desktop.
  // Uses window.innerWidth (total window width including scrollbar space) instead
  // of e.matches (ICB = clientWidth) so that hiding the scrollbar via scroll-lock
  // doesn't falsely trigger this and immediately close a newly-opened menu.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const logoSrc = isDark ? "/images/logo-white.png" : "/images/logo.png";

  return (
    <>
      <a
        href="#main-content"
        className="hidden sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-lg focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>

      {/* ── Fixed top bar ─────────────────────────────────────────────────────── */}
      <header
        role="banner"
        className={[
          "fixed inset-x-0 top-0 z-1000 w-full transition-[background,color,box-shadow] duration-300",
          isDark
            ? isScrolled ? "bg-[#162a4a]" : "bg-transparent"
            : ["bg-transparent", isScrolled ? "bg-white shadow-sm shadow-slate-900/5" : "", "border-b border-slate-200/80"].join(" "),
        ].join(" ")}
      >
        <div className="mx-auto mt-3.5 mb-2 flex md:h-16 h-12 max-w-7xl items-center justify-between px-4">
          <Link
            href="/"
            aria-label="FieldEquip — go to homepage"
            className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <Image src={logoSrc} alt="FieldEquip" width={187} height={35} priority className="h-auto" />
          </Link>

          {/* ── Desktop nav — always in the DOM; hidden on mobile via Tailwind ── */}
          <nav aria-label="Main navigation" className="hidden lg:flex lg:flex-1 lg:justify-center">
            <ul className="flex items-center gap-8">
              <ProductsMenuDesktop
                layout={layout}
                menuTitle={settings.productsTitle}
                menuDescription={settings.productsDescription}
                items={settings.productNav}
              />
              <IndustriesMenuDesktop
                layout={layout}
                menuTitle={settings.industriesTitle}
                menuDescription={settings.industriesDescription}
                industries={settings.industriesNav ?? []}
              />
              <CompanyMenuDesktop
                layout={layout}
                menuTitle={settings.companyTitle}
                menuDescription={settings.companyDescription}
                items={settings.companyNav}
              />
              <ResourcesMenuDesktop
                layout={layout}
                menuTitle={settings.resourcesTitle}
                menuDescription={settings.resourcesDescription}
                items={settings.resourcesNav}
              />
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              prefetch={false}
              className={[
                "hidden sm:inline-flex items-center rounded-full px-4.5 py-2.5 text-sm font-semibold leading-[140%] text-white transition-all duration-200",
                "bg-[#13A89E] shadow-sm hover:bg-[#119184] hover:shadow-md hover:shadow-teal-500/20 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2",
                isDark ? "focus-visible:ring-offset-transparent" : "focus-visible:ring-offset-white",
              ].join(" ")}
            >
              Schedule a Demo
            </Link>

            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={openMobile}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 lg:hidden touch-manipulation",
                isDark ? "text-white hover:bg-white/10" : "text-slate-800 hover:bg-slate-100",
              ].join(" ")}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay — always in DOM; hidden on desktop via lg:hidden ───── */}
      <div
        aria-hidden={!mobileOpen}
        onClick={closeMobile}
        className={[
          "fixed inset-0 z-990 transition-opacity duration-300 lg:hidden",
          isDark ? "bg-black/60" : "bg-black/30",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* ── Mobile drawer — always in DOM; hidden on desktop via lg:hidden ────── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          "fixed inset-0 z-1001 flex max-h-dvh flex-col overflow-hidden transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-y-0" : "-translate-y-full pointer-events-none",
          isDark ? "border-b border-white/10 bg-white" : "border-b border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="flex h-14  mt-4 shrink-0 items-center justify-between px-6 sm:px-6">
          <Link href="/">
            <Image src="/images/logo.png" alt="FieldEquip" width={187} height={35} className="h-auto" />
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobile}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
              isDark ? "text-black hover:bg-white/10" : "text-slate-800 hover:bg-slate-100",
            ].join(" ")}
          >
            <HamburgerIcon open={true} />
          </button>
        </div>

        <div aria-hidden="true" className={isDark ? "mx-4 h-px bg-white/10" : "mx-4 h-px bg-slate-200"} />

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="flex min-h-full items-center justify-center">
            {mobileMenuMounted && (
              <ul className="flex w-full max-w-md flex-col gap-1">
                <li>
                  <ProductsMenuMobile
                    menuTitle={settings.productsTitle}
                    menuDescription={settings.productsDescription}
                    items={settings.productNav}
                  />
                </li>
                <li>
                  <IndustriesMenuMobile
                    menuTitle={settings.industriesTitle}
                    menuDescription={settings.industriesDescription}
                    industries={settings.industriesNav ?? []}
                  />
                </li>
                <li>
                  <CompanyMenuMobile
                    menuTitle={settings.companyTitle}
                    menuDescription={settings.companyDescription}
                    items={settings.companyNav}
                  />
                </li>
                <li>
                  <ResourcesMenuMobile
                    menuTitle={settings.resourcesTitle}
                    menuDescription={settings.resourcesDescription}
                    items={settings.resourcesNav}
                  />
                </li>
              </ul>
            )}
          </div>
        </nav>

        <div className="shrink-0 px-4 pt-2 pb-6">
          <Link
            href="/demo"
            onClick={closeMobile}
            className="flex w-full items-center justify-center rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            Schedule a Demo
          </Link>
        </div>
        <span tabIndex={0} className="sr-only" />
      </div>
    </>
  );
}

// memo() prevents re-renders when parent (Header server component) re-renders
// with unchanged settings — e.g. on every route navigation.
const HeaderClient = memo(HeaderClientComponent);
HeaderClient.displayName = "HeaderClient";
export default HeaderClient;
