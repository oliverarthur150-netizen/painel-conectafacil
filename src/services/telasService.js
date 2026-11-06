
import { supabase } from "./supabase";

function converterTela(tela) {
  if (!tela) return null;

  return {
    id: tela.id,
    codigo: tela.codigo,
    nome: tela.nome || tela.codigo,
    cliente: "ConectaFácil",
    grupo: "Lanchas",
    tipoLocal: "Embarcação",
    local: tela.local || "",
    cidade: "Lucena",
    estado: "PB",

    status: "online",
    internetStatus: "estavel",
    sincronizacao: "sincronizada",

    resolucao: "Full HD",
    orientacao: "Horizontal",
    tamanhoTela: "43 polegadas",

    ip: "--",
    mac: "--",
    versao: "ConectaPlayer",

    cpu: null,
    memoria: null,
    armazenamento: null,
    temperatura: null,

    internet: {
      provedor: "--",
      velocidade: "--",
      latencia: "--",
      intensidade: 0,
    },

    playlist: {
      id: "",
      nome: "Programação da tela",
      totalMidias: 0,
      duracao: "--",
      ultimaAtualizacao: "--",
    },

    ultimoContato: "--",
    ultimaAtualizacao: "--",
    proximaSincronizacao: "--",
    observacoes: "",
  };
}

export async function buscarTelas() {
  const { data, error } = await supabase
    .from("telas")
    .select("id,codigo,nome,local")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(
      `Erro ao carregar telas: ${error.message}`
    );
  }

  return (data || []).map(converterTela);
}

export async function buscarTelaPorId(telaId) {
  if (!telaId) {
    throw new Error("Identificador da tela não informado.");
  }

  const { data, error } = await supabase
    .from("telas")
    .select("id,codigo,nome,local")
    .eq("id", telaId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao buscar detalhes da tela: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Tela não encontrada no cadastro do Supabase."
    );
  }

  return converterTela(data);
}

export async function atualizarNomeTela(
  telaId,
  novoNome
) {
  const nome = novoNome?.trim();

  if (!nome) {
    throw new Error("Informe um nome válido para a tela.");
  }

  const { data, error } = await supabase
    .from("telas")
    .update({ nome })
    .eq("id", telaId)
    .select("id,codigo,nome,local")
    .single();

  if (error) {
    throw new Error(
      `Erro ao atualizar nome da tela: ${error.message}`
    );
  }

  return converterTela(data);
}

export async function solicitarAtualizacaoTela(telaId) {
  const tela = await buscarTelaPorId(telaId);

  throw new Error(
    `A TV ${tela.nome} foi localizada, mas o envio real de atualização ainda precisa ser conectado ao ConectaPlayer.`
  );
}

export async function solicitarReinicioTela(telaId) {
  const tela = await buscarTelaPorId(telaId);

  throw new Error(
    `A TV ${tela.nome} foi localizada, mas o comando real de reinício ainda precisa ser conectado ao ConectaPlayer.`
  );
}

export async function cadastrarTela({
  codigo,
  nome,
  local,
}) {
  const { data, error } = await supabase
    .from("telas")
    .insert({
      codigo,
      nome,
      local,
    })
    .select("id,codigo,nome,local")
    .single();

  if (error) {
    throw new Error(
      `Erro ao cadastrar tela: ${error.message}`
    );
  }

  return converterTela(data);
}
