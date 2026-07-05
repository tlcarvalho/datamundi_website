/* Configuração do Eleventy (11ty) — DataMundi v4
   Nome de arquivo VISÍVEL (não-dotfile) para garantir que suba ao GitHub/Netlify.
   Eleventy 3.x carrega automaticamente eleventy.config.cjs. */
module.exports = function (eleventyConfig) {
  // Copia arquivos estáticos direto para o site final
  eleventyConfig.addPassthroughCopy("assets");
  // Copia o painel do Decap CMS (/admin) sem processá-lo como template
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.ignores.add("admin/index.html");

  // Evita que arquivos utilitários virem páginas
  eleventyConfig.ignores.add("README.md");

  // Iniciais de um nome (ex: "Prof. Dr. Thales Carvalho" -> "TC")
  eleventyConfig.addFilter("iniciais", function (nome) {
    return String(nome || "")
      .split(" ")
      .filter(function (w) { return w.length > 2; })
      .slice(0, 2)
      .map(function (w) { return w[0]; })
      .join("")
      .toUpperCase();
  });

  // Número com dois dígitos (ex: 6 -> "06")
  eleventyConfig.addFilter("pad2", function (n) {
    return String(n).padStart(2, "0");
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
