import dynamic from "next/dynamic";
import type { CaseStudy as CaseStudyLayout1Item } from "./CaseStudyLayout1";
import type { CaseStudy as CaseStudyLayout2Item } from "./CaseStudyLayout2";

// Both layouts use react-slick (a heavy carousel); code-split them so that
// weight is deferred out of the initial bundle. ssr stays true (default).
const CaseStudyLayout1 = dynamic(() => import("./CaseStudyLayout1"));
const CaseStudyLayout2 = dynamic(() => import("./CaseStudyLayout2"));

type CaseStudiesSectionProps = {
  data?: {
    heading?: string;
    layout?: string;
    caseStudies?: CaseStudyLayout1Item[] | CaseStudyLayout2Item[];
  };
  page?: string;
};



export default function CaseStudiesSection({ data }: CaseStudiesSectionProps) {
  const heading = data?.heading;

  const caseStudies = data?.caseStudies;

  if (data?.layout === "layout2") {
    return (
      <CaseStudyLayout2
        heading={heading}
        caseStudies={caseStudies as CaseStudyLayout2Item[] | undefined}
      />
    );
  }

  return (
    <CaseStudyLayout1
      heading={heading}
      caseStudies={caseStudies as CaseStudyLayout1Item[] | undefined}
    />
  );
}
