import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

export type WhitePaperIntroSectionData = {
  _key?: string;
  leftContent?: PortableTextBlock[];
  rightContent?: PortableTextBlock[];
};

type Props = {
  data?: WhitePaperIntroSectionData;
  page?: string;
};
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 10.5L8.5 15L16 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const leftComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-inter text-[42px] font-semibold leading-[1.1] tracking-normal text-[#020210]">
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#13A89E] pl-4 text-base font-semibold leading-snug text-[#020210] sm:text-lg">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#020210]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
        className="text-[#13A89E] underline underline-offset-2 hover:text-[#0d9488]"
      >
        {children}
      </a>
    ),
  },
};

const rightComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-[#4b5563]">{children}</p>
    ),
    h3: ({ children }) => (
      <h3 className="font-inter text-2xl font-semibold leading-[1.2] tracking-normal text-[#020210] sm:text-[28px] lg:text-[32px]">
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-1 space-y-2">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="mb-2 flex break-inside-avoid gap-2 text-base leading-relaxed text-[#191921] last:mb-0">
        <CheckIcon className="mt-0.5 shrink-0 text-[#13A89E]" />
        <span className="min-w-0">{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[#020210]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

export default function WhitePaperIntroSection({ data }: Props) {
  const leftContent = data?.leftContent;
  const rightContent = data?.rightContent;

  if (!leftContent?.length && !rightContent?.length) return null;

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {leftContent && leftContent.length > 0 && (
            <div className="min-w-0 space-y-5">
              <PortableText value={leftContent} components={leftComponents} />
            </div>
          )}

          {rightContent && rightContent.length > 0 && (
            <div className="min-w-0 space-y-4">
              <PortableText value={rightContent} components={rightComponents} />

              {/* SOC 2 Type 2 badge */}
              <div className="flex items-center gap-4 rounded-[14px] bg-[#EBEFF4] px-5 py-4">
                <Image
                  src="/images/soc2-type2.png"
                  alt="SOC 2 Type 2 certified"
                  width={72}
                  height={72}
                  className="h-18 w-18 shrink-0 object-contain"
                />
                <p className="font-inter text-2xl font-semibold leading-[1] tracking-normal text-[#020210]">
                  SOC 2 Type 2 Certified Environment
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
