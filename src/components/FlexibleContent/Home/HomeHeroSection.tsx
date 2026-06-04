import Image from "next/image";
import dynamic from "next/dynamic";

import { ButtonComponent } from "@/src/components/ButtonComponent";
import { urlForImage } from "@/src/sanity/lib/utils";

const ScrollMorphImage = dynamic(() => import("./ScrollMorphImage"));
type HeroSectionData = {
    heading?: string;
    description?: Array<{ _type?: string; children?: Array<{ text?: string }> }>;
    image?: { alt?: string; url?: string; dimensions?: { width?: number; height?: number } };
    primaryButton?: {
        label?: string;
        url?: string;
        buttonType?: "primary" | "secondary" | "primaryBlack" | "secondarywhite" | "secondarytrnsparentWhiteBorder";
    };
    secondaryButton?: {
        label?: string;
        url?: string;
        buttonType?: "primary" | "secondary" | "primaryBlack" | "secondarywhite" | "secondarytrnsparentWhiteBorder";
    };
};

const getPortableTextPlain = (
    blocks: HeroSectionData["description"] | undefined
) => {
    if (!Array.isArray(blocks)) return "";
    return blocks
        .filter((block) => block?._type === "block")
        .map((block) => (block.children || []).map((child) => child.text || "").join(""))
        .join(" ");
};

const DEFAULT_HERO_ALT =
    "FieldEquip platform shown across laptop and mobile devices with scheduling and field operations dashboards";

const HomeHeroSection = ({ data }: { data?: HeroSectionData }) => {
    const heading = data?.heading || "One Platform. Every Field Operation. End to End.";
    const description =
        getPortableTextPlain(data?.description) ||
        "FieldEquip is a digital field service management platform that streamlines operations and boosts throughput, with predictive scheduling and automated job documentation doing the work your team used to do manually.";

    const builder = data?.image ? urlForImage(data?.image) : undefined;

    const imageUrl =
        builder
            ?.width(1200)
            ?.format("webp")
            ?.fit("crop")
            ?.quality(80)
            ?.url() || "/images/hero-image.png";

    const imageUrlMobile =
        builder
            ?.width(640)
            ?.format("webp")
            ?.fit("crop")
            ?.quality(65)
            ?.url() || imageUrl;


    const blurImageUrl =
        builder?.width(40)?.height(22)?.blur(20)?.format("webp")?.fit("crop")?.url();

    const imageAlt = data?.image?.alt?.trim() || DEFAULT_HERO_ALT;

    const imageMaxWidth = 800;
    const imgW = data?.image?.dimensions?.width
    const imgH = data?.image?.dimensions?.height
    const imageMaxHeight =
      imgW && imgH
        ? Math.round((imageMaxWidth / imgW) * imgH)
        : undefined;

    return (
        <section
            className="relative w-full bg-[linear-gradient(180deg,#162A4A_0%,#3C5B8D_40%,#6f8fc4_55%,#ffffff_70%)] bg-white mb-10 px-4 sm:px-6"
            aria-labelledby="hero-heading"
        >
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-20 md:-top-[10%]"
                aria-hidden
            >
                <Image
                    src="/images/hero-bg.png"
                    alt=""
                    fill
                    sizes="100vw"
                    quality={70}
                    className="object-cover object-top md:object-fill"
                />
            </div>
            <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-4 pt-28 text-white sm:gap-5 sm:pt-32 md:gap-6 md:pt-36 lg:pt-40 xl:pt-[160px]">
                <h1
                    id="hero-heading"
                    className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.1] lg:text-6xl xl:text-[58px] xl:leading-[110.1%]"
                >
                    {heading}
                </h1>
                <p
                    id="hero-description"
                    className="max-w-prose text-base leading-relaxed text-white/90 sm:text-lg sm:leading-[140%] sm:text-white/80 md:text-white/70"
                >
                    {description}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[14px]">
                    {data?.primaryButton && (
                        <ButtonComponent
                            variant={data?.primaryButton?.buttonType || "primary"}
                            className="w-full sm:w-auto"
                            href={data?.primaryButton?.url}
                        >
                            {data?.primaryButton?.label}
                        </ButtonComponent>
                    )}

                    {data?.secondaryButton && (
                        <ButtonComponent
                            variant={data?.secondaryButton?.buttonType || "secondary"}
                            className="w-full sm:w-auto"
                            href={data?.secondaryButton?.url}
                        >
                            {data?.secondaryButton?.label}
                        </ButtonComponent>
                    )}
                </div>
            </div>
            <div className="relative z-30 mx-auto w-full">
                <ScrollMorphImage
                    imageUrl={imageUrl}
                    imageUrlMobile={imageUrlMobile}
                    imageAlt={imageAlt}
                    imageWidth={imageMaxWidth}
                    imageHeight={imageMaxHeight}
                    blurImageUrl={blurImageUrl ?? undefined}
                />
            </div>
        </section>
    );
};

export default HomeHeroSection