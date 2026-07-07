const fs = require("node:fs");
const path = require("node:path");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");

const outputDir = "_site";
const staticCopyTargets = [
  "index.html",
  "contact.html",
  "case-studies.html",
  "winners.html",
  "blog",
  "work",
  "services",
  "Winners"
];
const staticSkipPaths = new Set([
  normalizePath("blog/index.html")
]);

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function copyStaticSiteTarget(source, destination, rootSource) {
  if (!fs.existsSync(source)) return;

  const relativePath = normalizePath(path.relative(rootSource, source));
  if (staticSkipPaths.has(relativePath)) return;

  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(source)) {
      copyStaticSiteTarget(
        path.join(source, entry),
        path.join(destination, entry),
        rootSource
      );
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyExistingStaticSite() {
  const root = __dirname;
  const output = path.join(root, outputDir);

  for (const target of staticCopyTargets) {
    copyStaticSiteTarget(
      path.join(root, target),
      path.join(output, target),
      root
    );
  }
}

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

  eleventyConfig.on("eleventy.after", copyExistingStaticSite);

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
      output: outputDir,
      includes: "_includes",
      data: "_data"
    }
  };
};
