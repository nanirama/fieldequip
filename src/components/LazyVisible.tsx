"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyVisibleProps = {
  /** Reserve roughly the section's height so nothing shifts (CLS) before it mounts. */
  minHeight?: number;
  rootMargin?: string;
  children: ReactNode;
};

/**
 * Renders nothing but a height-reserving placeholder until it scrolls near the
 * viewport, then mounts `children`. Used to keep heavy, below-the-fold client
 * widgets (the react-slick carousels) out of the initial hydration pass — their
 * script parse, hydration and slick's layout reads no longer run inside the LCP
 * window, they run when the user actually scrolls down to them.
 */
export default function LazyVisible({ minHeight = 600, rootMargin = "300px", children }: LazyVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
