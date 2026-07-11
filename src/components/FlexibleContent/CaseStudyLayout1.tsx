"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

export type CaseStudy = {
    slug?: string | null;
    orderBy?: number | null;
    result?: string | null;
    title?: string | null;
    desc1?: string | null;
    desc2?: string | null;
    quote?: string | null;
    company?: string | null;
};

export type CaseStudyLayout1Props = {
    heading?: string;
    caseStudies?: CaseStudy[];
};

const defaultCaseStudies: CaseStudy[] = [
    {
        result: "THE RESULT",
        title: "Days to hours.",
        desc1:
            "BAZCO Oil Company was running every haul on paper. Dispatch by phone. Tickets arriving days after delivery. Billing waiting on paper to come back from the field.",
        desc2:
            "BAZCO now runs every aspect of the business on FieldEquip. Ticket-to-invoice went from days to hours. Billing disputes dropped.",
        quote:
            "FieldEquip is an indispensable tool we use for every aspect of our business, from field ticketing and invoicing to revenue reporting and customer data delivery.",
        company:
            "BAZCO Oil Company | Petroleum Transport | Oil and Gas",
    },
    {
        result: "THE RESULT22",
        title: "Days to hours.",
        desc1:
            "BAZCO Oil Company was running every haul on paper. Dispatch by phone. Tickets arriving days after delivery.",
        desc2:
            "BAZCO now runs every aspect of the business on FieldEquip. Ticket-to-invoice went from days to hours.",
        quote:
            "FieldEquip is an indispensable tool we use for every aspect of our business, from field ticketing and invoicing to revenue reporting and customer data delivery.",
        company:
            "BAZCO Oil Company | Petroleum Transport | Oil and Gas",
    },

];

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
    <button type="button" aria-label="Next case study" onClick={onClick} className="absolute sm:-top-24 -top-12 sm:right-6 left-16 sm:left-[inherit] w-[54px] h-[34px] group bg-[#E1E9F1] hover:bg-[#13A89E] hover:text-white rounded-[37px] cursor-pointer z-[40] flex items-center justify-center">
        <svg width="7" height="13" viewBox="0 0 7 13" fill="none" className="rotate-[180deg]" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.73038 11.55L1.04656 6.866C0.952538 6.77198 0.877957 6.66036 0.827073 6.53752C0.77619 6.41468 0.75 6.28301 0.75 6.15005C0.75 6.01709 0.77619 5.88542 0.827073 5.76258C0.877957 5.63974 0.952538 5.52812 1.04656 5.4341L5.73061 0.75005" stroke="#020210" className="group-hover:stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </button>
);

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
    <button type="button" aria-label="Previous case study" onClick={onClick} className="absolute sm:-top-24 -top-12  sm:right-22 left-0 sm:left-[inherit] w-[54px] h-[34px] group bg-[#E1E9F1] hover:bg-[#13A89E] rounded-[37px] cursor-pointer z-[40] flex items-center justify-center">
        <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.73038 11.55L1.04656 6.866C0.952538 6.77198 0.877957 6.66036 0.827073 6.53752C0.77619 6.41468 0.75 6.28301 0.75 6.15005C0.75 6.01709 0.77619 5.88542 0.827073 5.76258C0.877957 5.63974 0.952538 5.52812 1.04656 5.4341L5.73061 0.75005" stroke="#020210" className="group-hover:stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </button>
);

export default function CaseStudyLayout1({
    heading = "Proven in the Field",
    caseStudies: caseStudiesProp,
}: CaseStudyLayout1Props = {}) {
    const caseStudies =
        caseStudiesProp && caseStudiesProp.length > 0
            ? caseStudiesProp
            : defaultCaseStudies;

    // Was react-slick (slidesToShow:1, arrows, no autoplay). Replaced with a native
    // scroll-snap track: swipe works for free, and the arrows just scroll by one
    // card width. Removing slick drops ~32KB of blocking JS from every page.
    const scrollerRef = useRef<HTMLDivElement>(null);

    const scrollByCard = useCallback((dir: 1 | -1) => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
    }, []);

    return (
        <section
            aria-labelledby="case-study-heading"
            className="relative w-full pt-8 pb-24 case_study_bg overflow-hidden bg-white"
        >
                <div className="mx-auto max-w-7xl px-4 border-t border-[#162A4A]/20 pt-16 case_study_bg2">

                {/* Heading */}
                <h2
                    id="case-study-heading"
                    className="text-[32px] sm:text-[42px] font-semibold leading-[110%] text-[#020210]"
                >
                    {heading}
                </h2>

                {/* Slider (scroll-snap) */}
                <div className="relative sm:mt-16 mt-20">
                    {caseStudies.length > 1 && (
                        <>
                            <PrevArrow onClick={() => scrollByCard(-1)} />
                            <NextArrow onClick={() => scrollByCard(1)} />
                        </>
                    )}
                    <div
                        ref={scrollerRef}
                        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {caseStudies.map((item, index) => (
                            <div key={item.slug ?? index} className="w-full shrink-0 snap-start">

                                <div className="grid gap-10 lg:grid-cols-2">

                                    {/* Left */}
                                    <div className="flex flex-col gap-2 md:border-r border-[#13A89E] pr-6 sm:pr-10">
                                        <p className="text-sm font-bold text-[#13A89E]">
                                            {item.result ?? ""}
                                        </p>

                                        <h3 className="text-[24px] sm:text-[32px] font-semibold text-[#191921] mb-4 leading-[38px]">
                                            {item.title ?? ""}
                                        </h3>

                                        <p className="text-sm sm:text-base text-[#191921] mb-4">
                                            {item.desc1 ?? ""}
                                        </p>

                                        <p className="text-sm sm:text-base text-[#191921]">
                                            {item.desc2 ?? ""}
                                        </p>

                                        <Link
                                            href={item.slug?.trim() ? `/case-study/${item.slug.trim()}` : "/case-studies"}
                                            className="mt-3 text-sm sm:text-base text-[#13A89E] underline"
                                        >
                                            Read the Whole Case Study →
                                        </Link>
                                    </div>

                                    {/* Right */}
                                    <div className="flex flex-col gap-4 justify-between">

                                        {/* Icon */}
                                        <svg width="42" height="37" viewBox="0 0 42 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M28.7083 36.599C26.4874 36.599 24.687 34.7987 24.687 32.5778V24.1095C24.687 17.2776 26.0229 11.6733 28.6947 7.29664C30.8874 3.84282 34.1117 1.45263 38.3676 0.126074C40.2374 -0.456763 42 1.06185 42 3.02045C42 4.63707 40.7697 5.94501 39.2279 6.43108C37.0282 7.12454 35.3873 8.32042 34.3053 10.0187C33.2988 11.5987 32.6308 13.8067 32.3014 16.6428C32.0209 19.0583 29.9194 20.9421 27.5089 20.621L27.2519 20.5868H37.8184C40.0393 20.5868 41.8397 22.3872 41.8397 24.6081V32.5778C41.8397 34.7986 40.0393 36.599 37.8184 36.599H28.7083ZM4.02128 36.599C1.80039 36.599 0 34.7987 0 32.5778V24.1095C0 17.2776 1.33588 11.6733 4.00763 7.29664C6.20037 3.84282 9.42467 1.45263 13.6805 0.126074C15.5504 -0.456763 17.313 1.06185 17.313 3.02045C17.313 4.63707 16.0827 5.94501 14.5409 6.43108C12.3411 7.12454 10.7003 8.32042 9.61832 10.0187C8.61175 11.5987 7.94378 13.8067 7.61438 16.6428C7.33384 19.0583 5.2324 20.9421 2.8219 20.621L2.56489 20.5868H13.1314C15.3523 20.5868 17.1527 22.3872 17.1527 24.6081V32.5778C17.1527 34.7986 15.3523 36.599 13.1314 36.599H4.02128Z" fill="#13A89E" />
                                        </svg>

                                        <h3 className="text-lg sm:text-2xl font-semibold text-[#020210]">
                                            {item.quote ?? ""}
                                        </h3>

                                        <p className="text-sm sm:text-base text-[#191921]">
                                            {item.company ?? ""}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
