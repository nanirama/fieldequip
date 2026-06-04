import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FieldEquip Subscription Terms",
  description:
    "FieldEquip Subscription Terms governing access to and use of the FieldEquip software-as-a-service platform.",
};

const keyNotes = [
  "The Order Form controls commercial terms (fees, subscription term, support plan, and any negotiated exceptions).",
  "If there is a conflict, the Order Form overrides the Online Terms, and an addendum overrides both.",
  "For privacy/security requirements, FieldEquip can provide a Data Processing Addendum (DPA) on request.",
];

const LegalSubscriptionTermsPage = () => {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-manrope text-3xl font-semibold tracking-tight text-[#020210] sm:text-4xl">
            FieldEquip Subscription Terms
          </h1>
          <p className="mt-4 text-base text-[#162A4A] sm:text-lg">
            Last updated: February 08, 2026
          </p>
        </header>

        <article className="mt-6 rounded-2xl border border-[#E0E4EA] px-5 py-8 text-[#162A4A] sm:px-8 lg:px-5 lg:py-9">
          <p className="w-full text-[17px] leading-[1.65]">
            These FieldEquip Subscription Terms (the &ldquo;Online Terms&rdquo;) govern access to and
            use of the FieldEquip software-as-a-service platform and related services. The Online
            Terms are incorporated by reference into each executed FieldEquip Order Form between
            FieldEquip and the customer.
          </p>

          <div className="mt-10">
            <h2 className="font-manrope text-2xl font-semibold tracking-tight text-[#020210]">
              Quick links
            </h2>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/legal/subscription-terms/online"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#13A89E] px-5 text-lg font-semibold text-white transition-colors hover:bg-[#119184] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13A89E] focus-visible:ring-offset-2"
              >
                View Online Terms
              </Link>
              <Link
                href="/legal/subscription-terms/print"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#13A89E] px-5 text-lg font-medium text-[#008D84] transition-colors hover:bg-[#E8F7F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#13A89E] focus-visible:ring-offset-2"
              >
                Print/PDF version
              </Link>
            </div>
          </div>

          <div id="online-terms" className="mt-7 scroll-mt-24">
            <h2 className="font-manrope text-2xl font-semibold tracking-tight text-[#020210]">
              Key notes
            </h2>
            <ul className="mt-6 list-disc space-y-1.5 pl-8 leading-relaxed sm:pl-14 text-base">
              {keyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </main>
  );
};

export default LegalSubscriptionTermsPage;
