import FeaturesCapabilitiesClient, {
  type FeatureBlockData,
} from "@/src/components/FlexibleContent/FeaturesCapabilitiesClient";

interface Props {
  data?: {
    heading?: string;
    subHeading?: string;
    features?: FeatureBlockData | null;
  };
}

export default function FeaturesCapabilitiesSection({ data }: Props) {
  const heading = data?.heading ?? "";
  const feature = data?.features;
  if (!feature?.heading) return null;

  return (
    <section
      aria-labelledby="features-heading"
      className="w-full py-16 sm:py-20 lg:py-28 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 bg-white">
        {heading && (
          <header className="text-center mb-14 sm:mb-20 max-w-3xl mx-auto">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-neutral-900 leading-tight"
            >
              {heading}
            </h2>
          </header>
        )}

        <div className="w-full">
          <FeaturesCapabilitiesClient feature={feature} />
        </div>
      </div>
    </section>
  );
}
