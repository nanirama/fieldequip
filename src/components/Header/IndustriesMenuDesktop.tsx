"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/src/sanity/lib/utils";
import { getSlugUrl } from "@/src/lib/utils";
import type { CmsIndustriesNavItem } from "./menu-types";

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

type IndustriesMenuDesktopProps = {
  buttonClassName?: string;
  layout?: "dark" | "light";
  menuTitle?: string | null;
  menuDescription?: string | null;
  industries: CmsIndustriesNavItem[];
};

function IndustriesMenuDesktopComponent({
  buttonClassName = "",
  layout = "light",
  menuTitle,
  menuDescription,
  industries,
}: IndustriesMenuDesktopProps) {
  const isDark = layout === "dark";
  const title = menuTitle?.trim() || "Industries";
  const description = menuDescription?.trim() || "Explore all of our industries that can leverage our product";

  // Safari/iPad: CSS :hover doesn't fire on tap. A click-toggle state is the
  // only reliable mechanism for touch users at the lg breakpoint (≥1024px).
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <li ref={containerRef} className="group/industries relative list-none">
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
        Industries
        <ChevronRightIcon className="h-3 w-3 rotate-90 text-teal-500 transition-transform duration-200 group-hover/industries:-rotate-90 group-focus-within/industries:-rotate-90" />
      </button>

      <div
        aria-label="Industries"
        className={[
          "fixed left-1/2 top-20 z-50 w-[calc(100vw-2rem)] max-w-7xl",
          "-translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10",
          "transition duration-200 ease-out",
          "group-hover/industries:pointer-events-auto group-hover/industries:visible group-hover/industries:opacity-100",
          "group-focus-within/industries:pointer-events-auto group-focus-within/industries:visible group-focus-within/industries:opacity-100",
          isOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
      >
        <div className="grid grid-cols-[250px_1fr] gap-6 items-end">
          <div className="border-r border-[#8B9DBA]/50 pr-6 h-full flex flex-col justify-end">
            <Link href="/">
            <Image src="/images/tinylogo.png" alt="FieldEquip" width={41} height={35} className="h-auto" />
            </Link>
            <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
            <p className="mt-3 text-base leading-[130%] text-[#020210]">{description}</p>
          </div>

          <ul
            className="grid grid-cols-2 gap-x-6 gap-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-teal-300/70 [&::-webkit-scrollbar-thumb:hover]:bg-teal-400"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#5eead4 #f1f5f9" }}
            role="none"
          >
            {industries.map((item) => {
              const imgSrc = item.image ? urlForImage(item.image)?.width(600).height(260).url() : undefined;
              const href = item._type ? getSlugUrl(item._type, item.slug ?? undefined) : "#";
              return (
                <li key={href} className="min-w-0">
                  <Link
                    href={href}
                    prefetch={false}
                    className="group/item block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    {imgSrc && (
                      <div className="overflow-hidden rounded-xl">
                        <Image
                          src={imgSrc}
                          alt={item.title}
                          width={600}
                          height={260}
                          className="h-39.5 w-full object-cover transition-transform duration-300 group-hover/item:scale-[1.02]"
                          quality={75}
                        />
                      </div>
                    )}
                    <p className="mt-2 inline-flex items-center gap-2 text-[22px] pt-2 font-semibold leading-tight text-[#020210] transition-colors group-hover/item:text-teal-600">
                      {item.title}
                      <ChevronRightIcon className="h-3 w-3 text-teal-500" />
                    </p>
                    {item.description && (
                      <p className="mt-1.5 text-base leading-[130%] text-[#020210]">{item.description}</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}

const IndustriesMenuDesktop = memo(IndustriesMenuDesktopComponent);
IndustriesMenuDesktop.displayName = "IndustriesMenuDesktop";
export default IndustriesMenuDesktop;
