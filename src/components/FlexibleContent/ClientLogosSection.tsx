"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { useSlickSlideFocusFix } from "@/src/hooks/useSlickSlideFocusFix";

type Logo = {
    link?: string;
    logo?: {
        alt?: string;
        url?: string;
    };
};

type ClientLogosSectionData = {
    logos?: Logo[];
};

const fallbackLogos: Logo[] = [
    { logo: { url: "/images/logo1.webp", alt: "Client 1" } },
    { logo: { url: "/images/logo2.webp", alt: "Client 2" } },
    { logo: { url: "/images/logo3.webp", alt: "Client 3" } },
    { logo: { url: "/images/logo4.webp", alt: "Client 4" } },
    { logo: { url: "/images/logo5.webp", alt: "Client 5" } },
    { logo: { url: "/images/logo6.webp", alt: "Client 6" } },
    { logo: { url: "/images/logo7.webp", alt: "Client 7" } },
    { logo: { url: "/images/logo8.webp", alt: "Client 8" } },
    { logo: { url: "/images/logo9.webp", alt: "Client 9" } },
];

const ClientLogosSection = ({ data }: { data?: ClientLogosSectionData }) => {
    const logos = Array.isArray(data?.logos) && data.logos.length > 0 ? data.logos : fallbackLogos;

    const slickWrapRef = useRef<HTMLDivElement>(null);
    const { onInit, onReInit, afterChange } = useSlickSlideFocusFix(slickWrapRef);

    const settings = useMemo(
        () => ({
            infinite: true,
            slidesToShow: 7,       // desktop ≥ 1024 px
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            autoplay: true,
            autoplaySpeed: 0,      // fire next transition immediately
            speed: 5000,           // 5 s transition → smooth continuous feel
            cssEase: "linear",     // constant speed, no easing
            pauseOnHover: false,
            swipe: false,          // ticker — swipe conflicts with iOS page scroll
            draggable: false,
            //waitForAnimate: false, // no micro-pause between cycles on Safari
            responsive: [
                // tablet  768 px – 1023 px → 5 items
                { breakpoint: 1024, settings: { slidesToShow: 5 } },
                // mobile  < 768 px → 2 items (covers all iPhones & narrow windows)
                { breakpoint: 768,  settings: { slidesToShow: 3 } },
                { breakpoint: 600,  settings: { slidesToShow: 2 } },
            ],
            onInit,
            onReInit,
            afterChange,
        }),
        [onInit, onReInit, afterChange],
    );

    const msettings = useMemo(
        () => ({
            infinite: true,
            slidesToShow: 2,       // desktop ≥ 1024 px
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            autoplay: true,
            autoplaySpeed: 0,      // fire next transition immediately
            speed: 5000,           // 5 s transition → smooth continuous feel
            cssEase: "linear",     // constant speed, no easing
            pauseOnHover: false,
            swipe: false,          // ticker — swipe conflicts with iOS page scroll
            draggable: false,
            //waitForAnimate: false, // no micro-pause between cycles on Safari
            responsive: [
                // tablet  768 px – 1023 px → 5 items
                { breakpoint: 1024, settings: { slidesToShow: 3 } },
                // mobile  < 768 px → 2 items (covers all iPhones & narrow windows)
                { breakpoint: 768,  settings: { slidesToShow: 3 } },
                { breakpoint: 600,  settings: { slidesToShow: 2 } },
            ],
            onInit,
            onReInit,
            afterChange,
        }),
        [onInit, onReInit, afterChange],
    );

    return (
        <>
            <div className="w-full sm:pt-16 pt-10 pb-4" ref={slickWrapRef}>
                <div className="md:hidden block">
                    <Slider {...msettings}>
                        {logos.concat(logos).map((logo, index) =>
                            logo.logo?.url ? (
                                <div key={index} className="px-6">
                                    <div className="flex items-center justify-center h-[110px]">
                                        {logo.link ? (
                                            <Link href={logo.link} target="_blank" rel="noreferrer noopener">
                                                <Image
                                                    src={logo.logo.url}
                                                    alt={logo.logo.alt || "client logo"}
                                                    width={160}
                                                    height={90}
                                                    style={{ width: "auto", height: "auto", maxWidth: "min(160px, 100%)", maxHeight: 90 }}
                                                    className="object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
                                                />
                                            </Link>
                                        ) : (
                                            <Image
                                                src={logo.logo.url}
                                                alt={logo.logo.alt || "client logo"}
                                                width={160}
                                                height={90}
                                                style={{ width: "auto", height: "auto", maxWidth: "min(160px, 100%)", maxHeight: 90 }}
                                                className="object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}
                    </Slider>
                </div>
                <div className="hidden sm:block">
                    <Slider {...settings}>
                        {logos.concat(logos).map((logo, index) =>
                            logo.logo?.url ? (
                                <div key={index} className="px-6">
                                    <div className="flex items-center justify-center h-[110px]">
                                        {logo.link ? (
                                            <Link href={logo.link} target="_blank" rel="noreferrer noopener">
                                                <Image
                                                    src={logo.logo.url}
                                                    alt={logo.logo.alt || "client logo"}
                                                    width={160}
                                                    height={90}
                                                    style={{ width: "auto", height: "auto", maxWidth: "min(160px, 100%)", maxHeight: 90 }}
                                                    className="object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
                                                />
                                            </Link>
                                        ) : (
                                            <Image
                                                src={logo.logo.url}
                                                alt={logo.logo.alt || "client logo"}
                                                width={160}
                                                height={90}
                                                style={{ width: "auto", height: "auto", maxWidth: "min(160px, 100%)", maxHeight: 90 }}
                                                className="object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}
                    </Slider>
                </div>
            </div>
        </>
    )
}
export default ClientLogosSection;
