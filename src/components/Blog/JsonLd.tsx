import { getSiteOrigin, toAbsolutePageUrl } from "@/src/utils/siteUrl";
import { urlForImage } from "@/src/sanity/lib/utils";
import type { BlogPostArticleData } from "./BlogPostArticle";

type Props = {
  post: BlogPostArticleData;
  slug: string;
};

export default function BlogPostJsonLd({ post, slug }: Props) {
  const pageUrl = toAbsolutePageUrl(`/${slug}`);
  const siteOrigin = getSiteOrigin();

  const imageUrl = post.mainImage
    ? urlForImage(post.mainImage)?.width(1200).height(630).fit("crop").quality(85).url()
    : undefined;

  const authorName = post.author?.name?.trim() || post.author?.title?.trim() || "FieldEquip";

  const articleSection = post.categories?.[0]?.title ?? undefined;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    headline: post.title ?? "",
    description: post.excerpt ?? "",
    datePublished: post.publishedAt ?? "",
    dateModified: post._updatedAt ?? post.publishedAt ?? "",
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "FieldEquip",
      logo: {
        "@type": "ImageObject",
        url: `${siteOrigin}/logo.png`,
      },
    },
  };

  if (imageUrl) {
    schema.image = imageUrl;
  }

  if (articleSection) {
    schema.articleSection = articleSection;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
