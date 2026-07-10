import { Suspense, cache } from "react";
import type { ComponentType, ReactElement } from "react";
import dynamic from "next/dynamic";
import type { SanityImage } from "@/src/types/sanity-image";

import HomeHeroSection from "./Home/HomeHeroSection";
import HomeRoleSection from "./Home/HomeRoleSection";
import NoMiddlemenSection from "./Home/NoMiddlemenSection";
import CaseStudiesSection from "./CaseStudiesSection";
import CtaSection from "./CtaSection";
import MediaContentSection from "./MediaContentSection";
import ProductHeroSection from "./ProductsHeroSection";
import PlatformDeepDiveSection from "./PlatformDeepDiveSection";
import CtaSectionDark from "./CtaSectionDark";
import FeaturesCapabilitiesSection from "./FeaturesCapabilitiesSection";
import FeaturesHeroSection from "./FeaturesHeroSection";
import PageHeroSection from "./PageHeroSection";
import ContentImageSection from "./ContentImageSection";
import ProblemSection from "./ProblemSection";
import StatementSection from "./StatementSection";
import QuoteBannerSection from "./QuoteBannerSection";
import FeatureHighlightSection from "./FeatureHighlightSection";
import CareersSection from "./CareersSection";
import TeamSection from "./TeamSection";
import CenteredCalloutSection from "./CenteredCalloutSection";
import SplitContentSection from "./SplitContentSection";
import Soc2Type2Section from "./Soc2Type2Section";
import ComparisonSection from "./ComparisonSection";
import FeatureCardsSection from "./FeatureCardsSection";
import HowItWorksSection from "./HowItWorksSection";
import WhoItsForSection from "./WhoItsForSection";
import IntegrationsSection from "./IntegrationsSection";
import PageImageHeroSection from "./PageImageHeroSection";
import CoreCapabilitiesSection from "./CoreCapabilitiesSection";
import OutcomeSplitSection from "./OutcomeSplitSection";
import ImageOnlySection, { type ImageOnlySectionData } from "./ImageOnlySection";
import IndustriesHeroSection from "./IndustriesHeroSection";
import BuiltForRemoteSection from "./BuiltForRemoteSection";
import ContactSection from "./ContactSection";
import ScheduleDemoSection from "./ScheduleDemoSection";
import WhitePaperHeroSection from "./WhitePaperHeroSection";
import WhitePaperFormSection from "./WhitePaperFormSection";
import WhitePaperIntroSection from "./WhitePaperIntroSection";
import FieldEquipAdvantageSection from "./FieldEquipAdvantageSection";
import PackageDetailsSection from "./PackageDetailsSection";
import RoiPreviewSection from "./RoiPreviewSection";
import { getAllCaseStudies } from "@/src/sanity/loader/loadQuery";
import { mapCaseStudyToLayout1, mapCaseStudyToLayout2 } from "@/src/sanity/lib/mapCaseStudiesForSection";

// import {
//   loadLatestPosts,
//   loadAllProviders,
//   loadAllClinics,
//   loadAllLabTests,
// } from '@/sanity/loader/loadQuery';

type HeroSectionData = {
  heading?: string;
  description?: Array<{ _type?: string; children?: Array<{ text?: string }> }>;
  image?: { alt?: string; url?: string };
};

type HomeStatItem = {
  value?: string;
  label?: string;
};

type HomeStatsSectionData = {
  stats?: HomeStatItem[];
};

type PortableTextBlock = {
  _type: string;
  children?: Array<{ _type?: string; text?: string }>;
};

type HomeRoleCard = {
  tag?: string;
  heading?: string;
  description?: PortableTextBlock[];
  linkText?: string;
  icon?: { alt?: string; url?: string };
};

type HomeRolesSectionData = {
  heading?: string;
  cards?: HomeRoleCard[];
};

type ClientLogoItem = {
  link?: string;
  logo?: { alt?: string; url?: string };
};

type ClientLogosSectionData = {
  logos?: ClientLogoItem[];
};

type NoMiddlemenSectionData = {
  headline?: PortableTextBlock[];
  image?: { alt?: string; image?: { url?: string } };
  bodyContent?: PortableTextBlock[];
};

type MediaContentItem = {
  _key?: string;
  eyebrow?: string;
  title?: string;
  description?: PortableTextBlock[];
  image?: SanityImage;
  alt?: string;
  imagePosition?: "auto" | "left" | "right";
  linkText?: string;
};

type MediaContentSectionData = {
  title?: string;
  theme?: "dark" | "light";
  items?: MediaContentItem[];
};

type CaseStudyItem = {
  slug?: string | null;
  result?: string | null;
  title?: string | null;
  desc1?: string | null;
  desc2?: string | null;
  quote?: string | null;
  company?: string | null;
  desc?: string | null;
  stat1?: string | null;
  stat2?: string | null;
  stat3?: string | null;
};

type CaseStudiesSectionData = {
  heading?: string;
  layout?: "layout1" | "layout2";
  caseStudies?: CaseStudyItem[];
};

type FlexibleSection = {
  _key?: string;
  _type?: string;
} & HeroSectionData &
  HomeStatsSectionData &
  HomeRolesSectionData &
  ClientLogosSectionData &
  NoMiddlemenSectionData &
  MediaContentSectionData &
  CaseStudiesSectionData &
  Omit<ImageOnlySectionData, "_type">;

type SectionComponentProps = {
  data?: FlexibleSection;
  page?: string;
};

// Heavy client-component sections are code-split with next/dynamic so their JS
// only ships on pages where the section is actually rendered — not in every
// page's First Load JS. ssr stays true (default) → server HTML is unchanged, so
// no SEO/LCP/CLS regression; only the client hydration chunk is deferred/removed.
const HomeStatsSection = dynamic(() => import("./Home/HomeStatsSection")) as ComponentType<SectionComponentProps>;
const ClientLogosSection = dynamic(() => import("./ClientLogosSection")) as ComponentType<SectionComponentProps>;
const FeatureGridSection = dynamic(() => import("./FeatureGridSection")) as ComponentType<SectionComponentProps>;
const FaqSection = dynamic(() => import("./FaqSection")) as ComponentType<SectionComponentProps>;
const VideoTestimonialsSection = dynamic(() => import("./VideoTestimonialsSection")) as ComponentType<SectionComponentProps>;
const RoiCalculatorSection = dynamic(() => import("./RoiCalculatorSection")) as ComponentType<SectionComponentProps>;

const sectionComponents: Record<string, ComponentType<SectionComponentProps>> = {
  homeHeroSection: HomeHeroSection,
  homeStatsSection: HomeStatsSection,
  homeRolesSection: HomeRoleSection as (props: SectionComponentProps) => ReactElement,
  clientLogosSection: ClientLogosSection,
  noMiddlemenSection: NoMiddlemenSection as (props: SectionComponentProps) => ReactElement,
  caseStudiesSection: CaseStudiesSection,
  ctaSection: CtaSection as (props: SectionComponentProps) => ReactElement,
  ctaSectionDark: CtaSectionDark as (props: SectionComponentProps) => ReactElement,
  mediaContentSection:MediaContentSection,
  productHeroSection: ProductHeroSection as (props: SectionComponentProps) => ReactElement,
  featuresHeroSection: FeaturesHeroSection as (props: SectionComponentProps) => ReactElement,
  pageHeroSection: PageHeroSection as (props: SectionComponentProps) => ReactElement,
  contentImageSection: ContentImageSection as (props: SectionComponentProps) => ReactElement,
  problemSection: ProblemSection as (props: SectionComponentProps) => ReactElement,
  statementSection: StatementSection as (props: SectionComponentProps) => ReactElement,
  quoteBannerSection: QuoteBannerSection as (props: SectionComponentProps) => ReactElement,
  featureHighlightSection: FeatureHighlightSection as (props: SectionComponentProps) => ReactElement,
  careersSection: CareersSection as (props: SectionComponentProps) => ReactElement,
  teamSection: TeamSection as (props: SectionComponentProps) => ReactElement,
  centeredCalloutSection: CenteredCalloutSection as (props: SectionComponentProps) => ReactElement,
  splitContentSection: SplitContentSection as (props: SectionComponentProps) => ReactElement,
  soc2Type2Section: Soc2Type2Section as (props: SectionComponentProps) => ReactElement,
  comparisonSection: ComparisonSection as (props: SectionComponentProps) => ReactElement,
  featureCardsSection: FeatureCardsSection as (props: SectionComponentProps) => ReactElement,
  howItWorksSection: HowItWorksSection as (props: SectionComponentProps) => ReactElement,
  whoItsForSection: WhoItsForSection as (props: SectionComponentProps) => ReactElement,
  integrationsSection: IntegrationsSection as (props: SectionComponentProps) => ReactElement,
  pageImageHeroSection: PageImageHeroSection as (props: SectionComponentProps) => ReactElement,
  coreCapabilitiesSection: CoreCapabilitiesSection as (props: SectionComponentProps) => ReactElement,
  outcomeSplitSection: OutcomeSplitSection as (props: SectionComponentProps) => ReactElement,
  videoTestimonialsSection: VideoTestimonialsSection,
  imageOnlySection: ImageOnlySection as (props: SectionComponentProps) => ReactElement,
  featureGridSection: FeatureGridSection,
  industriesHeroSection: IndustriesHeroSection as (props: SectionComponentProps) => ReactElement,
  builtForRemoteSection: BuiltForRemoteSection as (props: SectionComponentProps) => ReactElement,
  featuresCapabilitiesSection: FeaturesCapabilitiesSection as (props: SectionComponentProps) => ReactElement,
  contactSection: ContactSection as (props: SectionComponentProps) => ReactElement,
  scheduleDemoSection: ScheduleDemoSection as (props: SectionComponentProps) => ReactElement,
  roiCalculatorSection: RoiCalculatorSection,
  platformDeepDiveSection: PlatformDeepDiveSection as (props: SectionComponentProps) => ReactElement,
  faqSection: FaqSection,
  whitePaperHeroSection: WhitePaperHeroSection as (props: SectionComponentProps) => ReactElement,
  whitePaperFormSection: WhitePaperFormSection as (props: SectionComponentProps) => ReactElement,
  whitePaperIntroSection: WhitePaperIntroSection as (props: SectionComponentProps) => ReactElement,
  fieldEquipAdvantage: FieldEquipAdvantageSection as (props: SectionComponentProps) => ReactElement,
  packageDetailsSection: PackageDetailsSection as (props: SectionComponentProps) => ReactElement,
  roiPreviewSection: RoiPreviewSection as (props: SectionComponentProps) => ReactElement,
};

type FlexibleContentProps = {
  data?: {
    sections?: unknown[];
  };
  page?:string;
};

function SectionFallbackLoader() {
  return (
    <div
      className="flex min-h-[400px] items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading section"
    >
      <span
        aria-hidden="true"
        className="relative block h-10 w-10 rounded-full border-2 border-[#13A89E]/25 border-t-[#13A89E] animate-spin"
      >
        <span className="absolute inset-1 rounded-full border border-[#020210]/15 border-b-[#020210]/55 animate-spin [animation-duration:1.2s]" />
      </span>
    </div>
  );
}

// React Request Memoization: deduplicates getAllCaseStudies() within a single
// render pass — only one Sanity round-trip no matter how many sections request it.
const getCaseStudies = cache(getAllCaseStudies);

const FlexibleContent = async ({
  data,
  page,
}: FlexibleContentProps) => {
  // "use cache" removed from FlexibleContent:
  // 1. It was tagged cacheTag('home','caseStudy') on EVERY page (products,
  //    industries, etc.) — so revalidateTag('home') cleared all pages, and
  //    revalidateTag('product') never cleared the product-page FlexibleContent.
  // 2. Data is already cached at the loadQuery layer (ISR + Sanity CDN).
  //    A second cache layer here adds overhead without benefit.
  // 3. Removing it makes FlexibleContent synchronous → page HTML streams faster.
  //console.log('page',page)
  const hasCaseStudies = data?.sections?.some(
    (s) => (s as FlexibleSection)?._type === 'caseStudiesSection'
  );
  const caseStudyDocs = hasCaseStudies ? await getCaseStudies() : [];

  const sections = (data?.sections ?? []).map((section, index: number) => {
    const typedSection = section as FlexibleSection;
    if (!typedSection?._type) return null;
    const Section = sectionComponents[typedSection._type];
    if (!Section) return null;

    //console.log('typedSection._type',typedSection._type)

    let sectionData: FlexibleSection = typedSection;
    if (typedSection._type === "caseStudiesSection" && caseStudyDocs.length > 0) {
      const useLayout2 = typedSection.layout === "layout2";
      sectionData = {
        ...typedSection,
        caseStudies: useLayout2
          ? caseStudyDocs.map(mapCaseStudyToLayout2)
          : caseStudyDocs.map(mapCaseStudyToLayout1),
      };
    }

    // The first section is always above-the-fold (hero). Never wrap it in
    // Suspense — a tiny fallback → full-viewport expansion causes CLS 0.2+.
    if (index === 0) {
      return <Section data={sectionData} page={page} key={index} />;
    }

    return (
      <Suspense fallback={<SectionFallbackLoader />} key={index}>
        <Section data={sectionData} page={page} />
      </Suspense>
    );
  });

  return <div className="w-full">{sections}</div>;
};
export default FlexibleContent;