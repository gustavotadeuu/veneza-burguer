# Veneza Burguer · site com cardápio, sacola e pedido

Site estático (HTML, CSS e JavaScript puro), sem build. Funciona na Vercel, Netlify ou GitHub Pages.

## Estrutura

```
index.html          página
css/styles.css      visual (preto e amarelo)
js/dados.js         TUDO que se edita: produtos, preços, combos, horários, contatos, entrega, promoções
js/app.js           cardápio, sacola, finalização (não precisa editar)
js/pagamento.js     ponto de integração com pagamento online (segunda etapa)
img/                logotipo, fachada e fotos dos produtos
fonts/              Bebas Neue e Montserrat (licença OFL)
```

## Como editar

Tudo fica em `js/dados.js`:

- **Produto novo:** copie um item de `PRODUTOS`, troque `id`, `nome`, `preco`, `descricao` e `imagem` (coloque a foto em `img/produtos/`).
- **Hot dogs:** a categoria já existe e aparece sozinha quando houver algum produto com `categoria: "hotdog"`.
- **Combos:** em `combo.comparar` liste os itens do cardápio com preço avulso. O site só mostra "economia" quando ela é real.
- **Taxa de entrega:** `LOJA.entrega.taxa` → `null` (a combinar), um número (taxa fixa) ou `{ "Bairro": valor }`.
- **Promoções:** preencha `LOJA.promocoes`. A seção aparece sozinha.
- **Mais vendidos:** preencha `LOJA.maisVendidos` com os ids. Enquanto estiver vazio, a seção mostra os destaques.

## Como o pedido funciona hoje

1. O cliente monta a sacola (fica salva no navegador, mesmo se fechar a página).
2. Na finalização informa nome, telefone, entrega ou retirada, endereço, forma de pagamento e observações.
3. O site abre o WhatsApp da casa com o pedido completo. O pagamento é feito na entrega ou na retirada.

Nenhum pagamento é simulado.

## Segunda etapa: pagamento online

Veja `js/pagamento.js`. Resumo:

- Criar uma função no servidor (ex.: `api/pagamentos.js` na Vercel) que recalcula o pedido a partir do cardápio e cria a cobrança no provedor (Mercado Pago, Pagar.me, Asaas etc.).
- A chave secreta fica em variável de ambiente do servidor, nunca no navegador.
- A confirmação do pagamento vem pelo webhook do provedor.
- Para guardar pedidos e produtos em banco de dados, o objeto do pedido já é montado em `montarPedido()` (`js/app.js`), pronto para ser enviado a uma API.

## Fontes das informações

Cardápio, preços, adicionais e formas de pagamento: cardápio digital oficial (ecta.com.br/Venezaburguer). Horário e canais: Instagram @venezaburguer_vb e Linktree. Endereço, nota e avaliações: Google Maps. Conferido em 13/11/2026.
