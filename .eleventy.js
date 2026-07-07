const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");

function formatDate(value, options) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");

  eleventyConfig.addFilter("readableDate", function(value) {
    return formatDate(value, {
      month: "long",
      year: "numeric"
    });
  });

  eleventyConfig.addFilter("fullDate", function(value) {
    return formatDate(value, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  });

  eleventyConfig.addFilter("richTextToHtml", function(value) {
    if (!value) return "";
    return documentToHtmlString(value);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
