import Link from "next/link";
import Image from "next/image";
import { getSlugUrl } from "@/src/lib/utils";
import type { CmsSimpleNavItem } from "./menu-types";

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

type CompanyMenuDesktopProps = {
  menuTitle?: string | null;
  menuDescription?: string | null;
  items?: CmsSimpleNavItem[] | null;
};

/** Panel body only — Server Component. See MenuDropdown for the interactive shell. */
export default function CompanyMenuDesktop({
  menuTitle,
  menuDescription,
  items,
}: CompanyMenuDesktopProps) {
  const menuItems = items?.length ? items : [];
  const title = menuTitle?.trim() || "Company";
  const description =
    menuDescription?.trim() || "Get to know more about our company & what we stand for";

  return (
    <div className="grid grid-cols-[250px_1fr] gap-6 items-end">
      <div className="border-r border-[#8B9DBA]/50 pr-6 h-full flex flex-col justify-end">
        <Link href="/">
          <Image src="/images/tinylogo.png" alt="FieldEquip" width={41} height={35} className="h-auto" />
        </Link>
        <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
        <p className="mt-3 text-base leading-[130%] text-[#020210]">{description}</p>
      </div>

      <ul className="grid grid-cols-2 gap-x-10 gap-y-6" role="none">
        {menuItems.map((item) => {
          const href = item._type ? getSlugUrl(item._type, item.slug ?? undefined) : "#";
          return (
            <li key={`${item.title}-${href}`} className="min-w-0">
              <Link
                href={href}
                prefetch={false}
                className="inline-flex items-center gap-2 text-lg font-bold leading-tight text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                {item.title}
                <ChevronRightIcon className="h-3 w-3 text-teal-500" />
              </Link>
              {item.description && (
                <p className="mt-1.5 text-base leading-[130%] text-[#020210]/70 max-w-md">
                  {item.description}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
