import Image from "next/image";
import Link from "next/link";

type Logo = {
    link?: string;
    logo?: {
        alt?: string;
        url?: string;
    };
};

type ClientLogosSectionData = {
    logos?: Logo[];
};

const fallbackLogos: Logo[] = [
    { logo: { url: "/images/logo1.webp", alt: "Client 1" } },
    { logo: { url: "/images/logo2.webp", alt: "Client 2" } },
    { logo: { url: "/images/logo3.webp", alt: "Client 3" } },
    { logo: { url: "/images/logo4.webp", alt: "Client 4" } },
    { logo: { url: "/images/logo5.webp", alt: "Client 5" } },
    { logo: { url: "/images/logo6.webp", alt: "Client 6" } },
    { logo: { url: "/images/logo7.webp", alt: "Client 7" } },
    { logo: { url: "/images/logo8.webp", alt: "Client 8" } },
    { logo: { url: "/images/logo9.webp", alt: "Client 9" } },
];

function LogoItem({ logo }: { logo: Logo }) {
    if (!logo.logo?.url) return null;
    const img = (
        <Image
            src={logo.logo.url}
            alt={logo.logo.alt || "client logo"}
            width={160}
            height={90}
            style={{ width: "auto", height: "auto", maxWidth: "min(160px, 100%)", maxHeight: 90 }}
            className="object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
        />
    );
    return (
        <div className="shrink-0 px-6">
            <div className="flex h-[110px] items-center justify-center">
                {logo.link ? (
                    <Link href={logo.link} target="_blank" rel="noreferrer noopener">
                        {img}
                    </Link>
                ) : (
                    img
                )}
            </div>
        </div>
    );
}

/**
 * Server Component. The old ticker was react-slick with autoplaySpeed:0 + linear
 * 5s transitions — i.e. a continuous marquee. That is a pure CSS animation, so it
 * needs no JavaScript at all now: dropping react-slick/slick-carousel here (and
 * from the other carousels) removes ~32KB of blocking script from every page.
 * The strip is duplicated so translateX(-50%) loops seamlessly; the keyframes and
 * the prefers-reduced-motion opt-out live in globals.css (fe-marquee).
 */
const ClientLogosSection = ({ data }: { data?: ClientLogosSectionData }) => {
    const logos = Array.isArray(data?.logos) && data.logos.length > 0 ? data.logos : fallbackLogos;
    const strip = logos.concat(logos);

    return (
        <div className="w-full overflow-hidden pt-10 pb-4 sm:pt-16">
            <div className="fe-marquee flex w-max items-center">
                {strip.map((logo, index) => (
                    <LogoItem key={index} logo={logo} />
                ))}
            </div>
        </div>
    );
};

export default ClientLogosSection;
