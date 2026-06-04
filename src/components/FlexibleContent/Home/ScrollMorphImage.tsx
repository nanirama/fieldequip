"use client";

import Image from "next/image";
import { memo, useMemo, useRef, useEffect } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const PERSPECTIVE_STYLE = {
  perspective: "1400px",
  perspectiveOrigin: "50% 25%",
} as const;

const IO_THRESHOLDS = [0, 0.1];

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScrollMorphImageProps {
  imageUrl: string;
  imageUrlMobile?: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  blurImageUrl?: string;
}

// ── Lerp helper — smooth spring-like interpolation ────────────────────────────
// Maps a 0-1 progress value linearly between `from` and `to`.
function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * Math.min(1, Math.max(0, t));
}

// ── Component ─────────────────────────────────────────────────────────────────
const ScrollMorphImage = memo(function ScrollMorphImage({
  imageUrl,
  imageUrlMobile,
  imageAlt,
  imageWidth,
  imageHeight,
  blurImageUrl,
}: ScrollMorphImageProps) {
  const sectionRef   = useRef<HTMLElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);
  const shadowRef    = useRef<HTMLDivElement>(null);
  const nudgeRef     = useRef<HTMLDivElement>(null);
  const nudgeLineRef = useRef<HTMLSpanElement>(null);
  const progressRef  = useRef(0);        // current animated progress (0-1)
  const targetRef    = useRef(0);        // target progress from scroll
  const rafRef       = useRef(0);        // rAF id for spring loop
  const nudgeRafRef  = useRef(0);        // rAF id for nudge pulse
  const entranceDone = useRef(false);
  const isVisible    = useRef(false);

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

  // ── Apply derived CSS properties from a 0-1 progress value ─────────────────
  const applyProgress = (p: number) => {
    const rotateX       = lerp(26, 0, p);
    const scale         = lerp(0.83, 1, p);
    const translateY    = lerp(52, 0, p);
    const shadowOpacity = lerp(0.65, 0.18, p);
    const shadowBlur    = lerp(72, 20, p);
    // nudge fades out between progress 0-0.3
    const nudgeProgress = Math.min(1, p / 0.3);
    const nudgeOpacity  = lerp(1, 0, nudgeProgress);

    if (cardRef.current) {
      cardRef.current.style.transform =
        `rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;
    }
    if (shadowRef.current) {
      shadowRef.current.style.opacity = String(shadowOpacity);
      shadowRef.current.style.filter  = `blur(${shadowBlur}px)`;
    }
    if (nudgeRef.current) {
      nudgeRef.current.style.opacity = String(nudgeOpacity);
    }
  };

  // ── Smooth spring-like loop (runs while entrance is animating) ──────────────
  // Mimics framer-motion spring: stiffness 50, damping 20, mass 0.9
  // Approximated with exponential lerp each frame (~60fps)
  const springLoop = () => {
    const current = progressRef.current;
    const target  = targetRef.current;
    const diff    = target - current;

    // Exponential ease: converges quickly, slows near target (similar to spring)
    const next = current + diff * 0.06; // ~spring factor
    progressRef.current = Math.abs(diff) < 0.0005 ? target : next;

    applyProgress(progressRef.current);

    if (Math.abs(diff) > 0.0005) {
      rafRef.current = requestAnimationFrame(springLoop);
    }
  };

  // ── Scroll nudge pulse animation (replaces framer-motion loop) ──────────────
  // Replicates: scaleY [0.25 → 1 → 0.25], opacity [0.35 → 1 → 0.35], 1.7s easeInOut
  const NUDGE_DURATION = 1700; // ms
  let nudgeStart: number | null = null;

  const nudgePulse = (timestamp: number) => {
    if (!nudgeLineRef.current) return;
    if (nudgeStart === null) nudgeStart = timestamp;
    const elapsed = (timestamp - nudgeStart) % NUDGE_DURATION;
    const t = elapsed / NUDGE_DURATION; // 0-1 within cycle

    // easeInOut (cosine)
    const eased = (1 - Math.cos(t * Math.PI * 2)) / 2; // 0→1→0 sine wave
    const scaleY  = lerp(0.25, 1, eased);
    const opacity = lerp(0.35, 1, eased);

    nudgeLineRef.current.style.transform = `scaleY(${scaleY})`;
    nudgeLineRef.current.style.opacity   = String(opacity);

    nudgeRafRef.current = requestAnimationFrame(nudgePulse);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const calcTarget = (): number => {
      const { top } = section.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, 1 - top / (vh * 0.65)));
    };

    // Start nudge pulse loop immediately
    nudgeRafRef.current = requestAnimationFrame(nudgePulse);

    const onScroll = () => {
      if (!isVisible.current) return;
      targetRef.current = calcTarget();
      // Let the spring loop pick up the new target
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(springLoop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.current = entry.isIntersecting;

          if (entry.isIntersecting && !entranceDone.current) {
            entranceDone.current = true;
            const t = calcTarget();

            if (progressRef.current < 0.02 && t < 0.15) {
              // Entrance spring: animate to at least 0.08
              targetRef.current = Math.max(t, 0.08);
            } else {
              targetRef.current = t;
            }

            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(springLoop);
          }
        });
      },
      { threshold: IO_THRESHOLDS }
    );

    observer.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });

    // If already partially scrolled into view on mount
    const initialP = calcTarget();
    if (initialP > 0) {
      progressRef.current  = initialP;
      targetRef.current    = initialP;
      isVisible.current    = true;
      entranceDone.current = true;
      applyProgress(initialP);
    } else {
      // Apply initial tilted state (progress = 0)
      applyProgress(0);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(nudgeRafRef.current);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="FieldEquip scheduler interface preview"
      className="relative w-full mt-4"
    >
      {/* ── Perspective wrapper ────────────────────────────────────────────── */}
      <div
        className="mx-auto w-full max-w-6xl px-4 sm:px-8"
        style={PERSPECTIVE_STYLE}
      >
        {/*
          Card: receives rotateX / scale / translateY via JS.
          transformOrigin matches framer-motion: "50% 100%" (bottom-center).
          will-change: transform tells the browser to promote to its own layer.
        */}
        <div
          ref={cardRef}
          role="img"
          aria-label={imageAlt}
          style={{
            transformOrigin: "50% 100%",
            willChange: "transform",
            // Initial state — matches progress = 0
            transform: "rotateX(26deg) scale(0.83) translateY(52px)",
          }}
          className="relative w-full"
        >
          {/* ── Glow shadow ─────────────────────────────────────────────────── */}
          <div
            ref={shadowRef}
            aria-hidden="true"
            style={{
              bottom: "-8%",
              height: "30%",
              opacity: 0.65,
              filter: "blur(72px)",
              background:
                "radial-gradient(ellipse 90% 60% at 50% 100%, #38bdf8 0%, #0284c7 35%, transparent 72%)",
            }}
            className="pointer-events-none absolute inset-x-4 rounded-[40%]"
          />

          {/* ── Image container ─────────────────────────────────────────────── */}
          <div className="relative w-full overflow-hidden max-w-4xl mx-auto rounded-2xl">
            {/* Mobile image */}
            <Image
              src={mobileSrc}
              alt={imageAlt}
              width={MOBILE_W}
              height={mobileH}
              sizes="(min-width: 640px) 1px, calc(100vw - 4rem)"
              quality={82}
              priority
              {...blurProps}
              className="select-none w-full sm:mt-0 -mt-10 h-auto block sm:hidden"
              draggable={false}
            />

            {/* Desktop image */}
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={desktopW}
              height={desktopH}
              sizes="(max-width: 639px) 1px, (max-width: 1023px) calc(100vw - 4rem), 896px"
              quality={85}
              priority
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

      {/* ── Scroll nudge indicator ───────────────────────────────────────────── */}
      {/*
        Outer div fades out as progress reaches 0.3 (controlled by JS).
        Inner span pulses scaleY + opacity in a rAF loop (replaces framer animate).
        transformOrigin: top — so the line grows/shrinks downward.
      */}
      <div
        ref={nudgeRef}
        aria-hidden="true"
        className="mt-12 flex flex-col items-center gap-2"
        style={{ opacity: 1 }}
      >
        <span
          ref={nudgeLineRef}
          className="block h-7 w-px"
          style={{
            transformOrigin: "top",
            background: "linear-gradient(to bottom, rgba(56,189,248,0.8), transparent)",
            // Initial state matches first frame: scaleY=0.25, opacity=0.35
            transform: "scaleY(0.25)",
            opacity: 0.35,
          }}
        />
      </div>
    </section>
  );
});

export default ScrollMorphImage;
