import Image from "next/image";

import type { SanityImage } from "@/src/types/sanity-image";
import { urlForImage } from "@/src/sanity/lib/utils";

export type ImageOnlySectionData = {
  _type?: "imageOnlySection";
  heading?: string;
  image?: (SanityImage & { alt?: string }) | null;
};

type Props = {
  data?: ImageOnlySectionData;
};

const MAX_WIDTH = 1200;

export default function ImageOnlySection({ data }: Props) {
  const image = data?.image;
  const heading = data?.heading?.trim();
  const imageAlt = image?.alt?.trim() || heading || "Product illustration";

  const imageUrl =
    image &&
    urlForImage(image)
      ?.width(MAX_WIDTH)
      ?.format("webp")
      ?.fit("max")
      ?.quality(88)
      ?.url();

  const blurUrl =
    image && urlForImage(image)?.width(40)?.blur(25)?.format("webp")?.fit("max")?.url();

  if (!imageUrl) return null;

  const dims = image?.asset?.metadata?.dimensions;
  const width = Math.min(dims?.width ?? MAX_WIDTH, MAX_WIDTH);
  const height = dims?.height
    ? Math.round((width / (dims.width || width)) * dims.height)
    : Math.round(width * 0.62);

  return (
    <section
      aria-labelledby={heading ? "image-only-heading" : undefined}
      className="relative w-full overflow-visible py-10"
    >

      <div className="relative mx-auto max-w-5xl px-4">
        {heading ? (
          <h2
            id="image-only-heading"
            className="mb-8 text-center text-[32px] sm:text-[42px] font-semibold leading-[110%] text-[#020210] font-manrope text-2xl tracking-tight sm:mb-10 sm:text-3xl lg:text-4xl"
          >
            {heading}
          </h2>
        ) : null}

        <figure className="mx-auto w-full">
          <div className="image_only relative max-w-6xl mx-auto">
            <style>
              {`
              .image_only:before {
                  content: '';
                  position: absolute;
                  top: -30px;
                  left: -20px;
                  width: 400px;
                  height: 300px;
                  background: radial-gradient(ellipse 60% 55% at 40% 50%, #005dff 10%, #0066ff 35%, transparent 70%);
                  background-size: 100%;
                  filter: blur(120px);
                  overflow: hidden;
                  pointer-events: none;
                }
              `}
            </style>
            <div className="image_only_img relative">
              <style>
                {`
                .image_only_img:after {
                    content: '';
                    position: absolute;
                    bottom: -100px;
                    right: 0;
                    width: 570px;
                    height: 700px;
                    background: radial-gradient(ellipse 62% 56% at 58% 50%, #88ff88 0%, #89ff89 20%, transparent 74%);
                    filter: blur(250px);
                    overflow: hidden;
                    pointer-events: none;
                  }
                `}
                </style>
              
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={1280}
                height={1155}
                placeholder={blurUrl ? "blur" : "empty"}
                blurDataURL={blurUrl || undefined}
                className="relative z-20 mx-auto h-auto w-full max-w-4xl object-cover px-2 sm:px-4 md:px-0 py-10"
                quality={80}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, min(1280px, 100vw)"
              />
            </div>
          </div>

          {/* <Image
              src={imageUrl}
              alt={imageAlt}
              width={width}
              height={height}
              className="h-auto w-full object-cover"
              sizes={`(max-width: ${MAX_WIDTH}px) 100vw, ${MAX_WIDTH}px`}
              placeholder={blurUrl ? "blur" : "empty"}
              blurDataURL={blurUrl || undefined}
            /> */}
        </figure>
      </div>
    </section>
  );
}
