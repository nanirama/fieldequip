// import { cache } from 'react';
// import { cacheTag, cacheLife } from 'next/cache';
// import { client } from "@/src/sanity/lib/client";
// import { headerQuery } from "@/src/sanity/lib/queries";
import HeaderClient from "./HeaderClient";
//import type { SettingsMenuData } from "./menu-types";

// ── Layer 1: Remote Data Cache ────────────────────────────────────────────────
// "use cache: remote" — Sanity nav data is shared across ALL users (not
// user-specific), fetched from a remote CMS. Cached in the Next.js Data Cache
// and invalidated on-demand by revalidateTag('settings') from the webhook.
// async function fetchHeaderSettings(): Promise<SettingsMenuData> {
//   'use cache: remote';
//   cacheTag('settings');
//   // stale: serve the cached nav for 24 h while revalidating in the background.
//   // revalidate: re-fetch from Sanity after 1 h of activity.
//   // expire: hard evict after 7 days so stale nav data can't accumulate forever.
//   cacheLife({ stale: 86400, revalidate: 3600, expire: 604800 });
//   // Pass next: { tags } so the underlying Sanity HTTP request is also stored
//   // in the Next.js Data Cache. Without this, @sanity/react-loader defaults to
//   // cache: "no-store", causing a live Sanity round-trip on every component-cache miss.
//   const data = await client.fetch<SettingsMenuData | null>(headerQuery, {}, {
//     next: { tags: ['settings'] },
//   });
//   return data ?? ({} as SettingsMenuData);
// }

// React Request Memoization: if anything else in the same render tree calls
// getHeaderSettings(), Sanity is hit exactly once (Data Cache lookup is shared).


// ── Layer 2: Component RSC Cache ──────────────────────────────────────────────
// "use cache" on the component caches the fully rendered RSC payload, keyed by
// the {layout} prop. There are exactly two cache entries: "dark" and "light".
// Invalidated together with the data cache via cacheTag('settings').
export interface HeaderProps {
  layout?: "dark" | "light";
  settings?:any;
}

export default async function Header({ layout, settings }: HeaderProps) {
  return <HeaderClient layout={layout} settings={settings} />;
}
