# Medicina Útil: site e aplicativo de medicina (medicinautil.com)

Site de resumos, artigos (blog) e PDFs de medicina, que também funciona como **aplicativo instalável no celular** (PWA) e já vem preparado para **anúncios do Google AdSense**.

**Custos:** hospedagem, publicação, painel e aplicativo são **gratuitos** (GitHub Pages). O único gasto é o registro anual do domínio **medicinautil.com**, que se paga com os anúncios. Um domínio próprio também é o que mais facilita a aprovação no AdSense.

---

## O que já vem pronto

| Recurso | Detalhes |
|---|---|
| 📝 Resumos, 📰 Blog, 📄 PDFs | Cada conteúdo tem tipo, disciplina e assuntos (tags) |
| 🗂️ 19 disciplinas | De Anatomia a Saúde Coletiva, todas editáveis pelo painel |
| 🔍 Busca instantânea | Ignora acentos, busca dentro do texto e filtra por tipo e disciplina |
| 📱 Aplicativo (PWA) | Instala no Android, iPhone e computador, sem loja |
| 📴 Modo offline | Páginas visitadas, conteúdos "Salvos" e PDFs marcados abrem sem internet |
| 🔖 Salvos | O leitor guarda os conteúdos favoritos no próprio aparelho |
| 🎨 Visual | Tons de laranja, dourado e amarelo com detalhes em verde |
| 🌗 Tema claro e escuro | Segue o celular automaticamente; o botão ☀️/🌙 troca e memoriza a escolha |
| 💰 Anúncios | Google AdSense em 4 posições (topo, meio, lateral, rodapé) + `ads.txt` |
| 🔎 SEO | Sitemap, RSS, Open Graph (prévia no WhatsApp), dados estruturados |
| ⚖️ Páginas exigidas pelo AdSense | Sobre, Contato, Política de Privacidade (LGPD), Termos de Uso, aviso de cookies |
| 🛡️ Proteção contra erros | Toda publicação é verificada; se houver erro (link quebrado, PDF faltando etc.), nada vai ao ar e o site atual continua funcionando |
| ✍️ Painel `/admin` | Publique textos e envie PDFs pelo navegador (inclusive pelo celular) |

---

## Configuração inicial (concluída)

- ✅ Domínio **medicinautil.com** registrado.
- ✅ Projeto enviado ao repositório `medicinautil` no GitHub.
- ✅ GitHub Pages ligado (Source: GitHub Actions) e domínio personalizado configurado.
- ✅ Registros de DNS criados no registrador:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | o endereço `.github.io` da conta dona do repositório |

Quando o DNS propagar, marque **Enforce HTTPS** em *Settings → Pages*.

O campo `github_repo` em `src/_data/site.json` aponta para o repositório do site. Ele só é usado pelo painel `/admin` e não aparece para os visitantes.

## Passo 6: Configurar o painel de publicação `/admin` (3 min)

1. No GitHub: foto do perfil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Em **Repository access**, escolha **Only select repositories** e marque o repositório do site.
3. Em **Permissions → Repository permissions → Contents**, escolha **Read and write**.
4. Gere o token e copie. Guarde-o como uma senha e não compartilhe.
5. Acesse `https://medicinautil.com/admin/`, escolha **Sign in with Token** e cole o token.

Para publicar no painel:
- **Conteúdos → New**: preencha título, descrição, tipo (Resumo, Artigo ou PDF) e disciplina.
- Para PDF, use o campo **Arquivo PDF**: ele ganha botões *Abrir*, *Baixar* e *Disponível offline*, e o visualizador embutido no computador.
- Clique em **Save**. O site atualiza sozinho em 1 a 3 minutos.
- **Configurações do site**: altere nome, e-mail, IDs do AdSense e a lista de disciplinas sem mexer em código.
- Para guardar sem publicar, marque **Rascunho**.

> O token expira na data escolhida. Quando expirar, gere outro (itens 1 a 4 deste passo).

---

## Passo 7: Ativar os anúncios (Google AdSense)

1. Com o site no ar e **alguns conteúdos originais publicados**, crie a conta em **adsense.google.com**. É preciso ter 18 anos ou mais e informar dados bancários e fiscais para receber.
2. Adicione o site `medicinautil.com`.
3. O AdSense mostra seu ID de editor (`ca-pub-1234567890123456`). Cole-o no painel `/admin` → **Configurações do site → Google AdSense → ID do editor**, ou diretamente em `src/_data/site.json` no campo `adsense.client`.
   - Isso já insere o código de verificação em todas as páginas **e** gera o `ads.txt` automaticamente.
4. Clique em **Verificar** no AdSense e aguarde a análise, que pode levar de dias a algumas semanas.
5. Depois da aprovação, escolha uma das opções:
   - **Anúncios automáticos** (mais fácil): ative em *Anúncios → Por site*. O Google posiciona sozinho, sem precisar de mais nada.
   - **Blocos manuais** (mais controle): crie blocos de "Anúncio de display" responsivos e cole cada número (`data-ad-slot`) nos campos *Slot topo / meio / lateral / rodapé*. Os blocos aparecem nas posições já reservadas no layout.
6. **Privacidade e mensagens** (no AdSense): ative a mensagem de consentimento do Google para visitantes da Europa. É gratuita e não exige código.

O pagamento é feito quando o saldo atinge o valor mínimo definido pelo AdSense para o Brasil.

### ⚠️ Pontos importantes para ser aprovado e não perder a conta

- **Domínio:** com `medicinautil.com` você comprova a posse do site e o `ads.txt` fica na raiz do domínio (`https://medicinautil.com/ads.txt`), como o AdSense exige.
- **Direitos autorais:** **não publique PDFs de livros, apostilas de cursinho ou slides de professores sem autorização.** Isso viola a Lei 9.610/98, gera denúncias que derrubam o repositório e é motivo de banimento definitivo do AdSense. Publique materiais **seus** (resumos, mapas mentais, roteiros) citando as fontes.
- **Conteúdo médico:** o Google é mais rigoroso com temas de saúde (YMYL). Conteúdo original, com referências (como nos exemplos), aumenta a chance de aprovação.
- **Nunca clique nos próprios anúncios** nem peça para outras pessoas clicarem: é a principal causa de banimento.

---

## Aplicativo no celular

O site **é** o aplicativo, sem loja e sem custo:
- **Android (Chrome):** botão **Instalar app** no topo do site, ou menu ⋮ → *Instalar app*.
- **iPhone (Safari):** botão **Instalar app** (mostra as instruções) → Compartilhar → *Adicionar à Tela de Início*.
- **Computador (Chrome/Edge):** ícone de instalar na barra de endereço.

**Opcional, na Google Play:** em **pwabuilder.com**, cole o endereço do site e gere o pacote Android. A publicação na Play Store exige a taxa única de cadastro de desenvolvedor do Google (US$ 25). Não é necessário para o app funcionar.

---

## Escrevendo conteúdos sem o painel (opcional)

Cada conteúdo é um arquivo `.md` em `src/conteudos/`:

```markdown
---
title: "Insuficiência cardíaca: classificação"
description: "Resumo das classificações da IC."
date: 2026-12-01
tipo: resumo            # resumo | artigo | pdf
categoria: cardiologia  # identificador da disciplina (src/_data/categorias.json)
tags: [insuficiência cardíaca, diretriz]
arquivo: /arquivos/meu-arquivo.pdf   # opcional
---

## Título da seção

Texto em **Markdown**: tabelas, listas, citações...

## Referências
- Autor. Título. Edição. Editora; ano.
```

Coloque os PDFs em `src/arquivos/`. O limite do GitHub é de 100 MB por arquivo; comprima PDFs grandes.

Os três conteúdos de exemplo (hipertensão, métodos de estudo e roteiro de anamnese) podem ser editados ou apagados.

## Testar no computador (opcional, para quem quiser)

Requer Node.js 20 ou superior (nodejs.org).

```bash
npm install
```

```bash
npm start
```

Abra http://localhost:8080. No modo de teste, os espaços de anúncio aparecem como caixas tracejadas.

```bash
npm test
```

`npm test` gera o site e roda a verificação automática de erros.

## Estrutura

```
src/
  _data/site.json        ← nome, URL, e-mail, AdSense, Analytics
  _data/categorias.json  ← disciplinas
  conteudos/             ← resumos, artigos e PDFs (.md)
  arquivos/              ← PDFs e imagens enviados
  _includes/             ← layouts e componentes
  assets/                ← CSS, JS e ícones
  admin/                 ← painel de publicação
scripts/verificar.mjs    ← verificação automática antes de publicar
.github/workflows/       ← publicação automática no GitHub Pages
```
