/* =====================================================================
   VENEZA BURGUER · APLICAÇÃO
   Cardápio, sacola (carrinho) e finalização do pedido.
   Os dados ficam em js/dados.js. Este arquivo não precisa ser editado
   para mudar produtos ou preços.
   ===================================================================== */
(() => {
  "use strict";

  const L = window.LOJA, CATS = window.CATEGORIAS, PRODS = window.PRODUTOS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const prod = (id) => PRODS.find((p) => p.id === id);
  const waLink = (msg) => `https://wa.me/${L.whatsapp}?text=${encodeURIComponent(msg)}`;
  const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DIAS_C = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  /* ------------------------------------------------------------------
     Utilidades de produto
     ------------------------------------------------------------------ */
  const temOpcoes = (p) => Array.isArray(p.opcoes) && p.opcoes.length > 0;
  const precoBase = (p) => (typeof p.preco === "number" ? p.preco : 0);
  const precoVitrine = (p) => {
    if (p.precoAPartir) return `<small>a partir de</small> ${brl(p.precoAPartir)}`;
    if (typeof p.preco !== "number") return "Consulte";
    return brl(p.preco);
  };
  /* economia real de um combo: soma apenas os itens com preço avulso */
  const comboInfo = (p) => {
    if (!p.combo || !p.combo.comparar) return null;
    let soma = 0;
    for (const [id, q] of p.combo.comparar) {
      const x = prod(id);
      if (!x || typeof x.preco !== "number") return null;
      soma += x.preco * q;
    }
    return { soma, economia: Math.max(0, soma - p.preco), extras: p.combo.extras };
  };

  /* ------------------------------------------------------------------
     Horário de funcionamento (fuso de Brasília)
     ------------------------------------------------------------------ */
  const agoraLoja = () => new Date(Date.now() + (L.fusoHorario * 60 + new Date().getTimezoneOffset()) * 60000);
  const min = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const fmtHora = (hhmm) => { const [h, m] = hhmm.split(":"); return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`; };
  function statusLoja() {
    const d = agoraLoja(), dia = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const h = L.horarios[dia];
    if (h && m >= min(h.abre) && m < min(h.fecha)) return { aberto: true, txt: `Aberto até ${fmtHora(h.fecha)}` };
    if (h && m < min(h.abre)) return { aberto: false, txt: `Abre hoje às ${fmtHora(h.abre)}` };
    for (let i = 1; i <= 7; i++) {
      const nd = (dia + i) % 7, nh = L.horarios[nd];
      if (nh) return { aberto: false, txt: `Abre ${i === 1 ? "amanhã" : DIAS[nd].toLowerCase()} às ${fmtHora(nh.abre)}` };
    }
    return { aberto: false, txt: "Fechado" };
  }
  function resumoHorarios() {
    // agrupa dias seguidos com o mesmo horário: "Seg a Sáb · 18h às 23h"
    const grupos = [];
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    for (const d of ordem) {
      const h = L.horarios[d], chave = h ? `${h.abre}-${h.fecha}` : "fechado";
      const g = grupos[grupos.length - 1];
      if (g && g.chave === chave) g.dias.push(d); else grupos.push({ chave, h, dias: [d] });
    }
    return grupos.map((g) => {
      const nome = g.dias.length > 1 ? `${DIAS_C[g.dias[0]]} a ${DIAS_C[g.dias[g.dias.length - 1]]}` : DIAS[g.dias[0]];
      return { nome, txt: g.h ? `${fmtHora(g.h.abre)} às ${fmtHora(g.h.fecha)}` : "Fechado" };
    });
  }

  /* ------------------------------------------------------------------
     Entrega
     ------------------------------------------------------------------ */
  function taxaEntrega(bairro) {
    const t = L.entrega.taxa;
    if (typeof t === "number") return t;
    if (t && typeof t === "object" && bairro) {
      const k = Object.keys(t).find((b) => b.toLowerCase().trim() === String(bairro).toLowerCase().trim());
      return k ? t[k] : null;
    }
    return null; // a combinar
  }

  /* ------------------------------------------------------------------
     Sacola (persistida no navegador)
     ------------------------------------------------------------------ */
  const CHAVE = "veneza-sacola-v1";
  let sacola = [];
  try { sacola = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { sacola = []; }
  // descarta itens que não existem mais no cardápio
  sacola = sacola.filter((l) => prod(l.produtoId));
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch {} };

  const precoUnitario = (linha) => precoBase(prod(linha.produtoId)) + linha.extras.reduce((s, e) => s + e.preco * e.qtd, 0);
  const subtotalLinha = (linha) => precoUnitario(linha) * linha.qtd;
  function totais(tipo = "entrega", bairro = "") {
    const subtotal = sacola.reduce((s, l) => s + subtotalLinha(l), 0);
    const economia = sacola.reduce((s, l) => { const c = comboInfo(prod(l.produtoId)); return s + (c ? c.economia * l.qtd : 0); }, 0);
    const taxa = tipo === "entrega" ? taxaEntrega(bairro) : 0;
    const total = subtotal + (typeof taxa === "number" ? taxa : 0);
    const itens = sacola.reduce((s, l) => s + l.qtd, 0);
    return { subtotal, economia, taxa, total, itens };
  }
  function adicionar(linha) {
    const assinatura = (l) => l.produtoId + "|" + JSON.stringify(l.extras) + "|" + (l.obs || "");
    const igual = sacola.find((l) => assinatura(l) === assinatura(linha));
    if (igual) igual.qtd += linha.qtd; else sacola.push({ ...linha, uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) });
    salvar(); renderSacola(); pulsarSacola();
  }
  function mudarQtd(uid, delta) {
    const l = sacola.find((x) => x.uid === uid); if (!l) return;
    l.qtd += delta;
    if (l.qtd <= 0) sacola = sacola.filter((x) => x.uid !== uid);
    salvar(); renderSacola();
  }
  function remover(uid) { sacola = sacola.filter((x) => x.uid !== uid); salvar(); renderSacola(); }

  /* ------------------------------------------------------------------
     Render: cabeçalho, banner, seções informativas
     ------------------------------------------------------------------ */
  function renderInfo() {
    $$(".js-wa").forEach((a) => { a.href = waLink(a.dataset.msg || `Olá! Vim pelo site do ${L.nome}.`); });

    const st = statusLoja();
    const s = $("#status-topo"); s.classList.toggle("aberto", st.aberto); s.lastElementChild.textContent = st.txt;

    const b = L.banner;
    $("#hero-selo").innerHTML = `${icon("star")}${esc(b.selo)}`;
    $("#hero-titulo").innerHTML = b.titulo.map((t, i) => (i === b.titulo.length - 1 ? `<span>${esc(t)}</span>` : esc(t))).join(" ");
    $("#hero-texto").textContent = b.texto;
    $("#hero-logo").src = b.logo;
    $("#hero-nota").textContent = L.google.nota;
    $("#hero-aval").textContent = `${L.google.totalAvaliacoes} avaliações no Google`;
    $("#hero-tempo").textContent = L.tempoEntrega;
    $("#hero-faixa").textContent = L.google.faixaPreco.replace(" por pessoa", "");
    $$(".estrelas").forEach((e) => { e.innerHTML = icon("star").repeat(5); });


    // canais de pedido
    const canais = [
      { ic: "wa", t: "WhatsApp", d: L.telefoneExibicao, href: waLink(`Olá! Vim pelo site do ${L.nome} e quero fazer um pedido.`), cta: "Chamar agora", ext: true },
      ...L.plataformas.map((p) => ({ ic: "moto", t: p.nome, d: "Peça pela plataforma", href: p.url, cta: "Abrir", ext: true })),
      { ic: "store", t: "Comer no local", d: `${L.endereco.linha}, ${L.endereco.bairro}`, href: "#onde-fica", cta: "Ver endereço", ext: false }
    ];
    $("#canais").innerHTML = canais.map((c) => `<a class="canal" href="${esc(c.href)}" ${c.ext ? 'target="_blank" rel="noopener"' : ""}>${icon(c.ic)}<b>${esc(c.t)}</b><span>${esc(c.d)}</span><em>${esc(c.cta)}${icon("arrow")}</em></a>`).join("");

    // avaliações
    $("#aval-titulo").innerHTML = `Nota ${esc(L.google.nota)} <span>no Google</span>`;
    $("#aval-texto").textContent = `${L.google.totalAvaliacoes} avaliações de clientes no Google.`;
    $("#aval-link").href = L.google.url;
    $("#avals").innerHTML = L.avaliacoes.slice(0, L.avaliacoesNoSite || 3).map((a, i) => `<figure class="aval">
      <span class="estrelas" aria-label="5 de 5 estrelas">${icon("star").repeat(5)}</span>
      <blockquote>“${esc(a.texto)}”</blockquote>
      <figcaption><span class="av">${esc(a.nome.trim()[0].toUpperCase())}</span><span><b>${esc(a.nome)}</b>${esc(a.quando)} · Google</span></figcaption>
    </figure>`).join("");

    // espaço
    const icEsp = { "Mesas externas": "chair", "Refeição no local": "store", "Bom para ir com crianças": "kids", "Área kids": "kids", "Cães permitidos na área externa": "paw" };
    $("#espaco-lista").innerHTML = L.espaco.map((e) => `<li>${icon(icEsp[e] || "check")}${esc(e)}</li>`).join("");

    // onde fica
    const E = L.endereco;
    $("#onde-titulo").innerHTML = `${esc(E.linha)} <span>${esc(E.bairro)}</span>`;
    $("#onde-cidade").textContent = `${E.cidade} - ${E.uf}${E.cep ? ", " + E.cep : ""}`;
    $("#mapa-end").textContent = E.linha;
    $("#mapa").href = E.mapsUrl;
    $("#horarios").innerHTML = resumoHorarios().map((h) => `<span>${esc(h.nome)}</span><span>${esc(h.txt)}</span>`).join("");
    $("#onde-fone").textContent = L.telefoneExibicao;
    $("#onde-entrega").textContent = [L.entrega.ativa ? `Delivery (${L.tempoEntrega})` : null, L.entrega.retirada ? "retirada no local" : null].filter(Boolean).join(" ou ");
    $("#onde-pag").textContent = L.pagamentos.map((p) => p.nome).join(", ");
    $("#rota").href = `https://www.google.com/maps/dir/?api=1&destination=${E.latitude},${E.longitude}`;

    // dúvidas (respostas só com o que é publicado pela casa)
    const taxaTxt = typeof L.entrega.taxa === "number" ? `A taxa de entrega é ${brl(L.entrega.taxa)}.` : "A taxa de entrega é informada pela casa no WhatsApp, de acordo com o endereço.";
    const faq = [
      ["Vocês fazem entrega?", `Sim. O tempo de entrega informado pela casa é de ${L.tempoEntrega}. ${taxaTxt} Também dá para retirar no local.`],
      ["Quais as formas de pagamento?", `${L.pagamentos.map((p) => p.nome).join(", ")}, na entrega ou na retirada. Se for pagar em dinheiro, informe o troco ao finalizar.`],
      ["Qual o horário de funcionamento?", resumoHorarios().map((h) => `${h.nome}: ${h.txt}`).join(". ") + "."],
      ["Posso tirar ou acrescentar ingredientes?", "Pode. Ao escolher o lanche, marque os adicionais e escreva o que quer tirar no campo de observação."],
      ["Como funcionam os espetinhos e a jantinha?", "Nos espetinhos você escolhe os sabores e a quantidade de cada um. A jantinha vem com 2 espetos à escolha, arroz, farofa e vinagrete ou maionese."],
      ["O pedido feito pelo site já está confirmado?", "O site monta o pedido e abre o WhatsApp com tudo escrito. Depois de enviar, a casa confirma o pedido e o valor final com você."]
    ];
    if ($("#faq")) $("#faq").innerHTML = faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");

    // rodapé
    $("#rod-desc").textContent = `${L.descricaoCurta}. ${L.chamada}.`;
    $("#rod-cats").innerHTML = CATS.filter(catVisivel).map((c) => `<li><a href="#cat-${c.id}" data-ir-cat="${c.id}">${esc(c.nome)}</a></li>`).join("");
    $("#rod-contato").innerHTML = `<li><a class="js-wa2" href="${waLink(`Olá! Vim pelo site do ${L.nome}.`)}" target="_blank" rel="noopener">WhatsApp ${esc(L.telefoneExibicao)}</a></li>
      <li><a href="https://www.instagram.com/${esc(L.instagram)}/" target="_blank" rel="noopener">@${esc(L.instagram)}</a></li>
      ${L.plataformas.map((p) => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.nome)}</a></li>`).join("")}
      <li>${esc(E.linha)}, ${esc(E.bairro)}, ${esc(E.cidade)} - ${esc(E.uf)}</li>`;
    $("#rod-horario").innerHTML = resumoHorarios().map((h) => `<li>${esc(h.nome)}: ${esc(h.txt)}</li>`).join("");
    $("#rod-copy").textContent = `© ${new Date().getFullYear()} ${L.nome} · ${E.cidade} - ${E.uf}`;
  }

  /* ------------------------------------------------------------------
     Render: categorias, destaques, promoções, cardápio, combos
     ------------------------------------------------------------------ */
  const produtosDa = (catId) => PRODS.filter((p) => p.categoria === catId);
  const catVisivel = (c) => produtosDa(c.id).length > 0;
  const menorPreco = (catId) => {
    const ps = produtosDa(catId).map((p) => (p.precoAPartir ? p.precoAPartir : p.preco)).filter((v) => typeof v === "number" && v > 0);
    return ps.length ? Math.min(...ps) : null;
  };

  function cardFoto(p, cls = "") {
    return p.imagem
      ? `<img class="${cls}" src="${esc(p.imagem)}" alt="${esc(p.nome)}" loading="lazy" width="356" height="356">`
      : `<span class="sem-foto ${cls}">${icon((CATS.find((c) => c.id === p.categoria) || {}).icone || "burger")}</span>`;
  }

  function renderCategorias() {
    const outras = CATS.filter((c) => catVisivel(c) && !c.vitrine);
    $("#cats-mais").innerHTML = outras.length ? `<span>Também tem:</span>` + outras.map((c) => {
      const mp = menorPreco(c.id);
      return `<button type="button" class="cat-chip${c.destaque ? " cat-chip-destaque" : ""}" data-ir-cat="${c.id}">${icon(c.icone)}<b>${esc(c.nome)}</b>${mp ? `<small>a partir de ${brl(mp)}</small>` : ""}</button>`;
    }).join("") : "";
    $("#cats").innerHTML = CATS.filter((c) => catVisivel(c) && c.vitrine).map((c) => {
      const mp = menorPreco(c.id);
      return `<button type="button" class="cat${c.destaque ? " cat-destaque" : ""}" data-ir-cat="${c.id}">
        ${c.imagem ? `<img src="${esc(c.imagem)}" alt="" loading="lazy" width="356" height="356">` : ""}
        <span class="cat-ic">${icon(c.icone)}</span>
        <span class="cat-txt"><b>${esc(c.nome)}</b><small>${produtosDa(c.id).length} ${produtosDa(c.id).length === 1 ? "opção" : "opções"}${mp ? ` · a partir de ${brl(mp)}` : ""}</small></span>
      </button>`;
    }).join("");
  }

  function renderDestaques() {
    const mv = L.maisVendidos && L.maisVendidos.length;
    if (mv) {
      $("#dest-eyebrow").textContent = "Mais vendidos";
      $("#dest-titulo").innerHTML = "Os mais <span>pedidos</span>";
      $("#dest-texto").textContent = "Os lanches que mais saem na casa.";
    } else {
      $("#dest-eyebrow").textContent = "Destaques do cardápio";
      $("#dest-titulo").innerHTML = "Pra abrir <span>o apetite</span>";
      $("#dest-texto").textContent = "Alguns dos lanches da casa. Toque para escolher os adicionais e colocar na sacola.";
    }
    const lista = mv ? L.maisVendidos.map((id) => ({ id, motivo: "" })) : L.destaques;
    $("#destaques-lista").innerHTML = lista.map(({ id, motivo }, i) => {
      const p = prod(id); if (!p) return "";
      return `<article class="dest">
        <button type="button" class="dest-foto" data-abrir="${p.id}" aria-label="Escolher ${esc(p.nome)}">${cardFoto(p)}</button>
        <div class="dest-txt">
          ${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}
          <h3>${esc(p.nome)}</h3>
          ${motivo ? `<p class="motivo">${esc(motivo)}</p>` : ""}
          <p class="desc">${esc(p.descricao)}</p>
          <div class="dest-pe"><b class="preco">${precoVitrine(p)}</b>
          <button type="button" class="btn btn-amarelo btn-peq" data-abrir="${p.id}">${icon("plus")}Adicionar</button></div>
        </div>
      </article>`;
    }).join("");
  }

  function renderPromocoes() {
    const ps = L.promocoes || [];
    $("#promocoes").hidden = ps.length === 0;
    $("#promos").innerHTML = ps.map((p) => `<article class="promo">${icon("tag")}<div><h3>${esc(p.titulo)}</h3><p>${esc(p.texto || "")}</p>${p.validade ? `<small>${esc(p.validade)}</small>` : ""}</div>${p.produtoId && prod(p.produtoId) ? `<button class="btn btn-preto btn-peq" type="button" data-abrir="${esc(p.produtoId)}">Quero</button>` : ""}</article>`).join("");
  }

  function cardProduto(p) {
    const ci = comboInfo(p);
    return `<article class="item${p.categoria === "combos" ? " item-combo" : ""}" data-busca="${esc((p.nome + " " + (p.descricao || "")).toLowerCase())}">
      <button type="button" class="item-btn" data-abrir="${p.id}" aria-label="Escolher ${esc(p.nome)}">
        <span class="item-txt">
          ${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}
          <b class="item-nome">${esc(p.nome)}</b>
          ${p.descricao ? `<span class="item-desc">${esc(p.descricao)}</span>` : ""}
          ${ci && ci.economia > 0 ? `<span class="eco">${icon("tag")}Economia de ${brl(ci.economia)}</span>` : ""}
          <span class="item-preco">${precoVitrine(p)}</span>
        </span>
        <span class="item-foto">${cardFoto(p)}<span class="item-add" aria-hidden="true">${icon("plus")}</span></span>
      </button>
    </article>`;
  }

  function renderCardapio() {
    const cats = CATS.filter(catVisivel);
    $("#abas").innerHTML = cats.map((c, i) => `<button type="button" role="tab" class="aba${c.destaque ? " aba-destaque" : ""}" data-ir-cat="${c.id}" aria-selected="${i === 0}">${icon(c.icone)}${esc(c.curto)}</button>`).join("");
    $("#cardapio-lista").innerHTML = cats.map((c) => {
      const n = produtosDa(c.id).length, mp = menorPreco(c.id);
      return `<section class="cat-bloco${c.destaque ? " cat-bloco-destaque" : ""}" id="cat-${c.id}" data-cat="${c.id}">
      <h3 class="cat-titulo"><button type="button" class="cat-cab" data-toggle-cat="${c.id}" aria-expanded="false" aria-controls="itens-${c.id}">
        ${c.imagem ? `<img class="cat-thumb" src="${esc(c.imagem)}" alt="" width="356" height="356">` : `<span class="cat-ic">${icon(c.icone)}</span>`}
        <span class="cat-cab-txt"><b>${esc(c.nome)}</b><small>${n} ${n === 1 ? "opção" : "opções"}${mp ? ` · a partir de ${brl(mp)}` : ""}</small><span class="cat-desc">${esc(c.texto)}</span></span>
        <span class="cat-seta" aria-hidden="true">${icon("plus")}</span>
      </button></h3>
      <div class="itens" id="itens-${c.id}" role="region" aria-label="${esc(c.nome)}">${produtosDa(c.id).map(cardProduto).join("")}</div>
    </section>`;
    }).join("") + `<p class="vazio" id="busca-vazio" hidden>Nada encontrado. Tente outro nome ou <a class="js-wa-v" target="_blank" rel="noopener">pergunte no WhatsApp</a>.</p>`;
    $(".js-wa-v").href = waLink(`Olá! Vim pelo site do ${L.nome} e tenho uma dúvida sobre o cardápio.`);
  }

  function renderCombos() {
    $("#combos-lista").innerHTML = produtosDa("combos").map((p) => {
      const ci = comboInfo(p);
      let comp = "";
      if (ci) {
        comp = ci.economia > 0
          ? `<p class="combo-eco">${icon("tag")}<span>Só os lanches avulsos somam <b>${brl(ci.soma)}</b>. No combo você economiza <b>${brl(ci.economia)}</b> e ainda leva ${esc(ci.extras)}.</span></p>`
          : `<p class="combo-eco">${icon("tag")}<span>Os lanches avulsos somam <b>${brl(ci.soma)}</b>. Por mais <b>${brl(p.preco - ci.soma)}</b> você leva também ${esc(ci.extras)}.</span></p>`;
      }
      return `<article class="combo">
        <div class="combo-foto">${cardFoto(p)}${p.selo ? `<span class="selo">${esc(p.selo)}</span>` : ""}</div>
        <div class="combo-txt">
          <h3>${esc(p.nome)}</h3>
          <ul>${(p.combo?.itens || []).map((i) => `<li>${icon("star")}${esc(i)}</li>`).join("")}</ul>
          ${comp}
          <div class="combo-pe"><span class="combo-preco"><small>R$</small>${p.preco.toFixed(2).replace(".", ",")}</span>
          <button class="btn btn-amarelo" type="button" data-abrir="${p.id}">${icon("bag")}Adicionar à sacola</button></div>
        </div>
      </article>`;
    }).join("");
  }

  /* ------------------------------------------------------------------
     Navegação do cardápio: abas fixas, scroll-spy e busca
     ------------------------------------------------------------------ */
  const abertas = new Set();
  function abrirCat(catId, abrir = true) {
    const b = $(`#cat-${catId}`); if (!b) return;
    if (abrir) abertas.add(catId); else abertas.delete(catId);
    b.classList.toggle("aberto", abrir);
    $("[data-toggle-cat]", b).setAttribute("aria-expanded", abrir);
  }
  function irPara(catId) {
    abrirCat(catId, true);
    const alvo = $(`#cat-${catId}`); if (!alvo) return;
    const topo = $("#topo").offsetHeight + $("#abas-wrap").offsetHeight + 8;
    window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY - topo, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  /* Marca a aba ativa e rola SÓ a barra de abas, na horizontal.
     (Antes usava scrollIntoView, que também mexia na rolagem da página:
     quando a barra de abas saía da tela, perto dos Combos, a página era
     puxada de volta para cima e parecia travar.) */
  let abaAtiva = null;
  function marcarAba(catId) {
    if (catId === abaAtiva) return;
    abaAtiva = catId;
    const barra = $("#abas");
    $$(".aba", barra).forEach((a) => {
      const on = a.dataset.irCat === catId;
      a.setAttribute("aria-selected", on);
      if (on) {
        const alvo = a.offsetLeft - (barra.clientWidth - a.offsetWidth) / 2;
        barra.scrollTo({ left: Math.max(0, alvo), behavior: "smooth" });
      }
    });
  }
  function scrollSpy() {
    const card = $("#cardapio").getBoundingClientRect();
    if (card.bottom < 0 || card.top > window.innerHeight) return; // fora do cardápio: não faz nada
    const topo = $("#topo").offsetHeight + $("#abas-wrap").offsetHeight + 40;
    let atual = null;
    for (const s of $$(".cat-bloco")) { if (s.hidden) continue; if (s.getBoundingClientRect().top <= topo) atual = s.dataset.cat; }
    if (atual) marcarAba(atual);
  }
  function buscar(q) {
    q = q.trim().toLowerCase();
    let total = 0;
    $$(".cat-bloco").forEach((b) => {
      let n = 0;
      $$(".item", b).forEach((it) => { const ok = !q || it.dataset.busca.includes(q); it.hidden = !ok; if (ok) n++; });
      b.hidden = n === 0; total += n;
      // com busca: abre as categorias com resultado; sem busca: volta ao que o cliente tinha aberto
      const ab = q ? n > 0 : abertas.has(b.dataset.cat);
      b.classList.toggle("aberto", ab);
      $("[data-toggle-cat]", b).setAttribute("aria-expanded", ab);
    });
    $("#busca-vazio").hidden = total > 0;
  }

  /* ------------------------------------------------------------------
     Modal de produto (adicionais, sabores, observação, quantidade)
     ------------------------------------------------------------------ */
  let atual = null; // { produto, escolhas: {grupoId: {itemId: qtd}}, qtd }
  function abrirProduto(id) {
    const p = prod(id); if (!p) return;
    atual = { produto: p, escolhas: {}, qtd: 1 };
    (p.opcoes || []).forEach((g) => { atual.escolhas[g.id] = {}; });
    const cat = CATS.find((c) => c.id === p.categoria);
    $("#mp-foto").innerHTML = cardFoto(p);
    $("#mp-cat").textContent = cat ? cat.nome : "";
    $("#mp-nome").textContent = p.nome;
    $("#mp-desc").textContent = p.descricao || "";
    $("#mp-obs").value = "";
    $("#mp-erro").textContent = "";
    $("#mp-opcoes").innerHTML = (p.opcoes || []).map((g) => {
      const regra = g.tipo === "unico" ? "Escolha 1" : g.tipo === "quantidade" ? (g.min === g.max ? `Escolha ${g.max}` : `Até ${g.max}`) : `Até ${g.max}`;
      return `<fieldset class="grupo" data-grupo="${g.id}">
        <legend><span>${esc(g.titulo)}</span><small>${regra}${g.obrigatorio ? " · obrigatório" : " · opcional"}</small><em class="cont" data-cont="${g.id}"></em></legend>
        ${g.itens.map((it) => {
          const preco = it.preco > 0 ? `<span class="op-preco">+ ${brl(it.preco)}</span>` : "";
          if (g.tipo === "unico") return `<label class="op"><input type="radio" name="g-${g.id}" value="${it.id}"><span class="op-nome">${esc(it.nome)}</span>${preco}<i class="radio"></i></label>`;
          return `<div class="op op-qtd" data-item="${it.id}"><span class="op-nome">${esc(it.nome)}</span>${preco}
            <span class="mini-qtd"><button type="button" data-op="-" aria-label="Tirar ${esc(it.nome)}">${icon("minus")}</button><output>0</output><button type="button" data-op="+" aria-label="Adicionar ${esc(it.nome)}">${icon("plus")}</button></span></div>`;
        }).join("")}
      </fieldset>`;
    }).join("");
    atualizarModal();
    const dlg = $("#modal-produto");
    if (!dlg.open) dlg.showModal();
    dlg.querySelector(".mp-corpo").scrollTop = 0;
  }
  const qtdGrupo = (gId) => Object.values(atual.escolhas[gId] || {}).reduce((s, v) => s + v, 0);
  function precoAtual() {
    let v = precoBase(atual.produto);
    for (const g of atual.produto.opcoes || []) for (const it of g.itens) v += (atual.escolhas[g.id][it.id] || 0) * it.preco;
    return v;
  }
  function validar() {
    for (const g of atual.produto.opcoes || []) {
      const n = qtdGrupo(g.id);
      if (g.tipo === "unico" && g.obrigatorio && n !== 1) return `Escolha uma opção em “${g.titulo}”.`;
      if (g.tipo === "quantidade" && g.obrigatorio && n < (g.min || 1)) return g.min === g.max ? `Escolha ${g.min} em “${g.titulo}” (faltam ${g.min - n}).` : `Escolha pelo menos ${g.min || 1} em “${g.titulo}”.`;
    }
    return "";
  }
  function atualizarModal() {
    for (const g of atual.produto.opcoes || []) {
      const n = qtdGrupo(g.id), cheio = n >= g.max;
      const cont = $(`[data-cont="${g.id}"]`);
      if (cont) cont.textContent = g.tipo === "unico" ? "" : `${n}/${g.max}`;
      $$(`[data-grupo="${g.id}"] .op-qtd`).forEach((el) => {
        const q = atual.escolhas[g.id][el.dataset.item] || 0;
        el.querySelector("output").textContent = q;
        el.classList.toggle("sel", q > 0);
        el.querySelector('[data-op="+"]').disabled = cheio;
        el.querySelector('[data-op="-"]').disabled = q === 0;
      });
    }
    $("#mp-qtd").textContent = atual.qtd;
    $("#mp-menos").disabled = atual.qtd <= 1;
    const total = precoAtual() * atual.qtd;
    const falta = validar();
    $("#mp-add").innerHTML = `${icon("bag")}<span>Adicionar</span><b>${brl(total)}</b>`;
    $("#mp-add").classList.toggle("incompleto", !!falta);
  }
  function confirmarProduto(ev) {
    ev.preventDefault();
    const falta = validar();
    if (falta) { $("#mp-erro").textContent = falta; return; }
    const extras = [];
    for (const g of atual.produto.opcoes || []) for (const it of g.itens) {
      const q = atual.escolhas[g.id][it.id] || 0;
      if (q > 0) extras.push({ grupo: g.titulo, nome: it.nome, preco: it.preco, qtd: q });
    }
    adicionar({ produtoId: atual.produto.id, qtd: atual.qtd, extras, obs: $("#mp-obs").value.trim() });
    $("#modal-produto").close();
    avisar(`${atual.produto.nome} foi para a sacola`);
  }

  /* ------------------------------------------------------------------
     Sacola: painel lateral + barra do celular
     ------------------------------------------------------------------ */
  const descLinha = (l) => {
    const partes = l.extras.map((e) => `${e.qtd > 1 ? e.qtd + "× " : ""}${e.nome}${e.preco > 0 ? ` (+${brl(e.preco * e.qtd)})` : ""}`);
    return partes.join(", ");
  };
  function renderSacola() {
    const t = totais();
    const b = $("#sacola-qtd"); b.hidden = t.itens === 0; b.textContent = t.itens;
    $("#barra-mobile").hidden = t.itens === 0;
    $("#barra-qtd").textContent = `${t.itens} ${t.itens === 1 ? "item" : "itens"}`;
    $("#barra-total").textContent = brl(t.subtotal);

    if (!sacola.length) {
      $("#sac-corpo").innerHTML = `<div class="sac-vazia">${icon("bag")}<p><b>Sua sacola está vazia</b>Escolha um lanche no cardápio para começar.</p><button type="button" class="btn btn-amarelo" data-fechar-sacola data-ir-cat="${CATS.find(catVisivel).id}">Ver cardápio</button></div>`;
      $("#sac-rodape").innerHTML = "";
      return;
    }
    $("#sac-corpo").innerHTML = sacola.map((l) => {
      const p = prod(l.produtoId);
      return `<article class="linha">
        <span class="linha-foto">${cardFoto(p)}</span>
        <div class="linha-txt">
          <b>${esc(p.nome)}</b>
          ${l.extras.length ? `<small>${esc(descLinha(l))}</small>` : ""}
          ${l.obs ? `<small class="obs">Obs.: ${esc(l.obs)}</small>` : ""}
          <span class="linha-unit">${brl(precoUnitario(l))} cada</span>
          <div class="linha-pe">
            <span class="qtd qtd-peq">
              <button type="button" data-qtd="-" data-uid="${l.uid}" aria-label="Diminuir ${esc(p.nome)}">${icon(l.qtd === 1 ? "trash" : "minus")}</button>
              <output>${l.qtd}</output>
              <button type="button" data-qtd="+" data-uid="${l.uid}" aria-label="Aumentar ${esc(p.nome)}">${icon("plus")}</button>
            </span>
            <b class="linha-total">${brl(subtotalLinha(l))}</b>
          </div>
        </div>
        <button type="button" class="linha-rem" data-rem="${l.uid}" aria-label="Remover ${esc(p.nome)}">${icon("x")}</button>
      </article>`;
    }).join("") + `<button type="button" class="mais-itens" data-fechar-sacola data-ir-cat="${CATS.find(catVisivel).id}">${icon("plus")}Adicionar mais itens</button>`;
    $("#sac-rodape").innerHTML = `<dl class="totais">${linhasTotais(t, "entrega")}</dl>
      <button type="button" class="btn btn-amarelo btn-largo" id="ir-checkout">Finalizar pedido<b>${brl(t.total)}</b></button>
      <button type="button" class="limpar" id="limpar">Esvaziar sacola</button>`;
  }
  function linhasTotais(t, tipo) {
    const minimo = L.entrega.pedidoMinimo;
    let taxa;
    if (tipo === "retirada") taxa = `<dd>Grátis (retirada)</dd>`;
    else if (typeof t.taxa === "number") taxa = `<dd>${brl(t.taxa)}</dd>`;
    else taxa = `<dd class="combinar">A combinar</dd>`;
    return `<div><dt>Subtotal</dt><dd>${brl(t.subtotal)}</dd></div>
      ${t.economia > 0 ? `<div class="eco-linha"><dt>Economia nos combos</dt><dd>${brl(t.economia)}</dd></div>` : ""}
      <div><dt>Taxa de entrega</dt>${taxa}</div>
      ${minimo && t.subtotal < minimo ? `<div class="alerta"><dt>Pedido mínimo</dt><dd>${brl(minimo)}</dd></div>` : ""}
      <div class="total"><dt>Total${tipo !== "retirada" && typeof t.taxa !== "number" ? " <small>+ entrega</small>" : ""}</dt><dd>${brl(t.total)}</dd></div>`;
  }
  let ultimoFoco = null;
  function abrirSacola() {
    ultimoFoco = document.activeElement;
    $("#aviso").classList.remove("on");
    $("#sacola").classList.add("aberta"); $("#sacola").setAttribute("aria-hidden", "false");
    $("#sacola-fundo").hidden = false; document.body.classList.add("travado");
    setTimeout(() => $("#fechar-sacola").focus(), 50);
  }
  function fecharSacola() {
    $("#sacola").classList.remove("aberta"); $("#sacola").setAttribute("aria-hidden", "true");
    $("#sacola-fundo").hidden = true; document.body.classList.remove("travado");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  function pulsarSacola() { const b = $("#abrir-sacola"); b.classList.remove("pulsa"); void b.offsetWidth; b.classList.add("pulsa"); }

  /* ------------------------------------------------------------------
     Finalização
     ------------------------------------------------------------------ */
  const form = () => $("#ck-form");
  let tipoRecebimento = L.entrega.ativa ? "entrega" : "retirada";
  let formaPag = null;
  function abrirCheckout() {
    if (!sacola.length) return;
    const t = totais();
    if (L.entrega.pedidoMinimo && t.subtotal < L.entrega.pedidoMinimo) { avisar(`Pedido mínimo de ${brl(L.entrega.pedidoMinimo)}`); return; }
    fecharSacola();
    // rascunho salvo dos dados do cliente
    try { const r = JSON.parse(localStorage.getItem("veneza-cliente-v1") || "{}"); for (const [k, v] of Object.entries(r)) if (form().elements[k] && !form().elements[k].value) form().elements[k].value = v; } catch {}
    const opcoes = [];
    if (L.entrega.ativa) opcoes.push({ id: "entrega", ic: "moto", t: "Entrega", d: L.tempoEntrega });
    if (L.entrega.retirada) opcoes.push({ id: "retirada", ic: "store", t: "Retirar no local", d: `${L.endereco.linha}, ${L.endereco.bairro}` });
    $("#ck-tipo").innerHTML = opcoes.map((o) => `<label class="escolha"><input type="radio" name="tipo" value="${o.id}" ${o.id === tipoRecebimento ? "checked" : ""}>${icon(o.ic)}<span><b>${esc(o.t)}</b><small>${esc(o.d)}</small></span></label>`).join("");
    $("#ck-pag").innerHTML = L.pagamentos.map((p) => `<label class="escolha"><input type="radio" name="pagamento" value="${p.id}" ${p.id === formaPag ? "checked" : ""}>${icon(p.icone)}<span><b>${esc(p.nome)}</b></span></label>`).join("");
    $("#ck-pag-nota").textContent = window.Pagamento && window.Pagamento.online() ? "Pague online ou na entrega." : "Pagamento na entrega ou na retirada.";
    $("#ck-erro").textContent = "";
    atualizarCheckout();
    $("#checkout").showModal();
  }
  function atualizarCheckout() {
    const f = form();
    tipoRecebimento = (f.elements.tipo && f.elements.tipo.value) || tipoRecebimento;
    formaPag = (f.elements.pagamento && f.elements.pagamento.value) || null;
    const entrega = tipoRecebimento === "entrega";
    $("#ck-endereco").hidden = !entrega;
    ["rua", "numero", "bairro"].forEach((n) => { f.elements[n].required = entrega; });
    const pag = L.pagamentos.find((p) => p.id === formaPag);
    $("#ck-troco").hidden = !(pag && pag.pedeTroco);
    const t = totais(tipoRecebimento, f.elements.bairro.value);
    $("#ck-itens").innerHTML = sacola.map((l) => { const p = prod(l.produtoId); return `<div class="ck-item"><span>${l.qtd}× ${esc(p.nome)}${l.extras.length ? `<small>${esc(descLinha(l))}</small>` : ""}${l.obs ? `<small>Obs.: ${esc(l.obs)}</small>` : ""}</span><b>${brl(subtotalLinha(l))}</b></div>`; }).join("");
    $("#ck-totais").innerHTML = linhasTotais(t, tipoRecebimento);
  }
  const soDigitos = (s) => String(s || "").replace(/\D/g, "");
  function mascaraFone(v) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  function montarPedido() {
    const f = form().elements, t = totais(tipoRecebimento, f.bairro.value);
    return {
      criadoEm: new Date().toISOString(),
      cliente: { nome: f.nome.value.trim(), telefone: f.telefone.value.trim() },
      recebimento: tipoRecebimento,
      endereco: tipoRecebimento === "entrega" ? { rua: f.rua.value.trim(), numero: f.numero.value.trim(), bairro: f.bairro.value.trim(), complemento: f.complemento.value.trim(), referencia: f.referencia.value.trim() } : null,
      itens: sacola.map((l) => ({ produtoId: l.produtoId, nome: prod(l.produtoId).nome, qtd: l.qtd, precoUnitario: precoUnitario(l), extras: l.extras, obs: l.obs, subtotal: subtotalLinha(l) })),
      pagamento: { forma: formaPag, nome: (L.pagamentos.find((p) => p.id === formaPag) || {}).nome, troco: f.troco.value.trim() || null },
      observacoes: f.obs.value.trim(),
      valores: { subtotal: t.subtotal, economiaCombos: t.economia, taxaEntrega: tipoRecebimento === "retirada" ? 0 : t.taxa, total: t.total }
    };
  }
  function mensagemWhatsApp(p) {
    const L_ = [];
    L_.push(`*Novo pedido pelo site · ${L.nome}*`, "");
    p.itens.forEach((i) => {
      L_.push(`*${i.qtd}× ${i.nome}* · ${brl(i.subtotal)}`);
      i.extras.forEach((e) => L_.push(`   + ${e.qtd > 1 ? e.qtd + "× " : ""}${e.nome}${e.preco > 0 ? ` (${brl(e.preco * e.qtd)})` : ""}`));
      if (i.obs) L_.push(`   Obs.: ${i.obs}`);
    });
    L_.push("", `Subtotal: ${brl(p.valores.subtotal)}`);
    if (p.recebimento === "entrega") L_.push(`Entrega: ${typeof p.valores.taxaEntrega === "number" ? brl(p.valores.taxaEntrega) : "a combinar"}`);
    L_.push(`*Total: ${brl(p.valores.total)}${p.recebimento === "entrega" && typeof p.valores.taxaEntrega !== "number" ? " + entrega" : ""}*`, "");
    L_.push(`*${p.recebimento === "entrega" ? "Entrega" : "Retirada no local"}*`);
    if (p.endereco) {
      const e = p.endereco;
      L_.push(`${e.rua}, ${e.numero}${e.complemento ? " - " + e.complemento : ""}`, `Bairro: ${e.bairro}`);
      if (e.referencia) L_.push(`Referência: ${e.referencia}`);
    }
    L_.push("", `*Pagamento:* ${p.pagamento.nome} (na ${p.recebimento === "entrega" ? "entrega" : "retirada"})`);
    if (p.pagamento.troco) L_.push(`Troco para: R$ ${p.pagamento.troco}`);
    L_.push("", `*Cliente:* ${p.cliente.nome}`, `Telefone: ${p.cliente.telefone}`);
    if (p.observacoes) L_.push("", `*Observações:* ${p.observacoes}`);
    return L_.join("\n");
  }
  async function enviarPedido(ev) {
    ev.preventDefault();
    const f = form();
    $$(".campo", f).forEach((c) => c.classList.remove("erro"));
    const erros = [];
    const req = ["nome", "telefone"].concat(tipoRecebimento === "entrega" ? ["rua", "numero", "bairro"] : []);
    req.forEach((n) => { if (!f.elements[n].value.trim()) { erros.push(n); f.elements[n].closest(".campo").classList.add("erro"); } });
    if (soDigitos(f.elements.telefone.value).length < 10) { if (!erros.includes("telefone")) erros.push("telefone"); f.elements.telefone.closest(".campo").classList.add("erro"); }
    if (!formaPag) erros.push("pagamento");
    if (erros.length) {
      $("#ck-erro").textContent = erros.includes("pagamento") && erros.length === 1 ? "Escolha a forma de pagamento." : "Preencha os campos destacados" + (erros.includes("pagamento") ? " e escolha a forma de pagamento." : ".");
      const primeiro = f.querySelector(".campo.erro input"); if (primeiro) primeiro.focus();
      return;
    }
    $("#ck-erro").textContent = "";
    try { localStorage.setItem("veneza-cliente-v1", JSON.stringify(Object.fromEntries(["nome", "telefone", "rua", "numero", "bairro", "complemento", "referencia"].map((k) => [k, f.elements[k].value])))); } catch {}
    const pedido = montarPedido();
    const pg = await window.Pagamento.processar(pedido); // hoje: sempre "pagar na entrega"
    pedido.pagamento.status = pg.status;
    const url = waLink(mensagemWhatsApp(pedido));
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
    $("#ck-erro").innerHTML = `<span class="ok">${icon("check")}Abrimos o WhatsApp com o seu pedido. Se não abriu, <a href="${esc(url)}" target="_blank" rel="noopener">toque aqui</a>. Depois que a casa confirmar, você pode esvaziar a sacola.</span>`;
  }

  /* ------------------------------------------------------------------
     Aviso rápido (toast)
     ------------------------------------------------------------------ */
  let avisoT;
  function avisar(t) {
    const a = $("#aviso"); a.innerHTML = `${icon("check")}${esc(t)}<button type="button" data-abrir-sacola>Ver sacola</button>`;
    a.classList.add("on"); clearTimeout(avisoT); avisoT = setTimeout(() => a.classList.remove("on"), 3200);
  }

  /* ------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------ */
  function ligarEventos() {
    document.addEventListener("click", (e) => {
      const ab = e.target.closest("[data-abrir]"); if (ab) { abrirProduto(ab.dataset.abrir); return; }
      const tg = e.target.closest("[data-toggle-cat]");
      if (tg) { const id = tg.dataset.toggleCat, b = $(`#cat-${id}`); abrirCat(id, !b.classList.contains("aberto")); marcarAba(id); return; }
      const ir = e.target.closest("[data-ir-cat]");
      if (ir) {
        e.preventDefault();
        if (ir.hasAttribute("data-fechar-sacola")) fecharSacola();
        $("#busca").value = ""; buscar("");
        irPara(ir.dataset.irCat); marcarAba(ir.dataset.irCat); return;
      }
      if (e.target.closest("[data-abrir-sacola]")) { $("#aviso").classList.remove("on"); abrirSacola(); return; }
      const q = e.target.closest("[data-qtd]"); if (q) { mudarQtd(q.dataset.uid, q.dataset.qtd === "+" ? 1 : -1); return; }
      const r = e.target.closest("[data-rem]"); if (r) { remover(r.dataset.rem); return; }
      if (e.target.closest("#ir-checkout")) { abrirCheckout(); return; }
      if (e.target.closest("#limpar")) { if (sacola.length) { sacola = []; salvar(); renderSacola(); } return; }
      const fe = e.target.closest("[data-fechar]"); if (fe) { fe.closest("dialog").close(); return; }
    });
    $("#abrir-sacola").addEventListener("click", abrirSacola);
    $("#barra-abrir").addEventListener("click", abrirSacola);
    $("#fechar-sacola").addEventListener("click", fecharSacola);
    $("#sacola-fundo").addEventListener("click", fecharSacola);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#sacola").classList.contains("aberta")) fecharSacola(); });

    // modal de produto
    $("#mp-opcoes").addEventListener("click", (e) => {
      const b = e.target.closest("[data-op]"); if (!b) return;
      const g = b.closest("[data-grupo]").dataset.grupo, it = b.closest("[data-item]").dataset.item;
      const grupo = atual.produto.opcoes.find((x) => x.id === g);
      const q = atual.escolhas[g][it] || 0;
      if (b.dataset.op === "+" && qtdGrupo(g) < grupo.max) atual.escolhas[g][it] = q + 1;
      if (b.dataset.op === "-" && q > 0) atual.escolhas[g][it] = q - 1;
      $("#mp-erro").textContent = ""; atualizarModal();
    });
    $("#mp-opcoes").addEventListener("change", (e) => {
      if (e.target.type !== "radio") return;
      const g = e.target.name.slice(2); atual.escolhas[g] = { [e.target.value]: 1 };
      $("#mp-erro").textContent = ""; atualizarModal();
    });
    $("#mp-menos").addEventListener("click", () => { if (atual.qtd > 1) { atual.qtd--; atualizarModal(); } });
    $("#mp-mais").addEventListener("click", () => { if (atual.qtd < 50) { atual.qtd++; atualizarModal(); } });
    $("#mp-form").addEventListener("submit", confirmarProduto);
    $$("dialog").forEach((d) => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));

    // checkout
    form().addEventListener("change", atualizarCheckout);
    form().elements.bairro.addEventListener("input", atualizarCheckout);
    form().elements.telefone.addEventListener("input", (e) => { e.target.value = mascaraFone(e.target.value); });
    form().addEventListener("submit", enviarPedido);
    form().addEventListener("input", (e) => { const c = e.target.closest(".campo"); if (c) c.classList.remove("erro"); });

    // busca e abas
    $("#busca").addEventListener("input", (e) => buscar(e.target.value));
    let raf;
    window.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scrollSpy();
        $("#topo").classList.toggle("rolou", window.scrollY > 20);
      });
    }, { passive: true });

    // sacola sincronizada entre abas do navegador
    window.addEventListener("storage", (e) => { if (e.key === CHAVE) { try { sacola = (JSON.parse(e.newValue) || []).filter((l) => prod(l.produtoId)); } catch { sacola = []; } renderSacola(); } });

    // atualiza "aberto agora" a cada minuto
    setInterval(() => { const st = statusLoja(), s = $("#status-topo"); s.classList.toggle("aberto", st.aberto); s.lastElementChild.textContent = st.txt; }, 60000);

    // animação de entrada
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("vis"); io.unobserve(en.target); } }), { rootMargin: "0px 0px 120px 0px" });
      $$(".cab, .cat, .dest, .canal, .aval, .espaco-foto").forEach((el) => { el.classList.add("rev"); io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
     Início
     ------------------------------------------------------------------ */
  renderInfo();
  renderCategorias();
  renderDestaques();
  renderPromocoes();
  renderCardapio();
  renderCombos();
  renderSacola();
  ligarEventos();

  // API mínima para testes e futuras integrações (painel, gestão de pedidos)
  window.VenezaApp = { totais: () => totais(), sacola: () => JSON.parse(JSON.stringify(sacola)), comboInfo: (id) => comboInfo(prod(id)), montarPedido, mensagemWhatsApp };
})();
