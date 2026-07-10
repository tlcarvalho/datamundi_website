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

  // Formata uma data ISO para o padrão "22 abr. 2026"
  eleventyConfig.addFilter("dataBR", function (d) {
    if (!d) return "";
    var meses = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return String(dt.getUTCDate()).padStart(2, "0") + " " + meses[dt.getUTCMonth()] + " " + dt.getUTCFullYear();
  });

  // Soma o total de membros em todos os grupos de equipe.json
  eleventyConfig.addFilter("sumMembros", function (grupos) {
    return (grupos || []).reduce(function (total, g) {
      return total + ((g.membros || []).length);
    }, 0);
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
