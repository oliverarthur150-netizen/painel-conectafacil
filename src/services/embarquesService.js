import { supabase } from "./supabase"

export async function listarEmbarques() {
  const { data, error } = await supabase
    .from("embarques")
    .select("*")
    .order("horario", {
      ascending: true,
    })

  if (error) {
    throw new Error(
      `Erro ao carregar embarques: ${error.message}`
    )
  }

  return data || []
}

export async function criarEmbarque({
  telaCodigo = "LANCHA-01",
  origem,
  destino,
  horario,
  status = "No horário",
}) {
  const { data, error } = await supabase
    .from("embarques")
    .insert({
      tela_codigo: telaCodigo,
      origem,
      destino,
      horario,
      status,
      ativo: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao criar embarque: ${error.message}`
    )
  }

  return data
}

export async function excluirEmbarque(id) {
  const { error } = await supabase
    .from("embarques")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(
      `Erro ao excluir embarque: ${error.message}`
    )
  }

  return true
}
export async function atualizarEmbarque(
  id,
  {
    origem,
    destino,
    horario,
    status,
  }
) {
  const { data, error } = await supabase
    .from("embarques")
    .update({
      origem,
      destino,
      horario,
      status,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao atualizar embarque: ${error.message}`
    )
  }

  return data
}
export async function alterarAtivoEmbarque(
  id,
  ativo
) {
  const { data, error } = await supabase
    .from("embarques")
    .update({
      ativo,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao alterar embarque: ${error.message}`
    )
  }

  return data
}