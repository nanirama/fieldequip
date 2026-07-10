"use client";

import Image from "next/image";
import { useState } from "react";

import CapabilitiesAccordion, {
  type CapabilityItem,
} from "@/src/components/FlexibleContent/CapabilitiesAccordion";
import { urlForImage } from "@/src/sanity/lib/utils";

export interface FeatureBlockData {
  heading: string;
  layout?: "imageLeft" | "imageRight";
  capabilities?: CapabilityItem[];
}

function FeatureBlock({ feature }: { feature: FeatureBlockData }) {
  const { heading, layout, capabilities } = feature;
  const isImageLeft = layout === "imageLeft" || layout === undefined;

  const [activeIndex, setActiveIndex] = useState(0);
  const displayImage = capabilities?.[activeIndex]?.image;

  const built = displayImage ? urlForImage(displayImage) : undefined;
  const src = built?.width(840).quality(85).url() ?? "";
  const blurDataURL = built?.width(40).height(40).blur(20).format("webp").url();

  const meta =
    displayImage?.asset && typeof displayImage.asset === "object" && "metadata" in displayImage.asset
      ? (displayImage.asset as { metadata?: { dimensions?: { width?: number; height?: number } } })
          .metadata
      : undefined;
  const width = meta?.dimensions?.width ?? 800;
  const height = meta?.dimensions?.height ?? 600;

  const imageBlock = src ? (
    <div className="relative w-full md:mt-4 mt-2 mx-auto sm:mx-0 shrink-0 flex flex-1 justify-center items-start">
      <figure className="relative rounded-[14px] flex-1 overflow-hidden bg-white">
        <Image
          src={src}
          alt={displayImage?.alt ?? heading}
          width={width}
          height={height}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 600px"
          className="w-full h-auto object-contain max-h-[600px]"
          quality={80}
        />
      </figure>
    </div>
  ) : null;

  const contentBlock = (
    <div className="flex-1 min-w-0">
      <div className="mb-6">
        <h3 className="text-2xl sm:text-[32px] font-semibold leading-tight tracking-tight text-[#020210]">
          {heading}
        </h3>
      </div>
      {capabilities && capabilities.length > 0 && (
        <CapabilitiesAccordion
          capabilities={capabilities}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />
      )}
    </div>
  );

  if (!imageBlock) {
    return <article className="max-w-3xl mx-auto flex-1">{contentBlock}</article>;
  }

  return (
    <article className="flex md:flex-row flex-col justfiy-between items-start gap-8 lg:gap-16 grid md:grid-cols-2">
      {isImageLeft ? (
        <>
          {imageBlock}
          {contentBlock}
        </>
      ) : (
        <>
          <div className="sm:order-2">{imageBlock}</div>
          <div className="sm:order-1">{contentBlock}</div>
        </>
      )}
    </article>
  );
}

export default function FeaturesCapabilitiesClient({ feature }: { feature: FeatureBlockData }) {
  return <FeatureBlock feature={feature} />;
}
