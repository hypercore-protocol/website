const pluginSass = require("eleventy-plugin-sass")
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const Prism = require("prismjs")
const ejs = require('ejs')

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginSass)
  eleventyConfig.addPlugin(syntaxHighlight)

  // hack to add custom EJS functions until https://github.com/11ty/eleventy/pull/1214/files lands
  const compile = ejs.compile
  ejs.compile = function (...args) {
    const fn = compile.call(this, ...args)
    return (data) => {
      data.syntaxHighlight = (language, str) => {
        const html = Prism.highlight(str, Prism.languages[language], language)
        return `<pre class="language-${language}"><code class="language-${language}">${html}</code></pre>`
      }
      return fn(data)
    }
  }
  eleventyConfig.setLibrary('ejs', ejs)

  // copy the following items to _site
  eleventyConfig.setTemplateFormats(['md', 'html', 'css', 'ejs'])
  eleventyConfig.addPassthroughCopy('favicon.ico')
  eleventyConfig.addPassthroughCopy('CNAME')
  eleventyConfig.addPassthroughCopy('images')
  eleventyConfig.addPassthroughCopy('videos')
  eleventyConfig.addPassthroughCopy('fonts')
  eleventyConfig.addPassthroughCopy('js')
}