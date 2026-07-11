"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

type SanityImage = {
  asset?: { _ref?: string };
  alt?: string;
};

export type CapabilityItem = {
  _key: string;
  title: string;
  image?: SanityImage;
  description?: PortableTextBlock[];
};

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-relaxed text-neutral-600">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="text-2xl font-semibold text-[#020210]">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-neutral-700 dark:text-neutral-300">{children}</em>
    ),
    link: ({ children, value }) => {
      const href: string = value?.href ?? "";
      const newTab: boolean = value?.openInNewTab ?? true;
      return (
        <Link
          href={href}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-[#13A89E] underline underline-offset-2 hover:text-[#0d9488] transition-colors"
        >
          {children}
        </Link>
      );
    },
  },
};

function CapabilityAccordionItem({
  item,
  itemId,
  isOpen,
  onSelect,
  listItemRef,
}: {
  item: CapabilityItem;
  itemId: string;
  isOpen: boolean;
  onSelect: () => void;
  listItemRef?: (el: HTMLLIElement | null) => void;
}) {
  const headerId = `${itemId}-header`;
  const panelId = `${itemId}-panel`;
  const hasBody = Boolean(item.description && item.description.length > 0);

  return (
    <li ref={listItemRef} className="py-2 sm:py-3 pl-5">
      <h4 className="m-0">
        <button
          type="button"
          id={headerId}
          className="w-full cursor-pointer text-left transition-transform duration-150 active:scale-[0.992] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13A89E]"
          aria-expanded={isOpen}
          aria-controls={hasBody ? panelId : undefined}
          onClick={onSelect}
        >
          <span
            className={`block text-2xl font-semibold ${
              isOpen ? "text-[#020210]" : "text-neutral-800"
            }`}
          >
            {item.title}
          </span>
        </button>
      </h4>

      {hasBody && (
        // CSS grid trick: animating grid-template-rows between 0fr and 1fr gives a
        // smooth height transition with no JS and no measuring — this is what
        // framer-motion used to do here.
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          aria-hidden={!isOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-3 text-base leading-relaxed text-[#020210]/70 dark:text-neutral-400">
              <PortableText value={item.description!} components={ptComponents} />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

type Props = {
  capabilities: CapabilityItem[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
};

export default function CapabilitiesAccordion({ capabilities, activeIndex, onSelect }: Props) {
  const [internalIndex, setInternalIndex] = useState(0);
  const openIndex = activeIndex !== undefined ? activeIndex : internalIndex;
  const handleSelect = (idx: number) => {
    setInternalIndex(idx);
    onSelect?.(idx);
  };
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  const updateIndicator = useCallback(() => {
    const ul = listRef.current;
    const li = itemRefs.current.get(openIndex);
    if (!ul || !li) return;
    const ulRect = ul.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    setIndicator({ top: liRect.top - ulRect.top + ul.scrollTop, height: liRect.height });
  }, [openIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, capabilities]);

  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const scheduleUpdate = () => requestAnimationFrame(updateIndicator);
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(ul);
    itemRefs.current.forEach((li) => ro.observe(li));
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [updateIndicator, openIndex, capabilities.length]);

  // The panel height animates over ~500ms; re-measure a few times so the teal
  // indicator track keeps up (matches the old behaviour).
  useEffect(() => {
    const delays = [0, 80, 200, 380, 550];
    const ids = delays.map((ms) => window.setTimeout(updateIndicator, ms));
    return () => ids.forEach(clearTimeout);
  }, [openIndex, updateIndicator]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLLIElement | null) => {
      if (el) itemRefs.current.set(index, el);
      else itemRefs.current.delete(index);
      requestAnimationFrame(updateIndicator);
    },
    [updateIndicator],
  );

  if (!capabilities.length) return null;

  return (
    <div className="relative">
      {/* Full-height base track */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-px bg-neutral-200 dark:bg-neutral-600"
        aria-hidden
      />
      {/* Moving highlight — position/size set from measurements, animated in CSS
          (no framer-motion). */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 z-[1] w-[3px] bg-[#13A89E] dark:bg-[#75E8E0] transition-[top,height,opacity] duration-300 ease-out motion-reduce:transition-none"
        style={{
          top: indicator.top,
          height: indicator.height,
          opacity: indicator.height > 0 ? 1 : 0,
        }}
      />
      <ul
        ref={listRef}
        className="relative z-[2] m-0 list-none space-y-6 p-0 sm:space-y-7"
        role="list"
      >
        {capabilities.map((cap, idx) => (
          <CapabilityAccordionItem
            key={cap._key || `cap-fallback-${idx}`}
            item={cap}
            itemId={`cap-${cap._key ?? idx}`}
            isOpen={openIndex === idx}
            onSelect={() => handleSelect(idx)}
            listItemRef={setItemRef(idx)}
          />
        ))}
      </ul>
    </div>
  );
}
