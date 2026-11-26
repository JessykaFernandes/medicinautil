# Medicina Útil (medicinautil.com): instruções para o Claude

Site estático (Eleventy) publicado no GitHub Pages. Cada push na `main` gera o site, roda `npm run verificar` e publica. Se a verificação falhar, nada vai ao ar.

## Publicar um conteúdo novo

1. Crie `src/conteudos/<slug-sem-acento>.md` com este cabeçalho:

```markdown
---
title: "Título"
description: "Uma ou duas frases (aparece no Google e nos cartões)."
date: AAAA-MM-DD
tipo: resumo            # resumo | artigo | pdf
categoria: cardiologia  # slug existente em src/_data/categorias.json
tags: [tema 1, tema 2]
arquivo: /arquivos/nome-do-arquivo.pdf   # só se houver PDF
rascunho: true          # opcional: não publica
---
```

2. O corpo é em Markdown, com seções `##`, tabelas e listas. **Sempre termine com `## Referências`**, citando apenas fontes reais e verificáveis (livros-texto, diretrizes, artigos), no formato Vancouver. Nunca invente referências, dados ou citações.
3. Coloque PDFs e imagens em `src/arquivos/`, com nomes em minúsculas, sem espaços nem acentos. O limite é de 95 MB por arquivo.
4. Rode `npm test` (gera o site e verifica). Só faça commit se aparecer "✅".
5. Faça commit em português ("Publica: <título>") e `git push origin main`. Em seguida, confira com `gh run list -R JessykaFernandes/medicinautil --limit 1`.

## Regras de conteúdo

- O público são estudantes e profissionais de medicina. A linguagem deve ser técnica, objetiva e baseada na literatura de referência.
- Não publique material protegido por direitos autorais (PDFs de livros, apostilas, slides de terceiros).
- Se a autora pedir revisão antes de publicar, use `rascunho: true` e mostre o texto antes de remover o campo.

## Configurações

- `src/_data/site.json`: nome, URL, e-mail e IDs do AdSense (`adsense.client` = `ca-pub-…`, além dos slots).
- `src/_data/categorias.json`: disciplinas. Os slugs usam apenas `a-z`, `0-9` e `-`.
