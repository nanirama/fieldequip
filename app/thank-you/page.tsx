import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import BaseLayout from "@/src/components/BaseLayout";
import { ButtonComponent } from "@/src/components/ButtonComponent";
import { loadHeader } from "@/src/sanity/loader/loadQuery";
const getHeader = cache(loadHeader)
export const metadata: Metadata = {
  title: "Thank You | FieldEquip",
  description: "Thank you for reaching out to FieldEquip. Our team will be in touch shortly.",
  robots: { index: false, follow: false },
};

// ── Social links ──────────────────────────────────────────────────────────────

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/fieldequip/",
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M4.918 17.6H1.104V5.85H4.918V17.6ZM3.009 4.247C1.789 4.247.8 3.28.8 2.113A2.21 2.21 0 0 1 3.009 0a2.21 2.21 0 0 1 2.209 2.113c0 1.167-.99 2.134-2.209 2.134ZM19.196 17.6h-3.806v-5.72c0-1.363-.028-3.112-1.983-3.112-1.983 0-2.287 1.481-2.287 3.013V17.6H7.308V5.85h3.658v1.602h.054c.51-.923 1.754-1.898 3.61-1.898 3.86 0 4.57 2.432 4.57 5.59V17.6h-.004Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com/fieldequip",
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M15.175 1.843h2.76L11.906 8.753 19 18.156h-5.554l-4.353-5.702-4.976 5.702H1.354l6.449-7.393L1 1.845h5.696l3.929 5.21 4.55-5.212Zm-.97 14.657h1.53L5.86 3.413H4.22L14.204 16.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@FieldEquip",
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M8.2 12.571 12.871 10 8.2 7.429v5.142ZM18.604 5.86c.117.403.198.943.252 1.629.063.685.09 1.277.09 1.791L19 10c0 1.877-.144 3.257-.396 4.14-.225.771-.747 1.268-1.557 1.483-.423.11-1.197.188-2.385.24-1.17.06-2.241.085-3.231.085L10 16c-3.771 0-6.12-.137-7.047-.377-.81-.215-1.332-.712-1.557-1.483-.117-.403-.198-.997-.252-1.683-.063-.685-.09-1.276-.09-1.791L1 10c0-1.877.144-3.257.396-4.14.225-.771.747-1.268 1.557-1.483.423-.111 1.197-.189 2.385-.241 1.17-.06 2.241-.086 3.231-.086L10 4c3.771 0 6.12.137 7.047.377.81.215 1.332.712 1.557 1.483Z" fill="currentColor" />
      </svg>
    ),
  },  
  {
    label: "Instagram",
    href: "https://www.instagram.com/fieldequipfsm/",
    icon: (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M10 2c-2.284 0-2.555.01-3.455.05-.897.041-1.512.183-2.051.391C3.936 2.655 3.463 2.944 2.992 3.416 2.52 3.887 2.231 4.361 2.017 4.919 1.809 5.457 1.667 6.073 1.626 6.97 1.586 7.87 1.576 8.142 1.576 10.424c0 2.283.01 2.554.05 3.454.041.898.183 1.513.391 2.051.214.558.503 1.032.975 1.503.471.472.945.761 1.503.975.539.208 1.154.35 2.051.391.9.04 1.171.05 3.455.05s2.555-.01 3.455-.05c.897-.041 1.512-.183 2.051-.391.558-.214 1.031-.503 1.502-.975.472-.471.761-.945.975-1.503.208-.538.35-1.153.391-2.051.04-.9.05-1.171.05-3.454 0-2.282-.01-2.554-.05-3.454-.041-.897-.183-1.512-.391-2.051-.214-.558-.503-1.032-.975-1.503C16.537 2.944 16.064 2.655 15.506 2.441 14.967 2.233 14.352 2.091 13.455 2.05 12.555 2.01 12.284 2 10 2Zm0 1.622c2.243 0 2.495.009 3.385.049.822.036 1.268.174 1.566.289.397.153.679.336.976.632.297.297.48.58.633.976.115.298.253.744.289 1.566.04.89.049 1.142.049 3.385s-.009 2.495-.049 3.385c-.036.822-.174 1.268-.289 1.566-.153.396-.336.679-.633.976-.297.296-.579.479-.976.632-.298.115-.744.253-1.566.289-.89.04-1.142.049-3.385.049s-2.495-.009-3.385-.049c-.822-.036-1.268-.174-1.566-.289a2.616 2.616 0 0 1-.976-.632 2.616 2.616 0 0 1-.632-.976c-.115-.298-.253-.744-.289-1.566C3.113 12.919 3.103 12.667 3.103 10.424s.01-2.495.049-3.385c.036-.822.174-1.268.289-1.566.153-.396.336-.679.632-.976.297-.296.58-.479.976-.632.298-.115.744-.253 1.566-.289C7.505 3.631 7.757 3.622 10 3.622Zm0 2.486a4.316 4.316 0 1 0 0 8.632 4.316 4.316 0 0 0 0-8.632Zm0 7.009a2.693 2.693 0 1 1 0-5.386 2.693 2.693 0 0 1 0 5.386Zm5.846-7.195a1.008 1.008 0 1 1-2.016 0 1.008 1.008 0 0 1 2.016 0Z" fill="currentColor" />
      </svg>
    ),
  },
];

// ── Next steps ────────────────────────────────────────────────────────────────

const nextSteps = [
  { label: "Confirmation email sent to your inbox." },
  { label: "Our team reviews your request within hours." },
  { label: "We'll reach out within 1 business day." },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ThankYouPage() {
  const headerResult = await getHeader();
  const settings = headerResult.data ?? {}
  return (
    <BaseLayout layout="light" settings={settings}>
      <section className="relative w-full overflow-hidden bg-white py-20 sm:py-32">

        {/* Subtle background glow — matches site's decorative language */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[600px] w-[800px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse at center, #13A89E 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">

          {/* ── Animated check icon ─────────────────────────────────────── */}
          <div className="mb-8 flex justify-center animate-check-pop">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#13A89E] shadow-lg shadow-[#13A89E]/30">
              <svg
                aria-hidden="true"
                viewBox="0 0 52 52"
                fill="none"
                className="h-12 w-12"
              >
                <path
                  d="M14 27 l9 9 L38 17"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* ── Heading ─────────────────────────────────────────────────── */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#13A89E]">
              Submission received
            </p>
            <h1 className="font-manrope text-4xl font-semibold leading-tight tracking-tight text-[#162A4A] sm:text-5xl md:text-[56px]">
              Thank You!
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
              We've received your message and appreciate you reaching out. Our team will review your request and get back to you as soon as possible.
            </p>
          </div>

          {/* ── Next steps list ─────────────────────────────────────────── */}
          {/* <ul
            className="mx-auto mt-10 max-w-sm space-y-3 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {nextSteps.map(({ label }) => (
              <li key={label} className="flex items-center gap-3 text-left">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#13A89E]/10">
                  <svg aria-hidden="true" viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5">
                    <path d="M2 6.5 l2.5 2.5 L10 3.5" stroke="#13A89E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-gray-600">{label}</span>
              </li>
            ))}
          </ul> */}

          {/* ── CTA button ──────────────────────────────────────────────── */}
          <div
            className="mt-10 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <ButtonComponent href="/" variant="primary" className="px-10 py-4 text-base">
              Back to Home
            </ButtonComponent>
          </div>

          {/* ── Social links ────────────────────────────────────────────── */}
          <div
            className="mt-14 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="mb-5 text-sm font-medium text-gray-400 uppercase tracking-widest">
              Follow us
            </p>
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`FieldEquip on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all duration-200 hover:border-[#13A89E] hover:text-[#13A89E] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13A89E] focus-visible:ring-offset-2"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </BaseLayout>
  );
}
