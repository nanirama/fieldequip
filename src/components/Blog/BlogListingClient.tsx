"use client";

import { useDeferredValue, useMemo, useState } from "react";

import BlogCategoryFilter, { ALL_TOPICS_ID } from "./BlogCategoryFilter";
import BlogFeaturedPosts from "./BlogFeaturedPosts";
import BlogPagination from "./BlogPagination";
import BlogPostsGrid from "./BlogPostsGrid";
import BlogSearchAutocomplete from "./BlogSearchAutocomplete";
import type { BlogCategory, BlogPost } from "./types";

const PAGE_SIZE = 30; // total posts per page including featured

type Props = {
  pageTitle?: string;
  posts: BlogPost[];
  categories: BlogCategory[];
};

function postMatchesCategory(post: BlogPost, categoryId: string): boolean {
  if (categoryId === ALL_TOPICS_ID) return true;
  return post.categories?.some((c) => c._id === categoryId) ?? false;
}

function postMatchesSearch(post: BlogPost, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = post.title?.toLowerCase() ?? "";
  const excerpt = post.excerpt?.toLowerCase() ?? "";
  return title.includes(q) || excerpt.includes(q);
}

export default function BlogListingClient({ pageTitle, posts, categories }: Props) {
  const [categoryId, setCategoryId] = useState(ALL_TOPICS_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridPage, setGridPage] = useState(1);

  const deferredSearch = useDeferredValue(searchQuery);

  const filtered = useMemo(() => {
    return posts.filter(
      (p) => postMatchesCategory(p, categoryId) && postMatchesSearch(p, deferredSearch),
    );
  }, [posts, categoryId, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeGridPage = Math.min(gridPage, totalPages);

  // Slice the full 30-post window for the current page, then split into
  // featured (first 3) + grid (remaining ≤27). Last page may have <30 posts.
  const pageSlice = useMemo(() => {
    const start = (safeGridPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safeGridPage]);

  const featured = useMemo(() => pageSlice.slice(0, 3), [pageSlice]);
  const gridSlice = useMemo(() => pageSlice.slice(3), [pageSlice]);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const pool = posts.filter((p) => postMatchesCategory(p, categoryId));
    const out: { id: string; label: string }[] = [];
    for (const p of pool) {
      const title = p.title?.trim();
      if (!title) continue;
      if (title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)) {
        out.push({ id: p._id, label: title });
      }
      if (out.length >= 8) break;
    }
    return out;
  }, [posts, categoryId, searchQuery]);

  const setCategory = (id: string) => {
    setCategoryId(id);
    setGridPage(1);
  };

  const setSearch = (v: string) => {
    setSearchQuery(v);
    setGridPage(1);
  };
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-24 pb-10 sm:py-12 lg:pt-32 lg:pb-16">
        {pageTitle?.trim() ? (
          <h1 className="font-manrope text-3xl font-semibold tracking-tight text-[#020210] sm:text-4xl">
            {pageTitle.trim()}
          </h1>
        ) : null}

        <div className="mt-8 flex flex-col gap-6 lg:mt-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div
            role="tablist"
            aria-label="Blog categories"
            className="flex min-w-0 flex-1 flex-wrap gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <BlogCategoryFilter categories={categories} activeId={categoryId} onChange={setCategory} />
          </div>
          <BlogSearchAutocomplete value={searchQuery} onChange={setSearch} suggestions={suggestions} />
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"} match your filters.
        </p>

        {featured.length > 0 ? (
          <div className="mt-10 lg:mt-12">
            <BlogFeaturedPosts posts={featured} />
          </div>
        ) : (
          <p className="mt-10 text-center text-lg text-[#4B5563] lg:mt-12">No posts match your filters.</p>
        )}

        <BlogPostsGrid posts={gridSlice} />

        <BlogPagination page={safeGridPage} totalPages={totalPages} onPageChange={setGridPage} />
      </div>
    </div>
  );
}
