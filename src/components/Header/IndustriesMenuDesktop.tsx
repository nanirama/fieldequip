import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/src/sanity/lib/utils";
import { getSlugUrl } from "@/src/lib/utils";
import type { CmsIndustriesNavItem } from "./menu-types";

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 2.5L8 6L4.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type IndustriesMenuDesktopProps = {
  menuTitle?: string | null;
  menuDescription?: string | null;
  industries: CmsIndustriesNavItem[];
};

/** Panel body only — Server Component. See MenuDropdown for the interactive shell. */
export default function IndustriesMenuDesktop({
  menuTitle,
  menuDescription,
  industries,
}: IndustriesMenuDesktopProps) {
  const title = menuTitle?.trim() || "Industries";
  const description =
    menuDescription?.trim() || "Explore all of our industries that can leverage our product";

  return (
    <div className="grid grid-cols-[250px_1fr] gap-6 items-end">
      <div className="border-r border-[#8B9DBA]/50 pr-6 h-full flex flex-col justify-end">
        <Link href="/">
          <Image src="/images/tinylogo.png" alt="FieldEquip" width={41} height={35} className="h-auto" />
        </Link>
        <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
        <p className="mt-3 text-base leading-[130%] text-[#020210]">{description}</p>
      </div>

      <ul
        className="grid grid-cols-2 gap-x-6 gap-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-teal-300/70 [&::-webkit-scrollbar-thumb:hover]:bg-teal-400"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#5eead4 #f1f5f9" }}
        role="none"
      >
        {industries.map((item) => {
          const imgSrc = item.image ? urlForImage(item.image)?.width(600).height(260).url() : undefined;
          const href = item._type ? getSlugUrl(item._type, item.slug ?? undefined) : "#";
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                prefetch={false}
                className="group/item block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                {imgSrc && (
                  <div className="overflow-hidden rounded-xl">
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      width={600}
                      height={260}
                      className="h-39.5 w-full object-cover transition-transform duration-300 group-hover/item:scale-[1.02]"
                      quality={75}
                    />
                  </div>
                )}
                <p className="mt-2 inline-flex items-center gap-2 text-[22px] pt-2 font-semibold leading-tight text-[#020210] transition-colors group-hover/item:text-teal-600">
                  {item.title}
                  <ChevronRightIcon className="h-3 w-3 text-teal-500" />
                </p>
                {item.description && (
                  <p className="mt-1.5 text-base leading-[130%] text-[#020210]">{item.description}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
