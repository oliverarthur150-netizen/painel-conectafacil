import { supabase } from "./supabase"

export async function listarAnunciosCloud() {
  const { data: anuncios, error: anunciosError } =
    await supabase
      .from("anuncios")
      .select("*")
      .order("criado_em", {
        ascending: false,
      })

  if (anunciosError) {
    throw new Error(
      `Erro ao carregar anúncios: ${anunciosError.message}`
    )
  }

  const { data: relacoes, error: relacoesError } =
    await supabase
      .from("anuncios_telas")
      .select(`
        anuncio_id,
        tela_id,
        telas (
          id,
          codigo,
          nome
        )
      `)

  if (relacoesError) {
    throw new Error(
      `Erro ao carregar vínculo das TVs: ${relacoesError.message}`
    )
  }

  return (anuncios || []).map((anuncio) => {
    const telasDoAnuncio = (relacoes || [])
      .filter(
        (relacao) =>
          relacao.anuncio_id === anuncio.id
      )
      .map((relacao) => relacao.telas)
      .filter(Boolean)

    return {
      ...anuncio,
      telas: telasDoAnuncio,
    }
  })
}

export async function listarTelasCloud() {
  const { data, error } = await supabase
    .from("telas")
    .select("id,codigo,nome")
    .order("nome", {
      ascending: true,
    })

  if (error) {
    throw new Error(
      `Erro ao carregar TVs: ${error.message}`
    )
  }

  return data || []
}

export async function alterarStatusAnuncioCloud(
  anuncioId,
  novoStatus
) {
  const { data, error } = await supabase
    .from("anuncios")
    .update({
      status: novoStatus,
    })
    .eq("id", anuncioId)
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao alterar status: ${error.message}`
    )
  }

  return data
}

export async function excluirAnuncioCloud(
  anuncioId
) {
  const {
    error: relacoesError,
  } = await supabase
    .from("anuncios_telas")
    .delete()
    .eq("anuncio_id", anuncioId)

  if (relacoesError) {
    throw new Error(
      `Erro ao remover vínculo com as TVs: ${relacoesError.message}`
    )
  }

  const { error } = await supabase
    .from("anuncios")
    .delete()
    .eq("id", anuncioId)

  if (error) {
    throw new Error(
      `Erro ao excluir anúncio: ${error.message}`
    )
  }

  return true
}