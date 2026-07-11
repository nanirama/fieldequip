"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

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

type MenuDropdownProps = {
  label: string;
  layout?: "dark" | "light";
  buttonClassName?: string;
  /** Panel body. Rendered by a Server Component, so its (large) link/icon DOM
   *  stays in the HTML for crawlers but never enters the hydration tree. */
  children: ReactNode;
};

/**
 * Thin client shell for a header mega-menu: the button, the open/close state and
 * the panel wrapper. Mouse hover and keyboard focus open the panel purely in CSS
 * (group-hover/menu, group-focus-within/menu); the isOpen state exists only so a
 * tap works on touch devices at >=1024px, where :hover never fires.
 */
export default function MenuDropdown({
  label,
  layout = "light",
  buttonClassName = "",
  children,
}: MenuDropdownProps) {
  const isDark = layout === "dark";
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <li ref={containerRef} className="group/menu relative list-none">
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
        {label}
        <ChevronRightIcon className="h-3 w-3 rotate-90 text-teal-500 transition-transform duration-200 group-hover/menu:-rotate-90 group-focus-within/menu:-rotate-90" />
      </button>

      <div
        aria-label={label}
        // Clicking any link inside the panel closes it (replaces the per-link
        // close() the old client menus did).
        onClick={close}
        className={[
          "fixed left-1/2 top-20 z-50 w-[calc(100vw-2rem)] max-w-7xl",
          "-translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/10",
          "transition duration-200 ease-out",
          "group-hover/menu:pointer-events-auto group-hover/menu:visible group-hover/menu:opacity-100",
          "group-focus-within/menu:pointer-events-auto group-focus-within/menu:visible group-focus-within/menu:opacity-100",
          isOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
      >
        {children}
      </div>
    </li>
  );
}
