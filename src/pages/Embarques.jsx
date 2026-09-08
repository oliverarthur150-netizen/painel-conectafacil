import { useEffect, useState } from "react"
import {
  listarEmbarques,
  criarEmbarque,
  excluirEmbarque,
  atualizarEmbarque,
  alterarAtivoEmbarque,
} from "../services/embarquesService"

const formularioInicial = {
  origem: "",
  destino: "",
  horario: "",
  status: "No horário",
}

export default function Embarques() {
  const [embarques, setEmbarques] = useState([])
  const [formulario, setFormulario] =
    useState(formularioInicial)
  const [carregando, setCarregando] =
    useState(true)
const [embarqueEditandoId, setEmbarqueEditandoId] =
  useState(null)
  async function carregarEmbarques() {
    try {
      setCarregando(true)

      const dados = await listarEmbarques()
      setEmbarques(dados)
    } catch (error) {
      console.error(
        "Erro ao carregar embarques:",
        error
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarEmbarques()
  }, [])

  function atualizarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }
function editarEmbarque(embarque) {
  setFormulario({
    origem: embarque.origem || "",
    destino: embarque.destino || "",
    horario: String(
      embarque.horario || ""
    ).slice(0, 5),
   status:
  embarque.status === "Sem horário"
    ? "No horário"
    : embarque.status || "No horário",
  })

  setEmbarqueEditandoId(embarque.id)
}
async function alternarAtivoEmbarque(embarque) {
  try {
    await alterarAtivoEmbarque(
      embarque.id,
      !embarque.ativo
    )

    await carregarEmbarques()
  } catch (error) {
    alert(error.message)
  }
}
  async function salvarEmbarque(evento) {
    evento.preventDefault()

    if (
      !formulario.origem ||
      !formulario.destino ||
      !formulario.horario
    ) {
      alert(
        "Preencha origem, destino e horário."
      )
      return
    }

    try {
  if (embarqueEditandoId) {
    await atualizarEmbarque(
      embarqueEditandoId,
      {
        origem: formulario.origem,
        destino: formulario.destino,
        horario: formulario.horario,
        status: formulario.status,
      }
    )

    setEmbarqueEditandoId(null)
  } else {
    await criarEmbarque({
      origem: formulario.origem,
      destino: formulario.destino,
      horario: formulario.horario,
      status: formulario.status,
    })
  }

  setFormulario(formularioInicial)
  await carregarEmbarques()
} catch (error) {
  alert(error.message)
}
  }

  async function removerEmbarque(id) {
    const confirmou = window.confirm(
      "Deseja excluir este horário?"
    )

    if (!confirmou) return

    try {
      await excluirEmbarque(id)
      await carregarEmbarques()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <section className="cloud-pagina">
      <h1>🛥️ Embarca</h1>

      <form
        onSubmit={salvarEmbarque}
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 180px 180px auto",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <input
          name="origem"
          value={formulario.origem}
          onChange={atualizarCampo}
          placeholder="Origem"
        />

        <input
          name="destino"
          value={formulario.destino}
          onChange={atualizarCampo}
          placeholder="Destino"
        />

        <input
          type="time"
          name="horario"
          value={formulario.horario}
          onChange={atualizarCampo}
        />

        <select
          name="status"
          value={formulario.status}
          onChange={atualizarCampo}
        >
          <option>No horário</option>
          <option>Atrasado</option>
          <option>Cancelado</option>
        </select>

        <button type="submit">
  {embarqueEditandoId
    ? "Salvar alterações"
    : "Adicionar"}
</button>
      </form>

      {carregando ? (
        <p>Carregando horários...</p>
      ) : (
        <div>
          {embarques.map((embarque) => (
            <div
              key={embarque.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "120px 1fr 1fr 160px 100px",
                gap: "12px",
                alignItems: "center",
                padding: "12px",
                marginBottom: "10px",
                border:
                  "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
              }}
            >
              <strong>
                {String(
                  embarque.horario || ""
                ).slice(0, 5)}
              </strong>

              <span>{embarque.origem}</span>

              <span>{embarque.destino}</span>

              <span>
  {embarque.status === "Sem horário"
    ? "No horário"
    : embarque.status || "No horário"}
</span>

             <div
  style={{
    display: "flex",
    gap: "8px",
  }}
>
  <button
    type="button"
    onClick={() =>
      editarEmbarque(embarque)
    }
  >
    Editar
  </button>

  <button
    type="button"
    onClick={() =>
      alternarAtivoEmbarque(embarque)
    }
  >
    {embarque.ativo
      ? "Desativar"
      : "Reativar"}
  </button>

  <button
    type="button"
    onClick={() =>
      removerEmbarque(
        embarque.id
      )
    }
  >
    Excluir
  </button>
</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}