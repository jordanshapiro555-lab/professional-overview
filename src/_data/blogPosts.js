require("dotenv").config();

const contentful = require("contentful");
const fallbackBlogPosts = require("./fallbackBlogPosts");

let blogPostsCache;

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

function getBlogPostUrl(slug, hasBody) {
  if (!slug) return "";
  return `/professional-overview/blog/${slug}${hasBody ? "/" : ""}`;
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

function logContentfulBlogPosts(label, value) {
  console.log(`[Contentful blogPosts] ${label}:`, value);
}

function logFinalMergedPosts(posts) {
  logContentfulBlogPosts(
    "Final merged post slugs and URLs",
    posts.map((post) => ({ slug: post.slug, url: post.url }))
  );
}

function normalizeFallbackPost(post) {
  const slug = post.slug || "";

  return {
    title: post.title || "",
    slug,
    eyebrow: post.eyebrow || "",
    publishDate: post.publishDate || "",
    readTime: post.readTime || "",
    summary: post.summary || "",
    imageUrl: post.imageUrl || "",
    imageAlt: post.imageAlt || post.title || "",
    url: getBlogPostUrl(slug, false)
  };
}

function mapBlogPost(item) {
  const fields = item.fields || {};
  const metaDescription = getPlainText(fields.metaDescription);
  const excerpt = getPlainText(fields.excerpt);
  const title = fields.title || "";
  const featuredImage = fields.featuredImage || null;
  const slug = fields.slug || "";
  const hasBody = Boolean(fields.body);

  return {
    id: item.sys && item.sys.id ? item.sys.id : "",
    title,
    slug,
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
    customBodyCode: getPlainText(fields.customBodyCode),
    hasBody,
    url: getBlogPostUrl(slug, hasBody),
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

  const slug = contentfulPost.slug || fallbackPost.slug || "";
  const hasBody = Boolean(contentfulPost.hasBody);

  return {
    ...fallbackPost,
    ...contentfulPost,
    title: contentfulPost.title || fallbackPost.title || "",
    slug,
    eyebrow: contentfulPost.eyebrow || fallbackPost.eyebrow || "",
    publishDate: contentfulPost.publishDate || fallbackPost.publishDate || "",
    readTime: contentfulPost.readTime || fallbackPost.readTime || "",
    summary: contentfulPost.summary || fallbackPost.summary || "",
    imageUrl: contentfulPost.imageUrl || fallbackPost.imageUrl || "",
    imageAlt: contentfulPost.imageAlt || fallbackPost.imageAlt || contentfulPost.title || fallbackPost.title || "",
    hasBody,
    url: getBlogPostUrl(slug, hasBody)
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
  if (blogPostsCache) return blogPostsCache;

  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_DELIVERY_TOKEN,
    CONTENTFUL_ENVIRONMENT,
    CONTENTFUL_BLOG_POST_CONTENT_TYPE
  } = process.env;
  const contentfulEnvironment = CONTENTFUL_ENVIRONMENT || "master";
  const contentfulBlogPostContentType = CONTENTFUL_BLOG_POST_CONTENT_TYPE || "blogPost";

  logContentfulBlogPosts("CONTENTFUL_SPACE_ID present", Boolean(CONTENTFUL_SPACE_ID));
  logContentfulBlogPosts(
    "CONTENTFUL_DELIVERY_TOKEN present",
    Boolean(CONTENTFUL_DELIVERY_TOKEN)
  );
  logContentfulBlogPosts("CONTENTFUL_ENVIRONMENT used", contentfulEnvironment);
  logContentfulBlogPosts("Content type ID queried", contentfulBlogPostContentType);

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_DELIVERY_TOKEN) {
    console.warn(
      "Contentful credentials are missing. Using fallback blog post list for this build."
    );
    blogPostsCache = mergeWithFallbackPosts([]);
    logFinalMergedPosts(blogPostsCache);
    return blogPostsCache;
  }

  const client = contentful.createClient({
    space: CONTENTFUL_SPACE_ID,
    accessToken: CONTENTFUL_DELIVERY_TOKEN,
    environment: contentfulEnvironment
  });

  try {
    const entries = await client.getEntries({
      content_type: contentfulBlogPostContentType,
      include: 2
    });
    const rawSlugs = entries.items.map((item) => {
      const fields = item.fields || {};
      return fields.slug || "";
    });
    const mappedPosts = entries.items.map(mapBlogPost);

    logContentfulBlogPosts("Number of entries returned", entries.items.length);
    logContentfulBlogPosts("Raw slugs returned from Contentful", rawSlugs);
    logContentfulBlogPosts(
      "Mapped slugs returned from Contentful",
      mappedPosts.map((post) => post.slug)
    );
    logContentfulBlogPosts(
      "Mapped posts with hasBody=true",
      mappedPosts.filter((post) => post.hasBody).map((post) => post.slug)
    );

    blogPostsCache = mergeWithFallbackPosts(
      mappedPosts.filter((post) => post.slug)
    );
    logFinalMergedPosts(blogPostsCache);
    return blogPostsCache;
  } catch (error) {
    console.warn(
      "Unable to fetch Contentful blog posts. Using fallback blog post list for this build.",
      error && error.message ? error.message : error
    );
    logContentfulBlogPosts("Number of entries returned", "fetch failed");
    logContentfulBlogPosts("Raw slugs returned from Contentful", []);
    logContentfulBlogPosts("Mapped slugs returned from Contentful", []);
    logContentfulBlogPosts("Mapped posts with hasBody=true", []);
    blogPostsCache = mergeWithFallbackPosts([]);
    logFinalMergedPosts(blogPostsCache);
    return blogPostsCache;
  }
};
