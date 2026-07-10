import Link from "next/link";
import { ButtonComponent } from "../ButtonComponent";

type CmsButton = {
  label?: string | null;
  url?: string | null;
  buttonType?: string | null;
};

type BreadcrumbItem = {
  title?: string | null;
  href?: string | null;
};

type BreadcrumbData = {
  items?: BreadcrumbItem[] | null;
};

export type PageHeroSectionData = {
  heading?: string;
  subheading?: string;
  breadcrumb?: BreadcrumbData | null;
  primaryButton?: CmsButton;
  secondaryButton?: CmsButton;
};

type Props = {
  data?: PageHeroSectionData;
  page?: string;
};

function isValidHref(url: unknown): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

// Derive whether we're on the careers page from the page-prop JSON breadcrumb
// rather than calling usePathname(). This keeps the component as a Server
// Component, eliminating client hydration cost on every product/page hero.
function isCareersBreadcrumb(page?: string): boolean {
  if (!page) return false;
  try {
    const parsed = JSON.parse(page) as {
      breadcrumb?: Array<{ label?: string; href?: string }>;
    };
    const last = parsed.breadcrumb?.at(-1);
    return last?.label?.toLowerCase().trim() === "careers";
  } catch {
    return false;
  }
}

function Breadcrumb({ breadcrumb }: { breadcrumb?: BreadcrumbData | null }) {
  if (!breadcrumb) return null;
  const items = [
    { title: "Home", href: "/" },
    ...(breadcrumb.items ?? [])
      .filter((i) => i?.title?.trim())
      .map((i) => ({ title: i.title!.trim(), href: i.href ?? undefined })),
  ];
  return (
    <nav aria-label="Breadcrumb" className="relative z-10 mb-6 flex justify-center sm:mb-8">
      <ol className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs text-[#020210] sm:text-sm">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.title}-${idx}`} className="flex items-center gap-2">
              {idx > 0 ? (
                <span aria-hidden="true" className="mx-2 text-[#020210]">
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.750391 9.15002L4.39337 5.50687C4.46649 5.43375 4.5245 5.34693 4.56408 5.25139C4.60365 5.15585 4.62402 5.05344 4.62402 4.95002C4.62402 4.84661 4.60365 4.7442 4.56408 4.64866C4.5245 4.55311 4.46649 4.4663 4.39337 4.39317L0.750217 0.750025" stroke="#13A89E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : null}
              {isLast || !item.href ? (
                <span className="py-2 font-normal text-[#020210]" aria-current={isLast ? "page" : undefined}>
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="cursor-pointer py-2 transition-colors hover:text-[#111827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14B8A6]"
                  style={{ touchAction: "manipulation" }}
                >
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function PageHeroSection({ data, page }: Props) {
  const heading = data?.heading?.trim() ?? "";
  const subheading = data?.subheading?.trim();
  const primaryButton = data?.primaryButton;
  const secondaryButton = data?.secondaryButton;
  const pageData = page ? (() => { try { return JSON.parse(page); } catch { return { page }; } })() : null;

  // Server-side derivation — no usePathname() needed, no client hydration cost.
  const isCareers = isCareersBreadcrumb(page);

  const secondaryHref = isValidHref(secondaryButton?.url) ? secondaryButton.url.trim() : "";
  let primaryHref = ''

  
  if(pageData?.page==='get-a-quote'){
    primaryHref = '#get-quote'
  } else {
    primaryHref = isValidHref(primaryButton?.url) ? primaryButton.url.trim() : "";
  }

  const primaryLabel = primaryButton?.label?.trim() || (primaryHref ? "Learn more" : "");
  const secondaryLabel = secondaryButton?.label?.trim() || (secondaryHref ? "Learn more" : "");

  return (
    <section
      aria-labelledby="page-hero-heading"
      className="relative w-full max-w-[1920px] mx-auto bg-white"
    >
      {/* Decorative shadows — hidden on mobile to avoid loading large PNGs on small screens */}
      <div className="hidden md:block pointer-events-none md:absolute md:-bottom-[40%] md:left-[0%] bg-[url('/images/abt-hero-left-shadow.png')] bg-no-repeat bg-contain z-40 md:w-[481px] md:h-[580px]" />
      <div className="hidden md:block pointer-events-none absolute md:top-[0%] md:right-[10%] bg-[url('/images/abt-hero-right-shadow.png')] bg-no-repeat bg-contain z-30 md:w-[432px] md:h-[450px]" />

      <div
        className={`relative mx-auto max-w-7xl px-4 sm:pb-16 pb-10 pt-28 text-center md:pb-20 sm:pt-32 lg:pb-24 lg:pt-36 z-40 ${
          isCareers ? "border-b border-[#ecedf0]" : ""
        }`}
      >
        <Breadcrumb breadcrumb={data?.breadcrumb} />

        {heading ? (
          <h1
            id="page-hero-heading"
            className="font-manrope text-balance text-3xl max-w-4xl mx-auto font-medium leading-[1.15] tracking-tight text-[#020210] sm:text-4xl sm:leading-[1.12] lg:text-[54px] lg:leading-[1.1]"
          >
            <span className="whitespace-pre-line font-semibold">{heading}</span>
          </h1>
        ) : (
          <h1 id="page-hero-heading" className="sr-only">
            Page
          </h1>
        )}

        {subheading ? (
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[#020210]/70 sm:text-lg sm:leading-relaxed">
            {subheading}
          </p>
        ) : null}

        {primaryLabel ? (
          <div className="mt-6 flex justify-center">
            <ButtonComponent href={primaryHref} variant="primary" className="min-h-11 rounded-full px-6 py-2.5 text-sm">
              {primaryLabel}
            </ButtonComponent>
          </div>
        ) : null}
      </div>
    </section>
  );
}
