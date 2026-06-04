import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import CaseStudyGrowthCtaBanner, {
  CASE_STUDY_CONTENT_ANCHOR_ID,
} from "@/src/components/CaseStudies/CaseStudyGrowthCtaBanner";
import CaseStudyMetricHighlights, {
  type CaseStudyMetricStat,
} from "@/src/components/CaseStudies/CaseStudyMetricHighlights";
import CaseStudyChallenges, {
  type CaseStudyChallengesData,
} from "@/src/components/CaseStudies/CaseStudyChallenges";
import CaseStudySolution, {
  type CaseStudySolutionData,
} from "@/src/components/CaseStudies/CaseStudySolution";
import CaseStudyResults, {
  type CaseStudyResultsData,
} from "@/src/components/CaseStudies/CaseStudyResults";
// import CaseStudyChallengesOpportunities, {
//   type CaseStudyChallengesOpportunitiesData,
// } from "@/src/components/CaseStudies/CaseStudyChallengesOpportunities";
import CaseStudyTestimonials, {
  type CaseStudyTestimonialFields,
} from "@/src/components/CaseStudies/CaseStudyTestimonials";
import CaseStudyIntroduction, {
  type CaseStudyIntroductionData,
} from "@/src/components/CaseStudies/CaseStudyIntroduction";
import CaseStudyWideImage, {
  type CaseStudyCoverImage,
} from "@/src/components/CaseStudies/CaseStudyWideImage";
import { seoGenerateMetadata } from "@/src/components/Seo";
import OtherCaseStudies from "@/src/components/CaseStudies/OtherCaseStudies";
import type { OtherCaseStudyListItem } from "@/src/components/CaseStudies/OtherCaseStudyCard";
import { loadCaseStudies, loadCaseStudy, loadCaseStudySlugs } from "@/src/sanity/loader/loadQuery";
 
function formatLastUpdated(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
 
/** Shape matches `caseStudyBySlugQuery`; extend as you build the layout. */

type CaseStudyDetailDoc = {
  _updatedAt?: string;
  name?: string;
  slug?: string;
  clientName?: string;
  clientJobTitle?: string;
  clientTestimonial?: CaseStudyTestimonialFields["clientTestimonial"];
  clientImage?: CaseStudyTestimonialFields["clientImage"];
  youtubeVideoUrl?: string;
  videoDuration?: string;
  industry?: string;
  metricHighlights?: {
    stats?: CaseStudyMetricStat[] | null;
  } | null;
  image?: CaseStudyCoverImage | null;
  introduction?: CaseStudyIntroductionData | null;
  challenges?: CaseStudyChallengesData | null;
  solutions?: CaseStudySolutionData | null;
  results?: CaseStudyResultsData | null;
  //challengesAndOpportunities?: CaseStudyChallengesOpportunitiesData | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
};
 
type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};
 
export async function generateStaticParams() {
  const rows = await loadCaseStudySlugs();
  const data = rows.data as { slug?: string }[] | null | undefined;
  return (data ?? []).filter((row) => Boolean(row?.slug)).map((row) => ({ slug: row.slug as string }));
}
 
export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCaseStudy(slug);
  const data = result.data as CaseStudyDetailDoc | null | undefined;
 
  if (!data) {
    return seoGenerateMetadata({
      title: "Case study",
      description: "",
      url: `/case-studies/${slug}`,
    });
  }
 
  return seoGenerateMetadata({
    title: data.seo?.metaTitle || data.name || "Case study",
    description: data.seo?.metaDescription || "",
    url: `/case-studies/${slug}`,
    imageUrl: data.seo?.metaImage,
  });
}
 
export default async function CaseStudyDetailPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const [result, listingResult] = await Promise.all([loadCaseStudy(slug), loadCaseStudies()]);
  const data = result.data as CaseStudyDetailDoc | null | undefined;
  const allStudies = (listingResult.data as OtherCaseStudyListItem[] | null | undefined) ?? [];
  const otherCaseStudies = allStudies.filter((c) => c.slug && c.slug !== slug);
 
  if (!data) {
    notFound();
  }
 
  const clientLabel = data.clientName?.trim();
  const industryLabel = data.industry?.trim();
  const showMetaPill = Boolean(clientLabel || industryLabel);
  const lastUpdated = formatLastUpdated(data._updatedAt);
 
  return (
    <BaseLayout layout="light">
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-16 mt-20 lg:px-8 lg:py-24">
        {showMetaPill ? (
          <p className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full bg-[#EAEEF1] px-4 py-2 text-xs font-medium text-[#020210]/80 sm:text-sm">
            {clientLabel ? <span>{clientLabel}</span> : null}
            {clientLabel && industryLabel ? (
              <span className="text-[#020210]/35" aria-hidden>
                |
              </span>
            ) : null}
            {industryLabel ? <span>{industryLabel}</span> : null}
          </p>
        ) : null}
 
        <div
          className={[
            "flex flex-col gap-4 sm:gap-5",
            lastUpdated ? "lg:flex-row lg:items-center items-end lg:justify-between" : "",
            showMetaPill ? "mt-5" : "",
          ].join(" ")}
        >
          <h1 className="max-w-3xl font-manrope text-3xl font-semibold tracking-tight text-[#020210] sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            {data.name}
          </h1>
          {lastUpdated ? (
            <p className="shrink-0 text-sm text-[#020210]/65 lg:pt-1 lg:text-right">
              Last Updated: {lastUpdated}
            </p>
          ) : null}
        </div>
 
        <CaseStudyMetricHighlights stats={data.metricHighlights?.stats} />
        <CaseStudyGrowthCtaBanner />
      </section>
 
      <div id={CASE_STUDY_CONTENT_ANCHOR_ID} tabIndex={-1} className="scroll-mt-28" />
 
      <div className="mt-12 w-full sm:mt-14">
        <CaseStudyWideImage image={data.image} title={data.name ?? "Case study"} />
      </div>
 
      <CaseStudyIntroduction introduction={data.introduction} />
      <CaseStudyChallenges challenges={data.challenges} caseStudyTitle={data.name} />
 
      <CaseStudySolution solutions={data.solutions} caseStudyTitle={data.name} />
 
      <CaseStudyResults
        results={data.results}
        stats={data.metricHighlights?.stats}
        caseStudyTitle={data.name}
      />
 
      {/* <CaseStudyChallengesOpportunities data={data.challengesAndOpportunities} /> */}
 
      <CaseStudyTestimonials
        data={{
          clientName: data.clientName,
          clientJobTitle: data.clientJobTitle,
          clientTestimonial: data.clientTestimonial,
          clientImage: data.clientImage,
          youtubeVideoUrl: data.youtubeVideoUrl,
          videoDuration: data.videoDuration,
        }}
        caseStudyTitle={data.name}
      />
 
      <OtherCaseStudies items={otherCaseStudies} />
    </BaseLayout>
  );
}