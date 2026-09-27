const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Cache-busting: "/assets/css/home.css" -> "/assets/css/home.css?v=3f9a1c2e"
  // The hash changes whenever the file's contents change, so browsers fetch the new CSS.
  eleventyConfig.addFilter("cssv", (url) => {
    const file = path.join(__dirname, "src", url);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 8);
    return `${url}?v=${hash}`;
  });

  // Static assets — copied verbatim to _site/
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/analytics.js");
  eleventyConfig.addPassthroughCopy("src/notes/notes.css");
  eleventyConfig.addPassthroughCopy("src/notes/notes.js");

  // Share — JS, CSS, and BLAKE3 WASM copied verbatim
  eleventyConfig.addPassthroughCopy("src/share/assets");
  eleventyConfig.addPassthroughCopy("src/share/admin");

  // Merchant tablet — companion CSS and JS copied verbatim
  eleventyConfig.addPassthroughCopy("src/merchant/merchant-tablet-styles.css");
  eleventyConfig.addPassthroughCopy("src/merchant/merchant-tablet-logic.js");

  // Cloudflare Pages headers and redirects
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addWatchTarget("src/_includes/");

  // Notes — every src/notes/<slug>/index.njk is an article, newest first.
  // Feeds the /notes/ cards and /notes/latest.json (Share receiver card).
  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*/index.njk").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addFilter("monthYear", (d) =>
    d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));

  return {
    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      data:     "_data",
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
