module.exports = (eleventyConfig) => {
  // copy the following items to _site
  eleventyConfig.setTemplateFormats(['md', 'html', 'css', '11ty.js'])
  eleventyConfig.addPassthroughCopy('favicon.ico')
  eleventyConfig.addPassthroughCopy('images')
  eleventyConfig.addPassthroughCopy('videos')
  eleventyConfig.addPassthroughCopy('fonts')
}