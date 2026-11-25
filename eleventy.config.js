import { HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs";

// Caminho-base (ex.: "/meu-repo/" em sites de projeto do GitHub Pages).
// Definido automaticamente pelo GitHub Actions; localmente fica "/".
const rawPrefix = process.env.PATH_PREFIX || "/";
const pathPrefix = ("/" + rawPrefix.replace(/^\/+|\/+$/g, "") + "/").replace(/\/+/g, "/");

const site = JSON.parse(fs.readFileSync("./src/_data/site.json", "utf8"));
const siteOrigin = (process.env.SITE_ORIGIN || site.url || "").replace(/\/+$/, "");

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function toDate(v) {
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d) ? null : d;
}

function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ").trim();
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Arquivos copiados sem processamento
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/arquivos": "arquivos" });
  eleventyConfig.addPassthroughCopy({ "src/admin/index.html": "admin/index.html" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" }); // domínio próprio (opcional)

  eleventyConfig.addWatchTarget("src/assets/");

  // Dados globais calculados
  eleventyConfig.addGlobalData("basePath", pathPrefix);
  eleventyConfig.addGlobalData("siteOrigin", siteOrigin);
  eleventyConfig.addGlobalData("buildId", Date.now().toString(36));

  // ---------- Coleções ----------
  const publicados = (api) =>
    api.getFilteredByGlob("src/conteudos/*.md")
      .filter((p) => !p.data.rascunho)
      .sort((a, b) => b.date - a.date);

  eleventyConfig.addCollection("conteudos", publicados);

  eleventyConfig.addCollection("listaTags", (api) => {
    const mapa = new Map();
    for (const p of publicados(api)) {
      for (const t of p.data.tags || []) {
        const nome = String(t).trim();
        if (!nome || nome === "conteudos") continue;
        const slug = slugify(nome);
        if (!slug) continue;
        if (!mapa.has(slug)) mapa.set(slug, { nome, slug, itens: [] });
        mapa.get(slug).itens.push(p);
      }
    }
    return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  });

  // ---------- Filtros ----------
  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("textoPuro", stripHtml);

  eleventyConfig.addFilter("dataBR", (v) => {
    const d = toDate(v);
    if (!d) return "";
    return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dataISO", (v) => {
    const d = toDate(v);
    return d ? d.toISOString() : "";
  });
  eleventyConfig.addFilter("dataRFC", (v) => {
    const d = toDate(v);
    return d ? d.toUTCString() : "";
  });

  eleventyConfig.addFilter("tempoLeitura", (html) => {
    const palavras = stripHtml(html).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(palavras / 200));
  });

  eleventyConfig.addFilter("resumir", (str = "", n = 160) => {
    const s = stripHtml(str);
    return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s;
  });

  eleventyConfig.addFilter("onde", (arr = [], campo, valor) =>
    (arr || []).filter((i) => (i.data ? i.data[campo] : i[campo]) === valor));

  eleventyConfig.addFilter("limite", (arr = [], n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("relacionados", (arr = [], atual, n = 3) => {
    if (!atual) return [];
    return (arr || [])
      .filter((p) => p.url !== atual.url)
      .map((p) => {
        let score = 0;
        if (p.data.categoria === atual.data.categoria) score += 3;
        const tA = new Set(atual.data.tags || []);
        for (const t of p.data.tags || []) if (tA.has(t)) score += 1;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.date - a.p.date)
      .slice(0, n)
      .map((x) => x.p);
  });

  eleventyConfig.addFilter("categoria", (slug, lista = []) =>
    (lista || []).find((c) => c.slug === slug) || { slug, nome: slug || "Geral", icone: "📘" });

  // Prefixa caminhos em JSON/XML/JS (no HTML o HtmlBasePlugin já faz isso)
  eleventyConfig.addFilter("comBase", (p = "/") =>
    (pathPrefix + String(p).replace(/^\/+/, "")).replace(/\/{2,}/g, "/"));
  eleventyConfig.addFilter("absoluta", (p = "/") =>
    siteOrigin + (pathPrefix + String(p).replace(/^\/+/, "")).replace(/\/{2,}/g, "/"));

  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("tagsVisiveis", (t = []) => (t || []).filter((x) => x !== "conteudos"));

  eleventyConfig.addShortcode("ano", () => String(new Date().getFullYear()));

  // Markdown: permite HTML, links automáticos e tabelas responsivas
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ html: true, linkify: true, typographer: true });
    const defaultTable = md.renderer.rules.table_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
    const defaultTableClose = md.renderer.rules.table_close || ((t, i, o, e, s) => s.renderToken(t, i, o));
    md.renderer.rules.table_open = (...a) => '<div class="tabela-wrap">' + defaultTable(...a);
    md.renderer.rules.table_close = (...a) => defaultTableClose(...a) + "</div>";
  });

  return {
    pathPrefix,
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
