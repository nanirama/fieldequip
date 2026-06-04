"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";
import {
  LazyMotion,
  m,
  useMotionValue,
  useTransform,
  animate,
  type AnimationPlaybackControls,
} from "framer-motion";

// Code-split Framer Motion features out of the initial bundle.
// useMotionValue + useTransform are in the core (~15 KB) and run
// immediately — the 3-D tilt and glow shadow work before features load.
// Only declarative animate-prop animations (scroll nudge) need features.
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

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

  // All transforms derived from core MotionValues — no features required
  const rotateX       = useTransform(progress, [0, 1], [26, 0]);
  const scale         = useTransform(progress, [0, 1], [0.83, 1]);
  const translateY    = useTransform(progress, [0, 1], [52, 0]);
  const shadowOpacity = useTransform(progress, [0, 1], [0.65, 0.18]);
  const shadowBlurRaw = useTransform(progress, [0, 1], [72, 20]);
  const shadowBlur    = useTransform(shadowBlurRaw, (v) => `blur(${v}px)`);
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
  const desktopW = imageWidth ?? 1200;
  const desktopH = imageHeight ?? 676;

  const MOBILE_W = 420;
  const mobileH  = Math.round((MOBILE_W / desktopW) * desktopH);

  const mobileSrc = imageUrlMobile ?? imageUrl;
  const blurProps = blurImageUrl
    ? { placeholder: "blur" as const, blurDataURL: blurImageUrl }
    : { placeholder: "empty" as const };

  return (
    <LazyMotion features={loadFeatures}>
      <section
        ref={sectionRef}
        aria-label="FieldEquip scheduler interface preview"
        className="relative w-full mt-4"
      >
        <div
          className="mx-auto w-full max-w-6xl px-4 sm:px-8"
          style={PERSPECTIVE_STYLE}
        >
          <m.div
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
            <m.div
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
              {/* ── Mobile image (hidden on sm+) ───────────────────────────── */}
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

              {/* ── Desktop image (hidden below sm) ───────────────────────── */}
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
          </m.div>
        </div>

        {/* Scroll nudge — declarative animation loads with domAnimation features */}
        <m.div
          aria-hidden="true"
          className="mt-12 flex flex-col items-center gap-2"
          style={{ opacity: nudgeOp }}
        >
          <m.span
            className="block h-7 w-px origin-top bg-linear-to-b from-sky-500/80 to-transparent"
            animate={{ scaleY: [0.25, 1, 0.25], opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            }}
          />
        </m.div>
      </section>
    </LazyMotion>
  );
}
