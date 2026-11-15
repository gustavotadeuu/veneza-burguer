/* =====================================================================
   PAGAMENTO · ESTRUTURA PARA INTEGRAÇÃO FUTURA
   ---------------------------------------------------------------------
   Nesta etapa NÃO existe pagamento online. O cliente escolhe a forma de
   pagamento (Pix, dinheiro, débito ou crédito) e paga na entrega ou na
   retirada, como a casa já trabalha hoje. O site nunca mostra
   "pagamento aprovado".

   Para integrar um provedor brasileiro (Mercado Pago, Pagar.me, Asaas,
   PagSeguro, Stripe Brasil etc.) na segunda etapa:

   1. Crie uma função no servidor (ex.: /api/pagamentos na Vercel) que
      recebe o pedido, RECALCULA os valores a partir do cardápio no
      servidor e cria a cobrança no provedor. A chave secreta do
      provedor fica só em variável de ambiente do servidor, nunca aqui.
   2. Troque `provedor` abaixo por um objeto com o método
      `iniciar(pedido)` que chama essa função e devolve a URL ou o
      QR Code do Pix.
   3. Confirme o pagamento pelo webhook do provedor (no servidor), não
      pelo navegador.
   ===================================================================== */

window.Pagamento = {
  provedor: null, // ex.: { nome: "Mercado Pago", iniciar: async (pedido) => ({ url: "..." }) }

  online() {
    return Boolean(this.provedor && typeof this.provedor.iniciar === "function");
  },

  /* Hoje: devolve sempre "na entrega", sem cobrança. */
  async processar(pedido) {
    if (!this.online()) {
      return { status: "pagar-na-entrega", forma: pedido.pagamento.forma };
    }
    return this.provedor.iniciar(pedido); // segunda etapa
  }
};
