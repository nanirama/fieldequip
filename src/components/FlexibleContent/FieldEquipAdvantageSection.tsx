import type { PortableTextBlock } from "@portabletext/types";
import { PortableText, type PortableTextComponents } from "next-sanity";

type AdvantageCard = {
  _key?: string;
  title?: string;
  description?: PortableTextBlock[];
};

type FieldEquipAdvantageSectionData = {
  heading?: string;
  cards?: AdvantageCard[];
};

const descriptionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-[#020210]/70">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[#020210]">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

export default function FieldEquipAdvantageSection({
  data,
}: {
  data?: FieldEquipAdvantageSectionData;
}) {
  const heading = data?.heading?.trim();
  const cards = data?.cards?.filter((c) => c?.title?.trim()) ?? [];

  return (
    <section className="w-full bg-[#F5F7FA] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {heading ? (
          <h2 className="mb-10 text-center font-manrope text-balance text-3xl font-semibold leading-tight tracking-tight text-[#020210] sm:text-4xl lg:mb-14 lg:text-5xl">
            {heading}
          </h2>
        ) : null}

        {cards.length > 0 ? (
          <ul
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="FieldEquip advantages"
          >
            {cards.map((card, index) => (
              <li key={card._key ?? `advantage-${index}`} className="min-w-0">
                <article className="flex h-full flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 sm:p-7">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#13A89E]/10">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-5 w-5 text-[#13A89E]"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {card.title?.trim() ? (
                    <h3 className="text-lg font-semibold leading-snug text-[#020210] sm:text-xl">
                      {card.title.trim()}
                    </h3>
                  ) : null}

                  {card.description?.length ? (
                    <div className="mt-1">
                      <PortableText
                        value={card.description}
                        components={descriptionComponents}
                      />
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
