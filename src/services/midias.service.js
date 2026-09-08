import { supabase } from "./supabase"

function criarNomeSeguro(nomeOriginal) {
  const extensao = nomeOriginal.includes(".")
    ? nomeOriginal.split(".").pop()
    : "bin"

  const nomeBase = nomeOriginal
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()

  const identificador =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`

  return `${Date.now()}-${identificador}-${nomeBase}.${extensao}`
}

export async function obterTelaPorCodigo(
  codigo = "LANCHA-01"
) {
  const { data, error } = await supabase
    .from("telas")
    .select("*")
    .eq("codigo", codigo)
    .single()

  if (error) {
    throw new Error(
      `Erro ao localizar a tela ${codigo}: ${error.message}`
    )
  }

  return data
}

export async function enviarMidiaParaStorage(
  arquivo
) {
  if (!arquivo) {
    throw new Error("Nenhum arquivo foi selecionado.")
  }

  const nomeArquivo = criarNomeSeguro(
    arquivo.name
  )

  const caminho = `publicidade/${nomeArquivo}`

  const { error: uploadError } =
    await supabase.storage
      .from("midias")
      .upload(caminho, arquivo, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          arquivo.type ||
          "application/octet-stream",
      })

  if (uploadError) {
    throw new Error(
      `Erro no upload da mídia: ${uploadError.message}`
    )
  }

  const { data } = supabase.storage
    .from("midias")
    .getPublicUrl(caminho)

  if (!data?.publicUrl) {
    throw new Error(
      "Não foi possível gerar a URL pública da mídia."
    )
  }

  return {
    arquivoUrl: data.publicUrl,
    arquivoPath: caminho,
  }
}

export async function criarAnuncioCloud({
  titulo,
  cliente = "",
  tipoMidia,
  arquivoUrl,
  arquivoPath,
  duracaoSegundos = 10,
  valor = 0,
  dataInicio = null,
  dataTermino = null,
  status = "ativo",
  codigoTela = "LANCHA-01",
}) {
  const tela = await obterTelaPorCodigo(
    codigoTela
  )

  const { data: anuncio, error: anuncioError } =
    await supabase
      .from("anuncios")
      .insert({
        titulo,
        cliente,
        tipo_midia: tipoMidia,
        arquivo_url: arquivoUrl,
        arquivo_path: arquivoPath,
        duracao_segundos:
          Number(duracaoSegundos) || 10,
        valor: Number(valor) || 0,
        data_inicio: dataInicio || null,
        data_termino: dataTermino || null,
        status,
      })
      .select()
      .single()

  if (anuncioError) {
    throw new Error(
      `Erro ao salvar o anúncio: ${anuncioError.message}`
    )
  }

  const {
    error: relacaoError,
  } = await supabase
    .from("anuncios_telas")
    .insert({
      anuncio_id: anuncio.id,
      tela_id: tela.id,
    })

  if (relacaoError) {
    throw new Error(
      `O anúncio foi criado, mas não foi vinculado à TV: ${relacaoError.message}`
    )
  }

  return {
    anuncio,
    tela,
  }
}

export async function enviarAnuncioCompleto({
  arquivo,
  titulo,
  cliente = "",
  duracaoSegundos = 10,
  valor = 0,
  dataInicio = null,
  dataTermino = null,
  codigoTela = "LANCHA-01",
}) {
  if (!arquivo) {
    throw new Error(
      "Selecione uma imagem ou vídeo."
    )
  }

  if (!titulo?.trim()) {
    throw new Error(
      "Informe o título do anúncio."
    )
  }

  const ehVideo =
    arquivo.type?.startsWith("video/")

  const ehImagem =
    arquivo.type?.startsWith("image/")

  if (!ehImagem && !ehVideo) {
    throw new Error(
      "O arquivo precisa ser uma imagem ou vídeo."
    )
  }

  const {
    arquivoUrl,
    arquivoPath,
  } = await enviarMidiaParaStorage(arquivo)

  const resultado = await criarAnuncioCloud({
    titulo: titulo.trim(),
    cliente: cliente.trim(),
    tipoMidia: ehVideo
      ? "video"
      : "imagem",
    arquivoUrl,
    arquivoPath,
    duracaoSegundos,
    valor,
    dataInicio,
    dataTermino,
    status: "ativo",
    codigoTela,
  })

  return {
    ...resultado,
    arquivoUrl,
    arquivoPath,
  }
}
export async function atualizarAnuncioCompleto({
  anuncioId,
  arquivo = null,
  titulo,
  cliente = "",
  duracaoSegundos = 10,
  valor = 0,
  dataInicio = null,
  dataTermino = null,
  codigoTela = "LANCHA-01",
}) {
  if (!anuncioId) {
    throw new Error("Anúncio não informado.")
  }

  if (!titulo?.trim()) {
    throw new Error("Informe o título do anúncio.")
  }

  const dadosAtualizacao = {
    titulo: titulo.trim(),
    cliente: cliente.trim(),
    duracao_segundos:
      Number(duracaoSegundos) || 10,
    valor: Number(valor) || 0,
    data_inicio: dataInicio || null,
    data_termino: dataTermino || null,
  }

  // Se escolheu uma nova imagem/vídeo,
  // envia para o Storage e troca a mídia.
  if (arquivo) {
    const ehVideo =
      arquivo.type?.startsWith("video/")

    const ehImagem =
      arquivo.type?.startsWith("image/")

    if (!ehImagem && !ehVideo) {
      throw new Error(
        "O arquivo precisa ser uma imagem ou vídeo."
      )
    }

    const {
      arquivoUrl,
      arquivoPath,
    } = await enviarMidiaParaStorage(arquivo)

    dadosAtualizacao.arquivo_url =
      arquivoUrl

    dadosAtualizacao.arquivo_path =
      arquivoPath

    dadosAtualizacao.tipo_midia =
      ehVideo ? "video" : "imagem"
  }

  const { data: anuncio, error } =
    await supabase
      .from("anuncios")
      .update(dadosAtualizacao)
      .eq("id", anuncioId)
      .select()
      .single()

  if (error) {
    throw new Error(
      `Erro ao atualizar anúncio: ${error.message}`
    )
  }

  const tela =
    await obterTelaPorCodigo(codigoTela)

  const { error: excluirRelacaoError } =
    await supabase
      .from("anuncios_telas")
      .delete()
      .eq("anuncio_id", anuncioId)

  if (excluirRelacaoError) {
    throw new Error(
      `Erro ao atualizar TV do anúncio: ${excluirRelacaoError.message}`
    )
  }

  const { error: inserirRelacaoError } =
    await supabase
      .from("anuncios_telas")
      .insert({
        anuncio_id: anuncioId,
        tela_id: tela.id,
      })

  if (inserirRelacaoError) {
    throw new Error(
      `Erro ao vincular anúncio à TV: ${inserirRelacaoError.message}`
    )
  }

  return {
    anuncio,
    tela,
  }
}