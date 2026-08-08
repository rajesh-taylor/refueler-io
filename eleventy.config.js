module.exports = function (eleventyConfig) {
  // Static assets — copied verbatim to _site/
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/analytics.js");
  eleventyConfig.addPassthroughCopy("src/notes/notes.css");
  eleventyConfig.addPassthroughCopy("src/notes/notes.js");

  // Share — JS, CSS, and BLAKE3 WASM copied verbatim
  eleventyConfig.addPassthroughCopy("src/share/assets");
  eleventyConfig.addPassthroughCopy("src/share/blake3");

  eleventyConfig.addWatchTarget("src/_includes/");

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
