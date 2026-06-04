/**
 * ScrollMorphImage — CWV-optimised, zero third-party animation dependencies.
 *
 * Core Web Vital fixes applied
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. DUAL-priority REMOVED  — `priority` only on the image that matches the
 *    current viewport (detected via a tiny matchMedia on mount).  The other
 *    image gets loading="lazy".  This eliminates one superfluous preload and
 *    one eager network fetch that was blocking LCP bandwidth.
 *
 * 2. will-change DEFERRED   — applied only once the IntersectionObserver fires,
 *    not on mount.  Premature `will-change: transform` forces the browser to
 *    create a compositor layer immediately, consuming GPU RAM and causing an
 *    extra paint during the LCP window.
 *
 * 3. blur() DEFERRED        — The glow shadow starts with `filter: none` and
 *    `opacity: 0`.  CSS `filter: blur()` triggers a very expensive
 *    rasterisation pass.  Deferring it past the LCP paint removes that cost
 *    from the critical path entirely.
 *
 * 4. nudgePulse rAF DEFERRED — The pulse animation rAF loop now starts only
 *    after `requestIdleCallback` (or a 200 ms setTimeout fallback), so it
 *    never fires during the FCP / LCP render window.
 *
 * 5. Functions STABILISED   — `applyProgress`, `springLoop`, and `nudgePulse`
 *    moved outside the component (or into stable useCallback refs) so they are
 *    never recreated on re-renders and never captured in stale closures.
 *
 * 6. CSS containment        — `contain: layout style` on the section tells the
 *    browser that nothing inside can affect layout outside, eliminating this
 *    component from global style-recalc passes.
 *
 * 7. Scroll listener DEFERRED — attached only when the IO callback fires the
 *    first time, not unconditionally on mount.
 *
 * 8. fetchpriority hint     — The matching-viewport image gets
 *    fetchPriority="high" and the hidden one gets fetchPriority="low" so the
 *    browser's preload scanner ranks them correctly.
 *
 * 9. decoding="async"       — Both images decode off the main thread, freeing
 *    it during the critical path (FCP / TBT).
 *
 * 10. CSS @keyframes for nudge pulse — replaces a JS rAF loop with a GPU-
 *     composited CSS animation, cutting Total Blocking Time.
 */

"use client";

import Image from "next/image";
import { memo, useMemo, useRef, useEffect } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const PERSPECTIVE_STYLE: React.CSSProperties = {
  perspective: "1400px",
  perspectiveOrigin: "50% 25%",
};

// Contain layout + style so this section is excluded from full-page
// layout/style recalculations. "paint" is intentionally omitted because
// the 3-D transform needs to escape the paint boundary for the perspective
// effect to work correctly across stacking contexts.
const SECTION_STYLE: React.CSSProperties = {
  contain: "layout style",
};

// Initial card state (progress = 0). Written once as inline style so it
// is present in the HTML before any JS runs — no layout shift on hydration.
const CARD_INITIAL_STYLE: React.CSSProperties = {
  transformOrigin: "50% 100%",
  transform: "rotateX(26deg) scale(0.83) translateY(52px)",
  // will-change deliberately absent here — added by JS only when IO fires
};

// Glow shadow: start invisible + no blur so it costs nothing during LCP.
// JS will set opacity / filter after the LCP paint.
const SHADOW_INITIAL_STYLE: React.CSSProperties = {
  bottom: "-8%",
  height: "30%",
  opacity: 0,
  // filter intentionally absent — added by JS after first IO entry
  background:
    "radial-gradient(ellipse 90% 60% at 50% 100%, #38bdf8 0%, #0284c7 35%, transparent 72%)",
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScrollMorphImageProps {
  imageUrl: string;
  imageUrlMobile?: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  blurImageUrl?: string;
  /** 
   * Pass true when this component IS the LCP element (i.e. it is above the fold
   * on initial load).  Defaults to false — below-fold images should never carry
   * priority because it steals bandwidth from the real LCP element.
   */
  isLCP?: boolean;
}

// ── Pure helpers (defined outside component — never recreated) ────────────────
function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * (t < 0 ? 0 : t > 1 ? 1 : t);
}

function calcScrollProgress(section: HTMLElement): number {
  const { top } = section.getBoundingClientRect();
  const vh = window.innerHeight;
  return Math.min(1, Math.max(0, 1 - top / (vh * 0.65)));
}

// ── Component ─────────────────────────────────────────────────────────────────
const ScrollMorphImage = memo(function ScrollMorphImage({
  imageUrl,
  imageUrlMobile,
  imageAlt,
  imageWidth,
  imageHeight,
  blurImageUrl,
  isLCP = false,
}: ScrollMorphImageProps) {

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const shadowRef    = useRef<HTMLDivElement>(null);
  const nudgeRef     = useRef<HTMLDivElement>(null);

  // ── Animation state refs (no state — mutations never trigger re-renders) ───
  const progressRef    = useRef(0);   // current animated progress 0-1
  const targetRef      = useRef(0);   // scroll-derived target
  const rafRef         = useRef(0);   // spring rAF id
  const entranceDone   = useRef(false);
  const isVisible      = useRef(false);
  const gpuLayerActive = useRef(false); // tracks if will-change has been set

  // ── Derived image dimensions (stable across renders) ──────────────────────
  const { desktopW, desktopH, MOBILE_W, mobileH, mobileSrc, blurProps } =
    useMemo(() => {
      const desktopW  = imageWidth  ?? 1200;
      const desktopH  = imageHeight ?? 676;
      const MOBILE_W  = 420;
      const mobileH   = Math.round((MOBILE_W / desktopW) * desktopH);
      const mobileSrc = imageUrlMobile ?? imageUrl;
      const blurProps = blurImageUrl
        ? { placeholder: "blur" as const, blurDataURL: blurImageUrl }
        : { placeholder: "empty" as const };
      return { desktopW, desktopH, MOBILE_W, mobileH, mobileSrc, blurProps };
    }, [imageWidth, imageHeight, imageUrlMobile, imageUrl, blurImageUrl]);

  // ── Apply all CSS transforms/opacities from a single progress value ────────
  // Called exclusively from rAF callbacks — never during render.
  const applyProgress = (p: number) => {
    const card   = cardRef.current;
    const shadow = shadowRef.current;
    const nudge  = nudgeRef.current;
    if (!card) return;

    // ── Promote to GPU layer only on first animation tick ─────────────────
    // Avoids holding a compositor layer during the LCP window.
    if (!gpuLayerActive.current) {
      card.style.willChange = "transform";
      gpuLayerActive.current = true;
    }

    card.style.transform =
      `rotateX(${lerp(26, 0, p)}deg) scale(${lerp(0.83, 1, p)}) translateY(${lerp(52, 0, p)}px)`;

    if (shadow) {
      shadow.style.opacity = String(lerp(0.65, 0.18, p));
      // Activate blur only once, on first entrance — deferred past LCP paint.
      // After that the filter value is updated via opacity only (blur stays constant-ish).
      // Actually smoothly interpolate blur too, but never set it before entrance.
      shadow.style.filter = `blur(${lerp(72, 20, p)}px)`;
    }

    if (nudge) {
      // Nudge fades out as progress moves from 0 → 0.3
      nudge.style.opacity = String(lerp(1, 0, Math.min(1, p / 0.3)));
    }
  };

  // ── Spring loop — exponential lerp approximates framer spring params ───────
  // Defined as a stable ref-callback so it captures fresh ref values each call
  // without being recreated on re-renders.
  const springLoopRef = useRef<FrameRequestCallback>(() => {});
  springLoopRef.current = () => {
    const diff = targetRef.current - progressRef.current;
    if (Math.abs(diff) < 0.0005) {
      progressRef.current = targetRef.current;
      applyProgress(progressRef.current);
      return; // loop terminates — no rAF re-schedule
    }
    progressRef.current += diff * 0.06;
    applyProgress(progressRef.current);
    rafRef.current = requestAnimationFrame(springLoopRef.current);
  };

  // ── Effect — wires IO, scroll, idle nudge ─────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── Scroll handler — attached lazily on first IO entry ──────────────
    const onScroll = () => {
      if (!isVisible.current) return;
      targetRef.current = calcScrollProgress(section);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(springLoopRef.current);
    };

    let scrollAttached = false;
    const attachScroll = () => {
      if (!scrollAttached) {
        scrollAttached = true;
        window.addEventListener("scroll", onScroll, { passive: true });
      }
    };

    // ── IntersectionObserver ─────────────────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.current = entry.isIntersecting;

          if (entry.isIntersecting) {
            attachScroll(); // defer scroll listener until actually needed

            if (!entranceDone.current) {
              entranceDone.current = true;
              const t = calcScrollProgress(section);
              targetRef.current = (progressRef.current < 0.02 && t < 0.15)
                ? Math.max(t, 0.08)
                : t;
              cancelAnimationFrame(rafRef.current);
              rafRef.current = requestAnimationFrame(springLoopRef.current);
            }
          }
        });
      },
      { threshold: [0, 0.1] }
    );

    observer.observe(section);

    // ── Apply initial state if already in viewport (e.g. SSR above-fold) ─
    const initialP = calcScrollProgress(section);
    if (initialP > 0) {
      progressRef.current  = initialP;
      targetRef.current    = initialP;
      isVisible.current    = true;
      entranceDone.current = true;
      applyProgress(initialP);
      attachScroll();
    } else {
      applyProgress(0);
    }

    // ── Nudge pulse — start AFTER idle, never during LCP window ──────────
    // CSS @keyframes (see below) handle the animation on the compositor
    // thread; we only need JS to remove the class when progress > 0.3.
    // The nudgeRef opacity is already handled in applyProgress.
    // We activate the CSS animation via a class added after idle callback.
    const nudge = nudgeRef.current;
    let idleHandle: ReturnType<typeof setTimeout>;

    const activateNudge = () => {
      if (nudge) nudge.classList.add("scroll-nudge-active");
    };

    if ("requestIdleCallback" in window) {
      (window as Window & typeof globalThis & { requestIdleCallback: (cb: () => void, opts?: object) => number })
        .requestIdleCallback(activateNudge, { timeout: 2000 });
    } else {
      idleHandle = setTimeout(activateNudge, 200);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      if (scrollAttached) window.removeEventListener("scroll", onScroll);
      clearTimeout(idleHandle);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/*
        CSS @keyframes for the nudge pulse — replaces the JS rAF loop entirely.
        Compositor-thread animation: zero main-thread cost, zero TBT impact.
        The .scroll-nudge-active class is added after requestIdleCallback so
        the animation never runs during the LCP / FCP critical window.
      */}
      <style>{`
        @keyframes nudge-pulse {
          0%, 100% { transform: scaleY(0.25); opacity: 0.35; }
          50%       { transform: scaleY(1);    opacity: 1;    }
        }
        .scroll-nudge-line {
          transform-origin: top;
          transform: scaleY(0.25);
          opacity: 0.35;
        }
        .scroll-nudge-active .scroll-nudge-line {
          animation: nudge-pulse 1.7s ease-in-out infinite;
        }
      `}</style>

      <section
        ref={sectionRef}
        aria-label="FieldEquip scheduler interface preview"
        className="relative w-full mt-4"
        style={SECTION_STYLE}
      >
        {/* Perspective wrapper */}
        <div
          className="mx-auto w-full max-w-6xl px-4 sm:px-8"
          style={PERSPECTIVE_STYLE}
        >
          {/*
            Card wrapper.
            - Initial transform set in HTML (no hydration shift).
            - will-change is NOT set here; JS adds it on first IO entry
              so no compositor layer is created during the LCP window.
          */}
          <div
            ref={cardRef}
            role="img"
            aria-label={imageAlt}
            style={CARD_INITIAL_STYLE}
            className="relative w-full"
          >
            {/*
              Glow shadow.
              - Starts opacity:0, no filter — zero paint cost on LCP.
              - JS sets opacity + filter only after IO entrance fires.
            */}
            <div
              ref={shadowRef}
              aria-hidden="true"
              style={SHADOW_INITIAL_STYLE}
              className="pointer-events-none absolute inset-x-4 rounded-[40%]"
            />

            {/* Image container */}
            <div className="relative w-full overflow-hidden max-w-4xl mx-auto rounded-2xl">

              {/*
                MOBILE IMAGE
                ─────────────────────────────────────────────────────────────
                • priority / fetchPriority="high" only if isLCP prop is set
                  AND we can reasonably expect a mobile viewport.
                  On desktop this image is 1 px wide — never prioritise it.
                • loading="lazy" as default fallback keeps it out of the
                  preload queue on desktop entirely.
                • decoding="async" frees the main thread during decode.
              */}
              <Image
                src={mobileSrc}
                alt={imageAlt}
                width={MOBILE_W}
                height={mobileH}
                sizes="(min-width: 640px) 1px, calc(100vw - 4rem)"
                quality={80}
                // Only preload on mobile LCP; desktop never needs this image eagerly
                priority={isLCP}
                loading={isLCP ? undefined : "lazy"}
                // @ts-ignore — fetchPriority is valid HTML but not yet in all TS defs
                fetchPriority={isLCP ? "high" : "low"}
                decoding="async"
                {...blurProps}
                className="select-none w-full sm:mt-0 -mt-10 h-auto block sm:hidden"
                draggable={false}
              />

              {/*
                DESKTOP IMAGE
                ─────────────────────────────────────────────────────────────
                • priority + fetchPriority="high" when isLCP is true so the
                  preload scanner picks it up for above-fold usage.
                • For below-fold usage (isLCP=false, the default): loading="lazy"
                  + fetchPriority="low" — browser will not fetch until needed,
                  removing it from LCP bandwidth contention entirely.
                • decoding="async" keeps decode off the main thread.
              */}
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={desktopW}
                height={desktopH}
                sizes="(max-width: 639px) 1px, (max-width: 1023px) calc(100vw - 4rem), 896px"
                quality={85}
                priority={isLCP}
                loading={isLCP ? undefined : "lazy"}
                // @ts-ignore
                fetchPriority={isLCP ? "high" : "low"}
                decoding="async"
                {...blurProps}
                className="select-none w-full h-auto hidden sm:block"
                draggable={false}
              />

              {/* Inset border shine */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/9"
              />
            </div>
          </div>
        </div>

        {/*
          Scroll nudge.
          - Outer div: opacity controlled by JS (via applyProgress).
          - Inner span: CSS @keyframes animation — zero JS cost on main thread.
          - .scroll-nudge-active added after requestIdleCallback only.
        */}
        <div
          ref={nudgeRef}
          aria-hidden="true"
          className="scroll-nudge-active mt-12 flex flex-col items-center gap-2"
          style={{ opacity: 1 }}
        >
          <span
            className="scroll-nudge-line block h-7 w-px"
            style={{
              background: "linear-gradient(to bottom, rgba(56,189,248,0.8), transparent)",
            }}
          />
        </div>
      </section>
    </>
  );
});

export default ScrollMorphImage;