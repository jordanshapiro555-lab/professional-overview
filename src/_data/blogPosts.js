require("dotenv").config();

const contentful = require("contentful");
const fallbackBlogPosts = require("./fallbackBlogPosts");

function getPlainText(value) {
  return typeof value === "string" ? value : "";
}

function getAuthorImage(fields) {
  if (fields.authorImage) return fields.authorImage;
  if (fields.author && fields.author.fields && fields.author.fields.image) {
    return fields.author.fields.image;
  }
  return null;
}

function getAuthorName(fields) {
  if (fields.authorName) return fields.authorName;
  if (fields.author && fields.author.fields && fields.author.fields.name) {
    return fields.author.fields.name;
  }
  return "Jordan Shapiro";
}

function getContentfulImageUrl(asset) {
  const file = asset && asset.fields && asset.fields.file;
  if (!file || !file.url) return "";
  return file.url.startsWith("//") ? `https:${file.url}` : file.url;
}

function getContentfulImageAlt(asset, fallbackTitle) {
  if (asset && asset.fields) {
    return asset.fields.description || asset.fields.title || fallbackTitle || "";
  }
  return "";
}

function normalizeFallbackPost(post) {
  return {
    title: post.title || "",
    slug: post.slug || "",
    eyebrow: post.eyebrow || "",
    publishDate: post.publishDate || "",
    readTime: post.readTime || "",
    summary: post.summary || "",
    imageUrl: post.imageUrl || "",
    imageAlt: post.imageAlt || post.title || ""
  };
}

function mapBlogPost(item) {
  const fields = item.fields || {};
  const metaDescription = getPlainText(fields.metaDescription);
  const excerpt = getPlainText(fields.excerpt);
  const title = fields.title || "";
  const featuredImage = fields.featuredImage || null;

  return {
    id: item.sys && item.sys.id ? item.sys.id : "",
    title,
    slug: fields.slug || "",
    seoTitle: fields.seoTitle || "",
    metaDescription,
    excerpt,
    summary: excerpt || metaDescription || "",
    eyebrow: fields.eyebrow || "",
    publishDate: fields.publishDate || "",
    readTime: fields.readTime || "",
    featuredImage,
    imageUrl: getContentfulImageUrl(featuredImage),
    imageAlt: getContentfulImageAlt(featuredImage, title),
    body: fields.body || null,
    hasBody: Boolean(fields.body),
    authorName: getAuthorName(fields),
    authorImage: getAuthorImage(fields)
  };
}

function sortByPublishDateDescending(posts) {
  return posts.sort((first, second) => {
    const firstDate = first.publishDate ? new Date(first.publishDate).getTime() : 0;
    const secondDate = second.publishDate ? new Date(second.publishDate).getTime() : 0;
    return secondDate - firstDate;
  });
}

function mergePost(contentfulPost, fallbackPost) {
  if (!fallbackPost) return contentfulPost;

  return {
    ...fallbackPost,
    ...contentfulPost,
    title: contentfulPost.title || fallbackPost.title || "",
    slug: contentfulPost.slug || fallbackPost.slug || "",
    eyebrow: contentfulPost.eyebrow || fallbackPost.eyebrow || "",
    publishDate: contentfulPost.publishDate || fallbackPost.publishDate || "",
    readTime: contentfulPost.readTime || fallbackPost.readTime || "",
    summary: contentfulPost.summary || fallbackPost.summary || "",
    imageUrl: contentfulPost.imageUrl || fallbackPost.imageUrl || "",
    imageAlt: contentfulPost.imageAlt || fallbackPost.imageAlt || contentfulPost.title || fallbackPost.title || ""
  };
}

function mergeWithFallbackPosts(contentfulPosts) {
  const postsBySlug = new Map(
    fallbackBlogPosts.map(normalizeFallbackPost).map((post) => [post.slug, post])
  );

  for (const post of contentfulPosts) {
    if (!post.slug) continue;
    postsBySlug.set(post.slug, mergePost(post, postsBySlug.get(post.slug)));
  }

  return sortByPublishDateDescending(
    Array.from(postsBySlug.values()).filter((post) => post.slug)
  );
}

module.exports = async function() {
  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_DELIVERY_TOKEN,
    CONTENTFUL_ENVIRONMENT
  } = process.env;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_DELIVERY_TOKEN) {
    console.warn(
      "Contentful credentials are missing. Using fallback blog post list for this build."
    );
    return mergeWithFallbackPosts([]);
  }

  const client = contentful.createClient({
    space: CONTENTFUL_SPACE_ID,
    accessToken: CONTENTFUL_DELIVERY_TOKEN,
    environment: CONTENTFUL_ENVIRONMENT || "master"
  });

  try {
    const entries = await client.getEntries({
      content_type: "blogPost",
      order: ["-fields.publishDate"],
      include: 2
    });

    return mergeWithFallbackPosts(
      entries.items.map(mapBlogPost).filter((post) => post.slug)
    );
  } catch (error) {
    console.warn(
      "Unable to fetch Contentful blog posts. Using fallback blog post list for this build.",
      error && error.message ? error.message : error
    );
    return mergeWithFallbackPosts([]);
  }
};
