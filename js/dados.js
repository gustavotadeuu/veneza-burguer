/* =====================================================================
   VENEZA BURGUER · DADOS DO SITE
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo que precisa ser editado para mudar produtos,
   preços, combos, horários, contatos, taxa de entrega e promoções.

   Fontes usadas (conferidas em 13/11/2026):
   - Cardápio digital oficial: https://www.ecta.com.br/Venezaburguer
   - Instagram: https://www.instagram.com/venezaburguer_vb
   - Linktree: https://linktr.ee/venezaburguer
   - Google Maps (endereço, nota e avaliações)

   Regra: nada aqui é inventado. Campo sem informação fica como null
   ou lista vazia, e o site esconde ou mostra "a combinar".
   ===================================================================== */

window.LOJA = {
  nome: "Veneza Burguer",
  slogan: "Sabor venezuelano no Brasil!",            // texto do logotipo
  descricaoCurta: "Hambúrguer artesanal e espetinhos", // bio do Instagram
  chamada: "Sabor de verdade, feito na hora",          // bio do Instagram

  whatsapp: "5535997724763",            // só números, com 55 + DDD
  telefoneExibicao: "(35) 99772-4763",
  instagram: "venezaburguer_vb",

  endereco: {
    linha: "Praça Tupis, 15",
    bairro: "Vila Togni",
    cidade: "Poços de Caldas",
    uf: "MG",
    cep: "37704-346",
    latitude: -21.7846155,
    longitude: -46.6040726,
    mapsUrl: "https://www.google.com/maps/place/Veneza+Burguer/@-21.7846155,-46.6040726,17z/data=!4m6!3m5!1s0x94c9db480bc45771:0x7b725a7364dc98!8m2!3d-21.7846155!4d-46.6040726"
  },

  /* Horário publicado no Instagram: "Seg a sáb • 18h às 23h".
     dia: 0 = domingo ... 6 = sábado. Para fechar um dia, use null. */
  horarios: [
    null,                               // domingo
    { abre: "18:00", fecha: "23:00" },  // segunda
    { abre: "18:00", fecha: "23:00" },  // terça
    { abre: "18:00", fecha: "23:00" },  // quarta
    { abre: "18:00", fecha: "23:00" },  // quinta
    { abre: "18:00", fecha: "23:00" },  // sexta
    { abre: "18:00", fecha: "23:00" }   // sábado
  ],
  fusoHorario: -3, // horário de Brasília

  tempoEntrega: "25 a 55 min",          // cardápio digital oficial

  entrega: {
    ativa: true,                        // "Delivery ou Retirada" (cardápio da casa)
    retirada: true,
    /* Taxa de entrega: não foi publicada. Deixe null para mostrar
       "a combinar pelo WhatsApp". Exemplo de valor fixo: 5
       Exemplo por bairro: { "Vila Togni": 4, "Centro": 7 } */
    taxa: null,
    pedidoMinimo: null
  },

  /* Formas de pagamento do cardápio digital oficial ("Pagamento na entrega").
     A estrutura aceita pagamento online no futuro (ver js/pagamento.js). */
  pagamentos: [
    { id: "pix",      nome: "Pix",               icone: "pix" },
    { id: "dinheiro", nome: "Dinheiro",          icone: "cash",  pedeTroco: true },
    { id: "debito",   nome: "Cartão de débito",  icone: "card" },
    { id: "credito",  nome: "Cartão de crédito", icone: "card" }
  ],

  plataformas: [
    { nome: "Cardápio digital", url: "https://www.ecta.com.br/Venezaburguer" },
    { nome: "99Food",           url: "https://oia.99app.com/dlp9/JF2thy" }
    // iFood: o Instagram cita o iFood, mas o link não foi publicado.
    // Para exibir, acrescente: { nome: "iFood", url: "https://..." }
  ],

  google: {
    nota: "5,0",
    totalAvaliacoes: 150,
    faixaPreco: "R$ 20–40 por pessoa",
    url: "https://www.google.com/maps/place/Veneza+Burguer/@-21.7846155,-46.6040726,17z/data=!4m8!3m7!1s0x94c9db480bc45771:0x7b725a7364dc98!8m2!3d-21.7846155!4d-46.6040726!9m1!1b1"
  },

  /* Informações do perfil no Google ("Sobre"). */
  espaco: ["Mesas externas", "Refeição no local", "Bom para ir com crianças", "Cães permitidos na área externa"],

  /* Banner principal: textos e logotipo editáveis. */
  banner: {
    selo: "Hamburgueria · Vila Togni · Poços de Caldas",
    titulo: ["Hambúrguer artesanal", "com sabor", "venezuelano"], // a última linha fica amarela
    texto: "Lanche feito na hora, na chapa, e espetinho na brasa. De segunda a sábado, das 18h às 23h, na Praça Tupis, 15.",
    logo: "img/logo-veneza.png"
  },

  /* Promoções: só aparecem se houver alguma cadastrada.
     Exemplo: { titulo: "Terça do X-Tudo", texto: "...", validade: "Toda terça", produtoId: "x-tudo" } */
  promocoes: [],

  /* "Mais vendidos": a casa não divulgou ranking de vendas.
     Quando tiver, coloque os ids aqui (ex.: ["x-tudo","pepito-misto"]) e o
     título da seção muda para "Mais vendidos". Enquanto isso, a seção mostra
     os destaques abaixo, todos citados pelos próprios clientes ou pela casa. */
  maisVendidos: [],
  /* Destaques: os lanches com as fotos mais bonitas do cardápio.
     "motivo" é opcional e só deve ter informação verdadeira. */
  destaques: [
    { id: "caracas",       motivo: "" },
    { id: "pollo-burguer", motivo: "" },
    { id: "hamburguesa",   motivo: "" }
  ],

  /* Avaliações reais do Google Maps (5 estrelas), sem alteração.
     O site mostra as primeiras "avaliacoesNoSite". */
  avaliacoesNoSite: 3,
  avaliacoes: [
    { nome: "Tatiane Veronezi", quando: "há 2 semanas", texto: "Atendimento Maravilhoso, hambúrguer artesanal mais top de Poços de Caldas, parabéns Débora e esposo, pela qualidade. Nota 10, eu e minha família pedimos toda semana. Recomendo" },
    { nome: "José Luiz Silva Barros", quando: "há 1 semana", texto: "Pedi um lanche com meu pai, e estou extremamente satisfeito com tudo, veio em uma boa temperatura, qualidade excelente e muito saboroso, além do ótimo custo benefício." },
    { nome: "Roseli Melo", quando: "há 2 semanas", texto: "Lanche muito gostoso 😋, bem preparado e com ingredientes de qualidade. Ótima experiência, super recomendo!" },
    { nome: "Francismar Rodrigues", quando: "há 1 semana", texto: "Atendimento excelente,o lanche que comemos estava simplesmente top demais! Um lanche que estava completíssimo,muito saboroso,cheio de molho,sem miséria,quem for até lá comer ou pedir pra comer em casa,super indico o pepito misto,vale muito a pena!" },
    { nome: "Lidia Negrao", quando: "há 1 semana", texto: "Comida excelente, atendimento maravilhoso, eu e minha família adoramos e voltaremos sempre !" },
    { nome: "Aqui Tem loja", quando: "há 1 mês", texto: "Maravilhosa experiência! Lanche muito saboroso, carne e tempero fantástico. Percebe-se a alta qualidade dos produtos. O ambiente familiar super aconchegante. O serviço Delivery cuidadoso e rápido. Atendimento espetacular, Genuíno e acolhedor. Super recomendo! 5 estrelas é pouco!" },
    { nome: "Luiz Gustavo Martins", quando: "há 4 meses", texto: "O lanche simplesmente maravilhoso e muito gostoso, atendimento excelente e muito atenciosos com os clientes" },
    { nome: "Conceição Rodrigues e suas orquideas", quando: "há 2 meses", texto: "Tudo maravilhoso, começando pelo atendimento e terminando pelo sabor sem igual." }
  ]
};

/* =====================================================================
   CARDÁPIO
   - preco: em reais (número). null = "consulte".
   - imagem: caminho da foto. null = mostra um ícone no lugar.
   - opcoes: grupos de escolha (adicionais, sabores, acompanhamentos).
   ===================================================================== */

const ADICIONAIS_LANCHE = {
  id: "adicionais", titulo: "Adicionais", tipo: "multi", max: 10, obrigatorio: false,
  itens: [
    { id: "cheddar",       nome: "Cheddar",              preco: 5 },
    { id: "catupiry",      nome: "Catupiry",             preco: 5 },
    { id: "cream-cheese",  nome: "Cream cheese",         preco: 5 },
    { id: "queijo",        nome: "Fatia de queijo",      preco: 3 },
    { id: "presunto",      nome: "Fatias de presunto",   preco: 3 },
    { id: "ovo",           nome: "Ovo",                  preco: 4 },
    { id: "milho",         nome: "Milho",                preco: 3 },
    { id: "batata-palha",  nome: "Batata palha",         preco: 4 },
    { id: "hamb-trad",     nome: "Hambúrguer tradicional", preco: 6 },
    { id: "hamb-art",      nome: "Hambúrguer artesanal", preco: 8 },
    { id: "abacaxi",       nome: "Abacaxi",              preco: 5 },
    { id: "frango",        nome: "Frango",               preco: 8 },
    { id: "bacon",         nome: "Bacon",                preco: 5 }
  ]
};

/* vitrine: true = aparece com foto grande na seção "Da chapa e da brasa".
   As demais aparecem como botões simples, sem foto. */
window.CATEGORIAS = [
  { id: "tradicional", vitrine: true, nome: "Hambúrguer tradicional", curto: "Tradicionais", icone: "burger", imagem: "img/produtos/x-salada.jpg",
    texto: "Os clássicos da chapa: pão, hambúrguer, queijo e salada." },
  { id: "artesanal", vitrine: true, nome: "Hambúrguer artesanal", curto: "Artesanais", icone: "crown", imagem: "img/produtos/caracas.jpg",
    texto: "Hambúrguer artesanal com maionese da casa e o Pepito venezuelano." },
  { id: "hotdog", nome: "Hot dogs", curto: "Hot dogs", icone: "hotdog", imagem: null,
    texto: "Espaço pronto para os hot dogs. Ainda não há hot dogs no cardápio oficial." },
  { id: "espetinhos", vitrine: true, nome: "Espetinhos", curto: "Espetinhos", icone: "skewer", imagem: "img/produtos/espetinhos.jpg",
    texto: "Na brasa, escolha os sabores." },
  { id: "jantinha", nome: "Jantinha", curto: "Jantinha", icone: "plate", imagem: "img/produtos/jantinha.jpg",
    texto: "Prato com 2 espetos, arroz, farofa e vinagrete ou maionese." },
  { id: "combos", nome: "Combos", curto: "Combos", icone: "star", imagem: "img/produtos/combo-familia.jpg", destaque: true,
    texto: "Lanche, fritas e refri 2 L com preço fechado." },
  { id: "porcoes", vitrine: true, nome: "Porções", curto: "Porções", icone: "fries", imagem: "img/produtos/batata-cheddar-bacon-200.jpg",
    texto: "Batata frita simples ou com cheddar e bacon." },
  { id: "bebidas", nome: "Refrigerantes", curto: "Bebidas", icone: "drink", imagem: "img/produtos/coca-2l.jpg",
    texto: "Lata, caçulinha e 2 litros." }
];

window.PRODUTOS = [
  /* ---------- Hambúrguer tradicional ---------- */
  { id: "x-salada", categoria: "tradicional", nome: "X-Salada", preco: 20, imagem: "img/produtos/x-salada.jpg",
    descricao: "Pão, hambúrguer, queijo, alface, tomate, cebola roxa, maionese e ketchup.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "x-egg", categoria: "tradicional", nome: "X-Egg", preco: 22, imagem: "img/produtos/x-egg.jpg",
    descricao: "Pão, hambúrguer, queijo, ovo, alface, tomate, cebola roxa, maionese e ketchup.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "x-bacon", categoria: "tradicional", nome: "X-Bacon", preco: 25, imagem: "img/produtos/x-bacon.jpg",
    descricao: "Pão, hambúrguer, queijo, bacon, alface, tomate, cebola roxa, maionese e ketchup.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "x-tudo", categoria: "tradicional", nome: "X-Tudo", preco: 30, imagem: "img/produtos/x-tudo.jpg",
    descricao: "Pão, hambúrguer, queijo, ovo, bacon, presunto, milho, batata palha, alface, tomate, cebola roxa, maionese e ketchup.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "x-tudo-duplo", categoria: "tradicional", nome: "X-Tudo Duplo", preco: 40, imagem: "img/produtos/x-tudo-duplo.jpg",
    descricao: "Pão, 2 hambúrgueres, 2 queijos, 2 ovos, bacon, 2 presuntos, milho, batata palha, alface, tomate, cebola roxa, maionese e ketchup.", opcoes: [ADICIONAIS_LANCHE] },

  /* ---------- Hambúrguer artesanal ---------- */
  { id: "veneza-burguer", categoria: "artesanal", nome: "Veneza Burguer", preco: 30, imagem: "img/produtos/veneza-burguer.jpg", selo: "Da casa",
    descricao: "Pão, maionese da casa, hambúrguer artesanal, cheddar, queijo, bacon e batata palha.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "tropical", categoria: "artesanal", nome: "Tropical", preco: 30, imagem: "img/produtos/tropical.jpg",
    descricao: "Pão, maionese da casa, hambúrguer artesanal, queijo, abacaxi grelhado e bacon.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "barcelona", categoria: "artesanal", nome: "Barcelona", preco: 30, imagem: "img/produtos/barcelona.jpg",
    descricao: "Pão, maionese da casa, hambúrguer artesanal recheado com cheddar, cebola caramelizada e bacon.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "pollo-burguer", categoria: "artesanal", nome: "Pollo Burguer", preco: 30, imagem: "img/produtos/pollo-burguer.jpg",
    descricao: "Pão, maionese da casa, filé de frango grelhado, queijo, cream cheese, milho, alface, tomate e cebola roxa.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "caracas", categoria: "artesanal", nome: "Caracas", preco: 30, imagem: "img/produtos/caracas.jpg",
    descricao: "Pão, maionese da casa, hambúrguer artesanal, queijo, bacon, anel de cebola, pimentão e barbecue.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "duplo-burguer", categoria: "artesanal", nome: "Duplo Burguer", preco: 40, imagem: "img/produtos/duplo-burguer.jpg",
    descricao: "Pão, maionese da casa, 2 hambúrgueres artesanais, 2 queijos, cream cheese e cebola caramelizada.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "hamburguesa", categoria: "artesanal", nome: "Hamburguesa", preco: 40, imagem: "img/produtos/hamburguesa.jpg",
    descricao: "Pão, maionese da casa, hambúrguer artesanal 160 g, queijo, frango grelhado, mostarda, bacon, presunto, ovo, milho, batata palha, alface e tomate.", opcoes: [ADICIONAIS_LANCHE] },
  { id: "pepito-misto", categoria: "artesanal", nome: "Pepito Misto 25 cm", preco: 40, imagem: "img/produtos/pepito-misto.jpg", selo: "Venezuelano",
    descricao: "Pão baguete 25 cm, molhos, salada (alface, tomate e cebola roxa), milho, carne bovina, frango e bacon, queijo prato e batata palha.", opcoes: [ADICIONAIS_LANCHE] },

  /* ---------- Hot dogs ----------
     O cardápio oficial não tem hot dogs. Para cadastrar, copie o modelo:
  { id: "hot-dog-simples", categoria: "hotdog", nome: "Nome do hot dog", preco: 0, imagem: "img/produtos/arquivo.jpg",
    descricao: "Ingredientes", opcoes: [] },
  */

  /* ---------- Espetinhos (preço por sabor) ---------- */
  { id: "espetinhos", categoria: "espetinhos", nome: "Espetinhos na brasa", preco: 0, imagem: "img/produtos/espetinhos.jpg", precoAPartir: 8,
    descricao: "Escolha os sabores e a quantidade de cada um (até 10 espetinhos por vez).",
    opcoes: [{
      id: "sabores", titulo: "Sabores", tipo: "quantidade", min: 1, max: 10, obrigatorio: true,
      itens: [
        { id: "frango",        nome: "Frango",          preco: 8 },
        { id: "queijo-coalho", nome: "Queijo coalho",   preco: 8 },
        { id: "pernil",        nome: "Pernil",          preco: 10 },
        { id: "coracao",       nome: "Coração",         preco: 10 },
        { id: "queijo-nozinho",nome: "Queijo nozinho",  preco: 10 },
        { id: "carne-bovina",  nome: "Carne bovina",    preco: 10 },
        { id: "medalhao",      nome: "Medalhão",        preco: 10 }
      ]
    }] },

  /* ---------- Jantinha ---------- */
  { id: "jantinha", categoria: "jantinha", nome: "Jantinha", preco: 25, imagem: "img/produtos/jantinha.jpg",
    descricao: "Selecione 2 espetos. Acompanha arroz, vinagrete ou maionese e farofa.",
    opcoes: [
      { id: "espetos", titulo: "Escolha 2 espetos", tipo: "quantidade", min: 2, max: 2, obrigatorio: true,
        itens: [
          { id: "frango", nome: "Frango", preco: 0 }, { id: "queijo-coalho", nome: "Queijo coalho", preco: 0 },
          { id: "pernil", nome: "Pernil", preco: 0 }, { id: "coracao", nome: "Coração", preco: 0 },
          { id: "carne-bovina", nome: "Carne bovina", preco: 0 }, { id: "medalhao", nome: "Medalhão", preco: 0 }
        ] },
      { id: "acompanhamento", titulo: "Acompanhamento", tipo: "unico", obrigatorio: true,
        itens: [ { id: "vinagrete", nome: "Vinagrete", preco: 0 }, { id: "maionese", nome: "Maionese", preco: 0 } ] },
      { id: "espeto-extra", titulo: "Espeto adicional", tipo: "quantidade", min: 0, max: 10, obrigatorio: false,
        itens: [
          { id: "frango", nome: "Frango", preco: 7 }, { id: "queijo-coalho", nome: "Queijo coalho", preco: 7 },
          { id: "pernil", nome: "Pernil", preco: 8 }, { id: "coracao", nome: "Coração", preco: 8 },
          { id: "medalhao", nome: "Medalhão", preco: 10 }
        ] }
    ] },

  /* ---------- Combos ----------
     comparar: itens do cardápio que fazem parte do combo e têm preço avulso.
     O site soma esses itens e só mostra "economia" quando ela é real.
     Itens sem preço avulso definido (fritas do combo, refri 2 L sem marca)
     ficam em "extras" e não entram na conta. */
  { id: "combo-casal", categoria: "combos", nome: "Combo Casal", preco: 60, imagem: "img/produtos/combo-casal.jpg", selo: "Para 2",
    descricao: "1 X-Tudo + 1 X-Bacon + fritas + refri 2 L.",
    combo: { itens: ["1 X-Tudo", "1 X-Bacon", "Fritas", "Refri 2 L"], comparar: [["x-tudo", 1], ["x-bacon", 1]], extras: "fritas e refri 2 L" } },
  { id: "combo-familia", categoria: "combos", nome: "Combo Família", preco: 100, imagem: "img/produtos/combo-familia.jpg", selo: "Para a família",
    descricao: "2 X-Tudo + 1 X-Bacon + 1 X-Salada + 1 refrigerante 2 L.",
    combo: { itens: ["2 X-Tudo", "1 X-Bacon", "1 X-Salada", "Refri 2 L"], comparar: [["x-tudo", 2], ["x-bacon", 1], ["x-salada", 1]], extras: "refri 2 L" } },

  /* ---------- Porções ---------- */
  { id: "batata-simples", categoria: "porcoes", nome: "Batata frita simples 200 g", preco: 15, imagem: "img/produtos/batata-simples.jpg", descricao: "" },
  { id: "batata-cb-200", categoria: "porcoes", nome: "Batata frita com cheddar e bacon 200 g", preco: 20, imagem: "img/produtos/batata-cheddar-bacon-200.jpg", descricao: "" },
  { id: "batata-cb-400", categoria: "porcoes", nome: "Batata frita com cheddar e bacon 400 g", preco: 30, imagem: "img/produtos/batata-cheddar-bacon-400.jpg", descricao: "" },

  /* ---------- Refrigerantes ---------- */
  { id: "coca-lata",    categoria: "bebidas", nome: "Coca lata",    preco: 6,  imagem: "img/produtos/coca-lata.jpg",    descricao: "" },
  { id: "guarana-lata", categoria: "bebidas", nome: "Guaraná lata", preco: 6,  imagem: "img/produtos/guarana-lata.jpg", descricao: "" },
  { id: "pepsi-lata",   categoria: "bebidas", nome: "Pepsi lata",   preco: 6,  imagem: "img/produtos/pepsi-lata.jpg",   descricao: "" },
  { id: "caculinha",    categoria: "bebidas", nome: "Caçulinha",    preco: 4,  imagem: "img/produtos/caculinha.jpg",    descricao: "" },
  { id: "coca-2l",      categoria: "bebidas", nome: "Coca 2 L",     preco: 15, imagem: "img/produtos/coca-2l.jpg",      descricao: "" },
  { id: "gebel-2l",     categoria: "bebidas", nome: "Gebel 2 L",    preco: 10, imagem: "img/produtos/gebel-2l.jpg",     descricao: "" }
];
