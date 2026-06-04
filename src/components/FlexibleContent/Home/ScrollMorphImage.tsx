"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────────
const PERSPECTIVE_STYLE = {
  perspective: "1400px",
  perspectiveOrigin: "50% 25%",
} as const;

const IO_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i * 0.05);

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScrollMorphImageProps {
  imageUrl: string;
  imageUrlMobile?: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  blurImageUrl?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScrollMorphImage({
  imageUrl,
  imageUrlMobile,
  imageAlt,
  imageWidth,
  imageHeight,
  blurImageUrl,
}: ScrollMorphImageProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Single source of truth — 0 = fully tilted, 1 = fully flat
  const progress = useMotionValue(0);

  const rotateX       = useTransform(progress, [0, 1], [26, 0]);
  const scale         = useTransform(progress, [0, 1], [0.83, 1]);
  const translateY    = useTransform(progress, [0, 1], [52, 0]);
  const shadowOpacity = useTransform(progress, [0, 1], [0.65, 0.18]);
  const shadowBlurRaw = useTransform(progress, [0, 1], [72, 20]);
  const shadowBlur    = useTransform(shadowBlurRaw, (v) => `blur(${v}px)`);
  const overlayOp     = useTransform(progress, [0, 1], [0.6, 0]);
  const nudgeOp       = useTransform(progress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const calcProgress = (): number => {
      const { top } = section.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.min(1, Math.max(0, 1 - top / (vh * 0.65)));
    };

    let rafId = 0;
    let currentAnim: AnimationPlaybackControls | null = null;
    let isVisible = false;
    let entranceDone = false;

    const syncProgress = () => { progress.set(calcProgress()); };

    const onScroll = () => {
      if (!isVisible) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (entry.isIntersecting && !entranceDone) {
            entranceDone = true;
            const target = calcProgress();
            if (progress.get() < 0.02 && target < 0.15) {
              currentAnim?.stop();
              currentAnim = animate(progress, Math.max(target, 0.08), {
                type: "spring",
                stiffness: 50,
                damping: 20,
                mass: 0.9,
                restDelta: 0.0005,
                onComplete: () => { currentAnim = null; },
              });
            } else {
              progress.set(target);
            }
          }
        });
      },
      { threshold: IO_THRESHOLDS }
    );

    observer.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });

    const initialP = calcProgress();
    if (initialP > 0) {
      progress.set(initialP);
      isVisible = true;
      entranceDone = true;
    }

    return () => {
      cancelAnimationFrame(rafId);
      currentAnim?.stop();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [progress]);

  // ── Derived dimensions ────────────────────────────────────────────────────
  const desktopW = imageWidth ?? 800;
  const desktopH = imageHeight ?? 451;

  // Mobile: intrinsic width=350 caps the srcset at ≤700px (2×350).
  // This excludes the 750px deviceSize entry, forcing the browser to pick
  // 640px max (at 2× DPR) or 384px (at 1× DPR) — significantly smaller files.
  const MOBILE_W = 350;
  const mobileH  = Math.round((MOBILE_W / desktopW) * desktopH);

  const mobileSrc  = imageUrlMobile ?? imageUrl;
  const blurProps  = blurImageUrl
    ? { placeholder: "blur" as const, blurDataURL: blurImageUrl }
    : { placeholder: "empty" as const };

  return (
    <section
      ref={sectionRef}
      aria-label="FieldEquip scheduler interface preview"
      className="relative w-full mt-4"
    >
      <div
        className="mx-auto w-full max-w-6xl px-4 sm:px-8"
        style={PERSPECTIVE_STYLE}
      >
        <motion.div
          style={{
            rotateX,
            scale,
            y: translateY,
            transformOrigin: "50% 100%",
            willChange: "transform",
          }}
          className="relative w-full"
          role="img"
          aria-label={imageAlt}
        >
          {/* Glow shadow — outside overflow-hidden so it is never clipped */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 rounded-[40%]"
            style={{
              opacity: shadowOpacity,
              filter: shadowBlur,
              bottom: "-8%",
              height: "30%",
              background:
                "radial-gradient(ellipse 90% 60% at 50% 100%, #38bdf8 0%, #0284c7 35%, transparent 72%)",
            }}
          />

          <div className="relative w-full overflow-hidden max-w-4xl mx-auto rounded-2xl">

            {/* ── Mobile image ──────────────────────────────────────────────
                width=350 → Next.js srcset capped at 700px (2×350).
                Excludes the 750px device-size entry.
                Browser picks: 384px @1×  |  640px @2×
                quality=65 for an additional ~25% byte reduction vs quality=75.
            */}
            <Image
              src={mobileSrc}
              alt={imageAlt}
              width={MOBILE_W}
              height={mobileH}
              sizes="calc(100vw - 2rem)"
              quality={65}
              priority
              {...blurProps}
              className="select-none sm:w-full w-[100%] sm:mt-0 mt-[-40px] h-auto block sm:hidden"
              draggable={false}
            />

            {/* ── Desktop image ─────────────────────────────────────────────
                Full-resolution with complete deviceSizes srcset.
                Hidden on mobile so it is never downloaded on narrow viewports.
            */}
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={desktopW}
              height={desktopH}
              sizes="(max-width: 1024px) calc(100vw - 4rem), 800px"
              quality={75}
              priority
              {...blurProps}
              className="select-none w-full h-auto hidden sm:block"
              draggable={false}
            />

            {/* Depth-haze overlay — fades as rotateX → 0° */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: overlayOp,
                background:
                  "linear-gradient(to bottom, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.22) 45%, transparent 68%)",
              }}
            />

            {/* Inset border shine */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/9"
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll nudge */}
      <motion.div
        aria-hidden="true"
        className="mt-12 flex flex-col items-center gap-2"
        style={{ opacity: nudgeOp }}
      >
        {/* <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
          Scroll to explore
        </span> */}
        <motion.span
          className="block h-7 w-px origin-top bg-linear-to-b from-sky-500/80 to-transparent"
          animate={{ scaleY: [0.25, 1, 0.25], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          }}
        />
      </motion.div>
    </section>
  );
}
