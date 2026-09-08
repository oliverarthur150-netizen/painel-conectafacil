import { financeiroData } from "../data/financeiro";

const TEMPO_SIMULADO_API = 450;

function aguardar(tempo = TEMPO_SIMULADO_API) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, tempo);
  });
}

function copiarDados(dados) {
  return JSON.parse(JSON.stringify(dados));
}

export async function buscarFinanceiro() {
  await aguardar();

  return copiarDados(financeiroData);
}

export async function buscarCobrancaPorId(cobrancaId) {
  await aguardar(250);

  const cobranca = financeiroData.cobrancas.find(
    (item) => item.id === cobrancaId
  );

  if (!cobranca) {
    throw new Error("Cobrança não encontrada.");
  }

  return copiarDados(cobranca);
}

export async function registrarPagamento(cobrancaId, dadosPagamento = {}) {
  await aguardar(650);

  const cobranca = financeiroData.cobrancas.find(
    (item) => item.id === cobrancaId
  );

  if (!cobranca) {
    throw new Error("Cobrança não encontrada.");
  }

  return {
    sucesso: true,
    mensagem: "Pagamento registrado com sucesso.",
    cobranca: {
      ...copiarDados(cobranca),
      status: "pago",
      pagamento:
        dadosPagamento.pagamento ||
        new Date().toISOString().slice(0, 10),
      pagamentoFormatado:
        dadosPagamento.pagamentoFormatado ||
        new Intl.DateTimeFormat("pt-BR").format(new Date()),
      formaPagamento:
        dadosPagamento.formaPagamento ||
        cobranca.formaPagamento ||
        "PIX",
      diasAtraso: 0,
    },
  };
}

export async function criarCobranca(dadosCobranca) {
  await aguardar(700);

  return {
    sucesso: true,
    mensagem: "Cobrança criada com sucesso.",
    cobranca: {
      ...dadosCobranca,
      id: `cobranca-${Date.now()}`,
      codigo: `CF-REC-${Date.now().toString().slice(-6)}`,
      status: dadosCobranca.status || "pendente",
      diasAtraso: 0,
    },
  };
}