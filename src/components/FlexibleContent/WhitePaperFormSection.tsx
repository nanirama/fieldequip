import Image from "next/image";
import { urlForImage } from "@/src/sanity/lib/utils";
import type { SanityImage } from "@/src/types/sanity-image";
import HubSpotForm from "./HubSpotForm";

export type WhitePaperFormSectionData = {
  _key?: string;
  formHeading?: string;
  formId?: string;
  featuredImage?: SanityImage & { alt?: string; lqip?: string };
};

type Props = {
  data?: WhitePaperFormSectionData;
  page?: string;
};

export default function WhitePaperFormSection({ data }: Props) {
  const formHeading = data?.formHeading?.trim();
  const formId = data?.formId?.trim();
  const image = data?.featuredImage;

  // Exact design dimensions: 436 × 590 — request at 2× for retina
  const imageUrl = image
    ? urlForImage(image)?.width(872).height(1180).format("webp").quality(85).url()
    : undefined;

  const imageAlt =
    image?.alt?.trim() ||
    (formHeading ? `${formHeading} — whitepaper cover` : "Whitepaper cover");

  return (
    <section className="w-full px-4 md:py-8 py-4 sm:pt-14 z-50">
      <div className="relative mx-auto max-w-7xl bg-[#EBEFF4] rounded-2xl">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:gap-10 md:gap-6 gap-2 lg:grid-cols-2 lg:items-center relative">
          <div className="relative flex justify-center  items-start  order-2 lg:order-1">
            <div className="relative md:w-[436px] lg:-my-8 my-4 w-full h-auto rounded-xl flex-shrink-0 overflow-visible p-6 md:p-0 ">
              {imageUrl && (
              <Image
                src={imageUrl}
                alt={imageAlt}
                width={436}
                height={590}
                priority
                fetchPriority="high"
                placeholder={image?.lqip ? "blur" : "empty"}
                blurDataURL={image?.lqip}
                className="h-[590px] w-auto rounded-lg shadow-2xl"
                quality={80}
              />
              )}
              
            </div>
          </div>
          {/* ── Left Content ── */}
          <div className="z-10 min-h-125 order-1 lg:order-2">
            <div className="min-w-0 flex-1">  
              <h1 className="text-2xl font-bold my-4 text-[#020210] sm:text-3xl pt-6 pl-6 sm:pt-8 sm:pl-8 ">Get Your Free Copy</h1>           
              <HubSpotForm formId={formId}  />
            </div>
          </div>

          {/* ── Right Image Card ── */}
          
        </div>
      </div>
    </section>
  )
}


// return (
//   <section className="w-full bg-[#EBEFF4] py-14 sm:py-16 lg:py-20">
//     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//       {/*
//         Mobile: form on top, image below  →  flex-col (form first in DOM)
//         Desktop: image on left, form on right  →  lg:flex-row + order utilities
//       */}
//       <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

//         {/* ── Form column (DOM first → top on mobile) ── */}
//         <div className="min-w-0 flex-1 order-1 lg:order-2">
//           {formHeading && (
//             <h2
//               className="mb-6 font-inter text-[32px] font-semibold leading-[1.2] tracking-normal text-[#020210]"
//             >
//               {formHeading}
//             </h2>
//           )}
//           <HubSpotForm formId={formId} />
//         </div>

//         {/* ── Image column (DOM second → bottom on mobile, left on desktop) ── */}
//         {imageUrl && (
//           <div className="order-2 lg:order-1 flex justify-center lg:flex-shrink-0">
//             {/* White offset card creates the depth effect from the design */}
//             <div className="relative">
//               <div
//                 className="absolute -left-2 -top-2 bottom-2 right-2 rounded-xl bg-white shadow-md"
//                 aria-hidden
//               />
//               <Image
//                 src={imageUrl}
//                 alt={imageAlt}
//                 width={436}
//                 height={590}
//                 priority
//                 fetchPriority="high"
//                 placeholder={image?.lqip ? "blur" : "empty"}
//                 blurDataURL={image?.lqip}
//                 className="relative rounded-xl object-cover w-full"
//                 style={{ maxWidth: "436px", height: "auto", aspectRatio: "436/590" }}
//                 sizes="(max-width: 640px) min(90vw, 436px), (max-width: 1024px) min(60vw, 436px), 436px"
//               />
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   </section>
//);