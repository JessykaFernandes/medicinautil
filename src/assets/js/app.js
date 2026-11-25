/* MedAcervo — scripts do site/aplicativo. Sem dependências externas. */
(function () {
  "use strict";

  var BASE = (document.querySelector('meta[name="base-path"]') || {}).content || "/";
  var CACHE_PDFS = "pdfs-v1";

  // ---------- Utilidades ----------
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function lerLS(chave, padrao) {
    try { var v = localStorage.getItem(chave); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
  }
  function gravarLS(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function comBase(caminho) {
    if (!caminho) return BASE;
    if (/^[a-z]+:\/\//i.test(caminho)) return caminho;
    if (BASE !== "/" && caminho.indexOf(BASE) === 0) return caminho;
    return (BASE + String(caminho).replace(/^\/+/, "")).replace(/\/{2,}/g, "/");
  }
  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }
  function nomeTipo(t) { return t === "pdf" ? "PDF" : t === "resumo" ? "Resumo" : "Artigo"; }
  function cardHTML(i, tituloHTML, descHTML) {
    return '<article class="card card-' + esc(i.y) + '"><a class="card-link" href="' + esc(i.u) + '">' +
      '<div class="card-topo"><span class="selo selo-' + esc(i.y) + '">' + nomeTipo(i.y) + '</span>' +
      '<span class="card-cat">' + esc(i.cn || "") + "</span></div>" +
      '<h3 class="card-titulo">' + (tituloHTML || esc(i.t)) + "</h3>" +
      '<p class="card-desc">' + (descHTML || esc(i.d || "")) + "</p>" +
      '<div class="card-meta"><span>' + esc(i.dt || "") + "</span>" + (i.f ? "<span>· 📎 arquivo</span>" : "") + "</div>" +
      "</a></article>";
  }

  // ---------- Tema ----------
  var btnTema = $("#alternar-tema");
  if (btnTema) {
    btnTema.addEventListener("click", function () {
      var atual = document.documentElement.dataset.tema;
      var escuroSistema = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var estaEscuro = atual ? atual === "escuro" : escuroSistema;
      var novo = estaEscuro ? "claro" : "escuro";
      document.documentElement.dataset.tema = novo;
      try { localStorage.setItem("tema", novo); } catch (e) {}
    });
  }

  // ---------- Anúncios (AdSense) ----------
  function iniciarAnuncios() {
    var blocos = $all("ins.adsbygoogle:not([data-adsbygoogle-status])");
    blocos.forEach(function (el) {
      if (el.dataset.iniciado) return;
      el.dataset.iniciado = "1";
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* bloqueador de anúncios */ }
    });
  }
  if (document.readyState === "complete") iniciarAnuncios();
  else window.addEventListener("load", iniciarAnuncios);

  // ---------- Aviso de cookies ----------
  var aviso = $("#aviso-cookies");
  if (aviso && !lerLS("cookies-ok", false)) {
    aviso.hidden = false;
    $("#aceitar-cookies").addEventListener("click", function () {
      gravarLS("cookies-ok", true);
      aviso.hidden = true;
    });
  }

  // ---------- Online / offline ----------
  var faixa = $("#offline-faixa");
  function atualizarConexao() { if (faixa) faixa.hidden = navigator.onLine !== false; }
  window.addEventListener("online", atualizarConexao);
  window.addEventListener("offline", atualizarConexao);
  atualizarConexao();

  // ---------- Service worker (app instalável/offline) ----------
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(comBase("sw.js"), { scope: BASE }).catch(function () {});
    });
  }

  // ---------- Instalação do aplicativo ----------
  var promptInstalacao = null;
  var ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var instalado = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  var botoesInstalar = $all("#instalar-app, [data-acao='instalar']");

  var btnTopo = $("#instalar-app");
  function mostrarBotoes(mostrar) { if (btnTopo) btnTopo.hidden = !mostrar || instalado; }
  mostrarBotoes(ehIOS);
  if (instalado) $all(".app-chamada").forEach(function (s) { s.hidden = true; });

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    promptInstalacao = e;
    mostrarBotoes(true);
  });
  window.addEventListener("appinstalled", function () {
    promptInstalacao = null;
    mostrarBotoes(false);
    toast("Aplicativo instalado! 🎉");
  });
  botoesInstalar.forEach(function (b) {
    b.addEventListener("click", function () {
      if (promptInstalacao) {
        promptInstalacao.prompt();
        promptInstalacao.userChoice.finally(function () { promptInstalacao = null; });
      } else if (ehIOS) {
        var m = $("#modal-ios");
        if (m && m.showModal) m.showModal(); else alert("No Safari, toque em Compartilhar e depois em 'Adicionar à Tela de Início'.");
      } else if (instalado) {
        toast("O aplicativo já está instalado.");
      } else {
        toast("Use o menu do navegador (⋮) e escolha 'Instalar app' ou 'Adicionar à tela inicial'.");
      }
    });
  });

  // ---------- Filtros por chips ----------
  $all("[data-filtro-lista]").forEach(function (grupo) {
    var campo = grupo.getAttribute("data-filtro-campo") || "categoria";
    var lista = grupo.parentElement.querySelector("[data-lista-cards]");
    if (!lista) return;
    grupo.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filtro]");
      if (!chip) return;
      var valor = chip.getAttribute("data-filtro");
      $all("[data-filtro]", grupo).forEach(function (c) { c.classList.toggle("ativo", c === chip); });
      $all(".card", lista).forEach(function (card) {
        card.hidden = !!valor && card.getAttribute("data-" + campo) !== valor;
      });
    });
  });

  // ---------- Salvos ----------
  function salvos() { var s = lerLS("salvos", []); return Array.isArray(s) ? s : []; }

  var post = $(".post[data-post-url]");
  if (post) {
    var urlPost = comBase(post.getAttribute("data-post-url"));
    var btnSalvar = $("[data-acao='salvar']", post);
    var atualizarSalvar = function () {
      var ok = salvos().some(function (s) { return s.u === urlPost; });
      btnSalvar.setAttribute("aria-pressed", ok ? "true" : "false");
      btnSalvar.querySelector("span").textContent = ok ? "Salvo" : "Salvar";
    };
    if (btnSalvar) {
      atualizarSalvar();
      btnSalvar.addEventListener("click", function () {
        var lista = salvos();
        var idx = lista.findIndex(function (s) { return s.u === urlPost; });
        if (idx >= 0) { lista.splice(idx, 1); toast("Removido dos salvos"); }
        else {
          var meta = $(".post-meta time", post);
          lista.unshift({
            u: urlPost,
            t: post.getAttribute("data-post-titulo"),
            d: post.getAttribute("data-post-desc"),
            y: post.getAttribute("data-post-tipo"),
            cn: post.getAttribute("data-post-cat"),
            dt: meta ? meta.textContent : "",
            f: !!$(".pdf-bloco", post),
          });
          toast("Salvo! Disponível também sem internet.");
          if ("caches" in window) caches.open("salvos-paginas").then(function (c) { return c.add(urlPost); }).catch(function () {});
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ tipo: "salvar-pagina", url: urlPost });
          }
        }
        gravarLS("salvos", lista.slice(0, 500));
        atualizarSalvar();
      });
    }

    var btnCompartilhar = $("[data-acao='compartilhar']", post);
    if (btnCompartilhar) {
      btnCompartilhar.addEventListener("click", function () {
        var dados = { title: post.getAttribute("data-post-titulo"), text: post.getAttribute("data-post-desc") || "", url: location.href };
        if (navigator.share) { navigator.share(dados).catch(function () {}); return; }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(location.href).then(function () { toast("Link copiado!"); }, function () {
            window.open("https://wa.me/?text=" + encodeURIComponent(dados.title + " " + dados.url), "_blank", "noopener");
          });
        } else {
          window.open("https://wa.me/?text=" + encodeURIComponent(dados.title + " " + dados.url), "_blank", "noopener");
        }
      });
    }

    var btnImprimir = $("[data-acao='imprimir']", post);
    if (btnImprimir) btnImprimir.addEventListener("click", function () { window.print(); });

    var blocoPdf = $(".pdf-bloco", post);
    var btnPdf = $("[data-acao='offline-pdf']", post);
    if (blocoPdf && btnPdf) {
      var urlPdf = new URL(comBase(blocoPdf.getAttribute("data-arquivo")), location.href).href;
      if (!("caches" in window)) { btnPdf.hidden = true; }
      else {
        caches.open(CACHE_PDFS).then(function (c) { return c.match(urlPdf); }).then(function (r) {
          if (r) { btnPdf.textContent = "✓ Salvo offline"; btnPdf.setAttribute("aria-pressed", "true"); }
        });
        btnPdf.addEventListener("click", function () {
          if (btnPdf.getAttribute("aria-pressed") === "true") {
            caches.open(CACHE_PDFS).then(function (c) { return c.delete(urlPdf); }).then(function () {
              btnPdf.textContent = "Disponível offline"; btnPdf.setAttribute("aria-pressed", "false"); toast("PDF removido do aparelho");
            });
            return;
          }
          btnPdf.disabled = true; btnPdf.textContent = "Baixando…";
          caches.open(CACHE_PDFS).then(function (c) { return c.add(urlPdf); }).then(function () {
            btnPdf.textContent = "✓ Salvo offline"; btnPdf.setAttribute("aria-pressed", "true"); toast("PDF salvo no aparelho");
          }).catch(function () {
            btnPdf.textContent = "Disponível offline"; toast("Não foi possível salvar. Verifique a conexão.");
          }).finally(function () { btnPdf.disabled = false; });
        });
      }
    }
  }

  var listaSalvos = $("#lista-salvos");
  if (listaSalvos) {
    var renderSalvos = function () {
      var s = salvos();
      $("#salvos-vazio").hidden = s.length > 0;
      listaSalvos.innerHTML = s.map(function (i) { return cardHTML(i); }).join("");
    };
    renderSalvos();
  }

  // ---------- Busca ----------
  var campoBusca = $("#q");
  if (campoBusca && $("#resultados")) iniciarBusca();

  function normChar(c) {
    var n = c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    return n.length === 1 ? n : c.toLowerCase().charAt(0) || c;
  }
  function norm(s) {
    var out = "";
    var str = String(s || "").normalize("NFC");
    for (var k = 0; k < str.length; k++) out += normChar(str[k]);
    return out;
  }
  function destacar(texto, termos) {
    var original = String(texto || "").normalize("NFC");
    var n = norm(original);
    var marcas = new Array(original.length).fill(false);
    termos.forEach(function (t) {
      if (!t) return;
      var p = n.indexOf(t);
      while (p !== -1) { for (var k = p; k < p + t.length && k < marcas.length; k++) marcas[k] = true; p = n.indexOf(t, p + t.length); }
    });
    var html = "", aberto = false;
    for (var k = 0; k < original.length; k++) {
      if (marcas[k] && !aberto) { html += "<mark>"; aberto = true; }
      if (!marcas[k] && aberto) { html += "</mark>"; aberto = false; }
      html += esc(original[k]);
    }
    if (aberto) html += "</mark>";
    return html;
  }
  function trecho(texto, termo) {
    var n = norm(texto);
    var p = n.indexOf(termo);
    if (p < 0) return "";
    var ini = Math.max(0, p - 70);
    var fim = Math.min(texto.length, p + 110);
    return (ini > 0 ? "…" : "") + texto.slice(ini, fim) + (fim < texto.length ? "…" : "");
  }

  function iniciarBusca() {
    var status = $("#busca-status");
    var res = $("#resultados");
    var fTipo = $("#f-tipo");
    var fCat = $("#f-cat");
    var indice = [];
    var params = new URLSearchParams(location.search);
    campoBusca.value = params.get("q") || "";
    if (params.get("tipo")) fTipo.value = params.get("tipo");
    if (params.get("cat")) fCat.value = params.get("cat");

    fetch(comBase("search-index.json"))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (dados) {
        indice = (dados || []).map(function (i) {
          i._t = norm(i.t); i._d = norm(i.d); i._g = norm((i.g || []).join(" ")); i._c = norm(i.cn); i._x = norm(i.x);
          return i;
        });
        buscar();
      })
      .catch(function () { status.textContent = "Não foi possível carregar a busca. Verifique sua conexão."; });

    var timer;
    campoBusca.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(buscar, 120); });
    fTipo.addEventListener("change", buscar);
    fCat.addEventListener("change", buscar);

    function buscar() {
      var q = campoBusca.value.trim();
      var termos = norm(q).split(/\s+/).filter(function (t) { return t.length > 0; });
      var tipo = fTipo.value, cat = fCat.value;

      var url = new URL(location.href);
      q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
      tipo ? url.searchParams.set("tipo", tipo) : url.searchParams.delete("tipo");
      cat ? url.searchParams.set("cat", cat) : url.searchParams.delete("cat");
      history.replaceState(null, "", url);

      var achados = [];
      indice.forEach(function (i) {
        if (tipo && i.y !== tipo) return;
        if (cat && i.c !== cat) return;
        var score = 0;
        for (var k = 0; k < termos.length; k++) {
          var t = termos[k], s = 0;
          if (i._t.indexOf(t) >= 0) s += 10;
          if (i._g.indexOf(t) >= 0) s += 6;
          if (i._d.indexOf(t) >= 0) s += 4;
          if (i._c.indexOf(t) >= 0) s += 3;
          if (i._x.indexOf(t) >= 0) s += 1;
          if (!s) return; // todos os termos precisam aparecer
          score += s;
        }
        achados.push({ i: i, s: score });
      });
      if (termos.length) achados.sort(function (a, b) { return b.s - a.s; });

      if (!indice.length) { status.textContent = "Ainda não há conteúdos publicados."; res.innerHTML = ""; return; }
      status.textContent = termos.length || tipo || cat
        ? achados.length + (achados.length === 1 ? " resultado" : " resultados") + (q ? " para “" + q + "”" : "")
        : "Mostrando todos os " + achados.length + " conteúdos. Digite para filtrar.";

      res.innerHTML = achados.slice(0, 100).map(function (a) {
        var i = a.i, desc = i.d || "";
        if (termos.length && i._d.indexOf(termos[0]) < 0 && i._t.indexOf(termos[0]) < 0) {
          var tr = trecho(i.x || "", termos[0]);
          if (tr) desc = tr;
        }
        return cardHTML(i, termos.length ? destacar(i.t, termos) : null, termos.length ? destacar(desc, termos) : esc(desc));
      }).join("");
    }
  }
})();
