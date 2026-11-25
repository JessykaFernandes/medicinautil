// Padrões para todos os conteúdos (resumos, artigos e PDFs).
// templateEngineOverride "md" evita que textos com "{{" ou "{%" quebrem o site.
const slugify = (s = "") => String(s)
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default {
  layout: "layouts/post.njk",
  templateEngineOverride: "md",
  tipo: "artigo",
  categoria: "clinica-medica",
  permalink: (data) => {
    if (data.rascunho) return false;
    return `/conteudo/${slugify(data.page.fileSlug) || "sem-titulo"}/`;
  },
};
