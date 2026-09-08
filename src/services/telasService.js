import { supabase } from "./supabase"
import { telasData } from "../data/telas"

const TEMPO_SIMULADO_API = 350

function copiarDados(dados) {
  return JSON.parse(JSON.stringify(dados))
}

function aguardar(tempo = TEMPO_SIMULADO_API) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, tempo)
  })
}

export async function buscarTelas() {
  const { data, error } = await supabase
    .from("telas")
    .select("id,codigo,nome,local")

  if (error) {
    throw new Error(
      `Erro ao carregar telas: ${error.message}`
    )
  }

  return (data || []).map((tela) => ({
    id: tela.id,
    codigo: tela.codigo,
    nome: tela.nome || tela.codigo,
    local: tela.local || "",
    cidade: "",
    estado: "",
    cliente: "ConectaFácil",
    grupo: "Lanchas",
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

    ultimoContato: "Agora",
    ultimaAtualizacao: "--",
    proximaSincronizacao: "--",
    observacoes: "",
  }))
}

export async function buscarTelaPorId(telaId) {
  await aguardar(200)

  const tela = telasData.find(
    (item) => item.id === telaId
  )

  if (!tela) {
    throw new Error("Tela não encontrada.")
  }

  return copiarDados(tela)
}

export async function solicitarAtualizacaoTela(
  telaId
) {
  await aguardar(700)

  const tela = telasData.find(
    (item) => item.id === telaId
  )

  if (!tela) {
    throw new Error("Tela não encontrada.")
  }

  return {
    sucesso: true,
    mensagem: `Atualização enviada para ${tela.nome}.`,
  }
}

export async function solicitarReinicioTela(
  telaId
) {
  await aguardar(900)

  const tela = telasData.find(
    (item) => item.id === telaId
  )

  if (!tela) {
    throw new Error("Tela não encontrada.")
  }

  return {
    sucesso: true,
    mensagem: `Comando de reinício enviado para ${tela.nome}.`,
  }
}

export async function atualizarNomeTela(
  telaId,
  novoNome
) {
  const { data, error } = await supabase
    .from("telas")
    .update({
      nome: novoNome,
    })
    .eq("id", telaId)
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao atualizar nome da tela: ${error.message}`
    )
  }

  return data
}

export async function cadastrarTela({
  codigo,
  nome,
  local,
}) {
  const { data, error } = await supabase
    .from("telas")
    .insert([
      {
        codigo,
        nome,
        local,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao cadastrar tela: ${error.message}`
    )
  }

  return data
}