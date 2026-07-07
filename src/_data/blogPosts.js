require("dotenv").config();

const contentful = require("contentful");

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

function mapBlogPost(item) {
  const fields = item.fields || {};

  return {
    id: item.sys && item.sys.id ? item.sys.id : "",
    title: fields.title || "",
    slug: fields.slug || "",
    seoTitle: fields.seoTitle || "",
    metaDescription: fields.metaDescription || "",
    excerpt: fields.excerpt || "",
    eyebrow: fields.eyebrow || "",
    publishDate: fields.publishDate || "",
    readTime: fields.readTime || "",
    featuredImage: fields.featuredImage || null,
    body: fields.body || null,
    authorName: getAuthorName(fields),
    authorImage: getAuthorImage(fields)
  };
}

module.exports = async function() {
  const {
    CONTENTFUL_SPACE_ID,
    CONTENTFUL_DELIVERY_TOKEN,
    CONTENTFUL_ENVIRONMENT
  } = process.env;

  if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_DELIVERY_TOKEN) {
    console.warn(
      "Contentful credentials are missing. Returning an empty blog post list for this build."
    );
    return [];
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

    return entries.items.map(mapBlogPost).filter((post) => post.slug);
  } catch (error) {
    console.warn(
      "Unable to fetch Contentful blog posts. Returning an empty blog post list for this build.",
      error && error.message ? error.message : error
    );
    return [];
  }
};
