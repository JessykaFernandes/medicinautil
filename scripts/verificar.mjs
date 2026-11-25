// Verificação automática do site gerado (_site). Roda no GitHub Actions antes de publicar:
// se algo estiver quebrado, a publicação é cancelada e o site no ar continua intacto.
import fs from "node:fs";
import path from "node:path";

const SAIDA = "_site";
const prefixo = ("/" + (process.env.PATH_PREFIX || "/").replace(/^\/+|\/+$/g, "") + "/").replace(/\/+/g, "/");
const erros = [];
const avisos = [];

function arquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? arquivos(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

if (!fs.existsSync(SAIDA)) { console.error("Pasta _site não existe. Rode `npm run build` antes."); process.exit(1); }
const todos = arquivos(SAIDA);

// 1) JSON válidos
for (const f of ["manifest.webmanifest", "search-index.json"]) {
  try { JSON.parse(fs.readFileSync(path.join(SAIDA, f), "utf8")); }
  catch (e) { erros.push(`${f}: JSON inválido (${e.message})`); }
}

// 2) Arquivos essenciais
for (const f of ["index.html", "404.html", "sw.js", "offline/index.html", "robots.txt", "sitemap.xml", "ads.txt", "admin/config.yml", "admin/index.html"]) {
  if (!fs.existsSync(path.join(SAIDA, f))) erros.push(`Arquivo essencial ausente: ${f}`);
}

// 2b) Configuração do painel sem marcações de template não processadas
const cfg = fs.readFileSync(path.join(SAIDA, "admin/config.yml"), "utf8");
if (/\{%|%\}/.test(cfg)) erros.push("admin/config.yml contém marcações de template não processadas");

// 3) Links internos e recursos quebrados
function existe(urlPath) {
  let p = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (!p.startsWith(prefixo)) return false;
  p = p.slice(prefixo.length);
  const alvo = path.join(SAIDA, p);
  if (p === "" || p.endsWith("/")) return fs.existsSync(path.join(alvo, "index.html"));
  return fs.existsSync(alvo) || fs.existsSync(path.join(alvo, "index.html"));
}
const reAttr = /\s(?:href|src|data)="([^"]+)"/g;
for (const f of todos.filter((f) => f.endsWith(".html"))) {
  if (f.includes(`${path.sep}admin${path.sep}`)) continue;
  const html = fs.readFileSync(f, "utf8");
  const rel = path.relative(SAIDA, f);
  for (const m of html.matchAll(reAttr)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(url)) continue;
    if (!url.startsWith("/")) continue;
    if (!existe(url)) erros.push(`${rel}: link/recurso quebrado → ${url}`);
  }
  if (/\bundefined\b|\[object Object\]|NaN min/.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) {
    erros.push(`${rel}: contém "undefined", "NaN" ou "[object Object]" (dado faltando em algum conteúdo)`);
  }
}

// 4) Conteúdos: campos obrigatórios e PDFs existentes
const pastaConteudos = "src/conteudos";
const categorias = JSON.parse(fs.readFileSync("src/_data/categorias.json", "utf8")).lista.map((c) => c.slug);
for (const f of fs.readdirSync(pastaConteudos).filter((f) => f.endsWith(".md"))) {
  const txt = fs.readFileSync(path.join(pastaConteudos, f), "utf8");
  const fm = (txt.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || "";
  const campo = (n) => ((fm.match(new RegExp(`^${n}:\\s*(.*)$`, "m")) || [])[1] || "").trim().replace(/^["']|["']$/g, "");
  if (!campo("title")) erros.push(`${f}: falta o título (title)`);
  const cat = campo("categoria");
  if (cat && !categorias.includes(cat)) erros.push(`${f}: disciplina "${cat}" não existe em categorias.json`);
  const tipo = campo("tipo");
  if (tipo && !["resumo", "artigo", "pdf"].includes(tipo)) erros.push(`${f}: tipo "${tipo}" inválido (use resumo, artigo ou pdf)`);
  const arq = campo("arquivo");
  if (arq && !fs.existsSync(path.join("src", arq.replace(/^\/+/, "")))) erros.push(`${f}: arquivo "${arq}" não encontrado em src/arquivos`);
  if (!campo("description")) avisos.push(`${f}: sem descrição curta (recomendado para o Google)`);
}

// 5) Tamanho dos arquivos (limite do GitHub: 100 MB por arquivo)
for (const f of todos) {
  const mb = fs.statSync(f).size / 1024 / 1024;
  if (mb > 95) erros.push(`${path.relative(SAIDA, f)}: ${mb.toFixed(1)} MB — acima do limite do GitHub (100 MB)`);
  else if (mb > 25) avisos.push(`${path.relative(SAIDA, f)}: ${mb.toFixed(1)} MB — arquivo grande, considere comprimir o PDF`);
}

avisos.forEach((a) => console.warn("⚠️  " + a));
if (erros.length) {
  erros.forEach((e) => console.error("❌ " + e));
  console.error(`\n${erros.length} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log(`✅ Verificação concluída: ${todos.length} arquivos, nenhum problema encontrado.`);
