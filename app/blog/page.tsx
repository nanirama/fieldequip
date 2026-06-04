import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BaseLayout from "@/src/components/BaseLayout";
import { BlogListingClient } from "@/src/components/Blog";
import type { BlogCategory, BlogPost } from "@/src/components/Blog/types";
import { seoGenerateMetadata } from "@/src/components/Seo";
import { loadBlogCategories, loadBlogPage, loadBlogPosts } from "@/src/sanity/loader/loadQuery";
import BlogNewsletterSection from "@/src/components/Blog/BlogNewsletterSection";
import BlogCta from "@/src/components/Blog/BlogCtaSection";

type BlogPageData = {
  title?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadBlogPage();
  const data = result.data as BlogPageData | null | undefined;

  return seoGenerateMetadata({
    title: data?.seo?.metaTitle || data?.title || "Blog",
    description: data?.seo?.metaDescription || "",
    url: "/blog",
    imageUrl: data?.seo?.metaImage,
  });
}

export default async function BlogPage() {
  const [blogResult, postsResult, categoriesResult] = await Promise.all([
    loadBlogPage(),
    loadBlogPosts(),
    loadBlogCategories(),
  ]);

  const data = blogResult.data as BlogPageData | null | undefined;
  if (!data) {
    notFound();
  }

  const rawPosts = (postsResult.data as BlogPost[] | null | undefined) ?? [];
  const posts = rawPosts.filter((p): p is BlogPost => Boolean(p?._id && p?.slug));
  const categories = (categoriesResult.data as BlogCategory[] | null | undefined) ?? [];

  return (
    <>
    <BaseLayout layout="light">
      <BlogListingClient pageTitle={data.title} posts={posts} categories={categories} />
      <BlogNewsletterSection />
      <BlogCta />
    </BaseLayout>
    </>
  );
}
