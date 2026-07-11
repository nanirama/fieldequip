import Image from "next/image";
import Link from "next/link";

import { getSlugUrl } from "@/src/lib/utils";
import type { CmsProductNavItem, MenuItem } from "./menu-types";

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

type ProductsMenuDesktopProps = {
  menuTitle?: string | null;
  menuDescription?: string | null;
  items?: CmsProductNavItem[] | null;
};

function toMenuItems(cmsItems: CmsProductNavItem[] | null | undefined): MenuItem[] {
  if (!cmsItems?.length) return [];
  return cmsItems.map((cat) => ({
    title: cat.title,
    href: cat._type ? getSlugUrl(cat._type, cat.slug ?? undefined) : undefined,
    children: cat.featuresNav?.map((f) => ({
      title: f.title,
      href: f._type ? getSlugUrl(f._type, f.slug ?? undefined) : undefined,
    })),
  }));
}

/**
 * Panel body only — a Server Component. It renders inside <MenuDropdown>, which
 * owns the button and the open/close state. Keeping this half on the server means
 * the nav links stay in the HTML for crawlers without ever being hydrated.
 */
export default function ProductsMenuDesktop({
  menuTitle,
  menuDescription,
  items,
}: ProductsMenuDesktopProps) {
  const categories = toMenuItems(items);
  const title = menuTitle?.trim() || "Products";
  const description =
    menuDescription?.trim() || "Explore all of our products that can help your growth";

  return (
    <div className="grid grid-cols-[230px_1fr] gap-6 items-end">
      <div className="border-r border-[#8B9DBA]/50 pr-6 h-full flex flex-col justify-end">
        <Link href="/">
          <Image src="/images/tinylogo.png" alt="FieldEquip" width={41} height={35} className="h-auto" />
        </Link>
        <p className="text-[32px] font-semibold leading-tight text-[#020210] pt-3">{title}</p>
        <p className="mt-3 text-base leading-[130%] text-[#020210]">{description}</p>
      </div>

      <ul className="grid grid-cols-3 gap-8" role="none">
        {categories.map((category) => (
          <li key={category.title} className="min-w-0">
            <Link
              href={category?.href ?? "#"}
              prefetch={false}
              className="inline-flex items-center gap-2 text-base font-bold text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              {category.title}
              <ChevronRightIcon className="h-3 w-3 text-teal-500" />
            </Link>

            <ul className="mt-8 space-y-3">
              {category.children?.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item?.href ?? "#"}
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-base text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                  >
                    <span>{item.title}</span>
                    <ChevronRightIcon className="h-3 w-3 text-teal-500" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href={category.href ? `${category.href}#features` : "#"}
              prefetch={false}
              className="mt-8 inline-flex items-center gap-2 text-base text-[#020210] transition-colors hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Explore More Features
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
