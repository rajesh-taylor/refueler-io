module.exports = function (eleventyConfig) {
  // Static assets — copied verbatim to _site/
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/analytics.js");
  eleventyConfig.addPassthroughCopy("src/notes/notes.css");
  eleventyConfig.addPassthroughCopy("src/notes/notes.js");

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
