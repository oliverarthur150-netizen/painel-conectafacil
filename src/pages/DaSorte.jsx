import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import {
  Clover,
  Users,
  UserCheck,
  Clock,
  DollarSign,
  Plus,
} from "lucide-react"

export default function DaSorte() {
const [mostrarFormulario, setMostrarFormulario] = useState(false)
const [clientes, setClientes] = useState([])
const [sessao, setSessao] = useState(null)
const [emailAdmin, setEmailAdmin] = useState("")
const [senhaAdmin, setSenhaAdmin] = useState("")
const [erroLogin, setErroLogin] = useState("")
const [novoNome, setNovoNome] = useState("")
const [novoWhatsapp, setNovoWhatsapp] = useState("")
const [novoPlano, setNovoPlano] = useState("")
const [novaDataAtivacao, setNovaDataAtivacao] = useState("")
const [novoVencimento, setNovoVencimento] = useState("")
const [novoStatus, setNovoStatus] = useState("ativo")
const [clienteEditando, setClienteEditando] = useState(null)
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSessao(data.session)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
    setSessao(novaSessao)
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])
useEffect(() => {
  if (!sessao) {
    setClientes([])
    return
  }
  async function atualizarTestesExpirados() {
  const hoje = new Date().toISOString().slice(0, 10)

  const { error } = await supabase
    .from("dasorte_clientes")
    .update({ status: "teste_expirado" })
    .eq("status", "teste")
    .lt("vencimento", hoje)

  if (error) {
    console.error("Erro ao atualizar testes expirados:", error)
  }
}
async function atualizarPlanosVencidos() {
  const hoje = new Date().toISOString().slice(0, 10)

  const { error } = await supabase
    .from("dasorte_clientes")
    .update({ status: "vencido" })
    .eq("status", "ativo")
    .lt("vencimento", hoje)

  if (error) {
    console.error("Erro ao atualizar planos vencidos:", error)
  }
}
  async function carregarClientesDaSorte() {
    const { data, error } = await supabase
      .from("dasorte_clientes")
      .select("*")
      .order("criado_em", { ascending: false })

    if (error) {
      console.error("Erro ao carregar clientes DA SORTE:", error)
      return
    }

    setClientes(data || [])
  }
async function prepararClientesDaSorte() {
  await atualizarTestesExpirados()
  await atualizarPlanosVencidos()
  await carregarClientesDaSorte()
}

prepararClientesDaSorte()
}, [sessao])

async function atualizarStatusCliente(id, novoStatus) {
  const clienteAtual = clientes.find(
    (cliente) => cliente.id === id
  )

  if (!clienteAtual) {
    alert("Cliente não encontrado.")
    return
  }

  const atualizacao = {
    status: novoStatus,
  }

  if (novoStatus === "ativo") {
    const agora = new Date()
    const vencimento = new Date(agora)

    if (clienteAtual.plano === "mensal") {
      vencimento.setDate(vencimento.getDate() + 30)
    } else if (clienteAtual.plano === "trimestral") {
      vencimento.setDate(vencimento.getDate() + 90)
    } else if (clienteAtual.plano === "semestral") {
      vencimento.setMonth(vencimento.getMonth() + 6)
    } else if (clienteAtual.plano === "anual") {
      vencimento.setFullYear(vencimento.getFullYear() + 1)
    }

    atualizacao.data_ativacao =
      agora.toISOString().slice(0, 10)

    atualizacao.vencimento =
      vencimento.toISOString().slice(0, 10)
  }

  const { error } = await supabase
    .from("dasorte_clientes")
    .update(atualizacao)
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar cliente:", error)
    alert("Não foi possível atualizar o cliente.")
    return
  }

  setClientes((listaAtual) =>
    listaAtual.map((cliente) =>
      cliente.id === id
        ? { ...cliente, ...atualizacao }
        : cliente
    )
  )
}

async function excluirCliente(id) {
  const confirmou = window.confirm(
    "Deseja realmente excluir este cadastro?"
  )

  if (!confirmou) return

  const { error } = await supabase
    .from("dasorte_clientes")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Erro ao excluir cliente:", error)
    alert("Não foi possível excluir o cliente.")
    return
  }

  setClientes((listaAtual) =>
    listaAtual.filter((cliente) => cliente.id !== id)
  )
}
async function salvarCliente() {
  if (
    !novoNome.trim() ||
    !novoWhatsapp.trim() ||
    !novoPlano ||
    !novaDataAtivacao ||
    !novoVencimento
  ) {
    alert("Preencha todos os campos do cliente.")
    return
  }

  const dadosCliente = {
    nome: novoNome.trim(),
    whatsapp: novoWhatsapp.trim(),
    plano: novoPlano,
    data_ativacao: novaDataAtivacao,
    vencimento: novoVencimento,
    status: novoStatus,
  }

  if (clienteEditando) {
    const { data, error } = await supabase
      .from("dasorte_clientes")
      .update(dadosCliente)
      .eq("id", clienteEditando.id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao editar cliente:", error)
      alert("Não foi possível editar o cliente.")
      return
    }

    setClientes((listaAtual) =>
      listaAtual.map((cliente) =>
        cliente.id === data.id ? data : cliente
      )
    )

    setClienteEditando(null)
    setNovoNome("")
    setNovoWhatsapp("")
    setNovoPlano("")
    setNovaDataAtivacao("")
    setNovoVencimento("")
    setNovoStatus("ativo")
    setMostrarFormulario(false)

    alert("Cliente atualizado com sucesso!")
    return
  }

  const { data, error } = await supabase
    .from("dasorte_clientes")
    .insert([dadosCliente])
    .select()
    .single()

  if (error) {
    console.error("Erro ao cadastrar cliente:", error)
    alert("Não foi possível cadastrar o cliente.")
    return
  }

  setClientes((listaAtual) => [data, ...listaAtual])

  setNovoNome("")
  setNovoWhatsapp("")
  setNovoPlano("")
  setNovaDataAtivacao("")
  setNovoVencimento("")
  setNovoStatus("ativo")
  setMostrarFormulario(false)

  alert("Cliente cadastrado com sucesso!")
}
function abrirEdicaoCliente(cliente) {
  setClienteEditando(cliente)

  setNovoNome(cliente.nome || "")
  setNovoWhatsapp(cliente.whatsapp || "")
  setNovoPlano(cliente.plano || "")
  setNovaDataAtivacao(cliente.data_ativacao || "")
  setNovoVencimento(cliente.vencimento || "")
  setNovoStatus(cliente.status || "ativo")

  setMostrarFormulario(true)
}
if (!sessao) {
  return (
    <div className="dasorte-login-page">
      <div className="dasorte-login-card">
        <div className="dasorte-login-logo">
          <Clover size={34} />
        </div>

        <span>ÁREA ADMINISTRATIVA</span>
        <h1>ConectaFácil • DA SORTE</h1>

        <p>
          Entre com sua conta de administrador para visualizar
          e gerenciar os clientes do DA SORTE.
        </p>

        <label>
          E-mail
          <input
            type="email"
            value={emailAdmin}
            onChange={(e) => setEmailAdmin(e.target.value)}
            placeholder="Seu e-mail"
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senhaAdmin}
            onChange={(e) => setSenhaAdmin(e.target.value)}
            placeholder="Sua senha"
          />
        </label>

        {erroLogin && (
          <div className="dasorte-login-erro">
            {erroLogin}
          </div>
        )}

        <button
          type="button"
          onClick={async () => {
            setErroLogin("")

            const { error } = await supabase.auth.signInWithPassword({
              email: emailAdmin,
              password: senhaAdmin,
            })

            if (error) {
              setErroLogin("E-mail ou senha inválidos.")
            }
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  )
}
  return (
    <div className="dasorte-page">
      <section className="dasorte-hero">
        <div>
          <span className="dasorte-kicker">
            🍀 CONECTAFÁCIL • DA SORTE
          </span>

          <h1>DA SORTE</h1>

          <p>
            Gerencie clientes, planos, ativações,
            vencimentos e vendas do aplicativo DA SORTE.
          </p>
        </div>
      </section>

      <section className="dasorte-cards">
        <article className="dasorte-card">
          <div className="dasorte-card-icone">
            <Users size={24} />
          </div>

          <span>Clientes DA SORTE</span>
          <strong>{clientes.length}</strong>
        </article>

        <article className="dasorte-card">
          <div className="dasorte-card-icone">
            <UserCheck size={24} />
          </div>

          <span>Ativos</span>
          <strong>
  {clientes.filter((cliente) => cliente.status === "ativo").length}
</strong>
        </article>

        <article className="dasorte-card">
          <div className="dasorte-card-icone">
            <Clock size={24} />
          </div>

          <span>Próximos do vencimento</span>
          <strong>0</strong>
        </article>

        <article className="dasorte-card">
          <div className="dasorte-card-icone">
            <DollarSign size={24} />
          </div>

          <span>Receita mensal</span>
          <strong>R$ 0,00</strong>
        </article>
      </section>

      <section className="dasorte-assinantes">
        <div className="dasorte-assinantes-topo">
          <div>
            <span>GESTÃO COMERCIAL</span>
            <h2>Assinantes do DA SORTE</h2>
          </div>

          <button
  type="button"
  onClick={() => setMostrarFormulario(true)}
>
  <Plus size={18} />
  Novo cliente
</button>
        </div>
{mostrarFormulario && (
  <div className="dasorte-modal-fundo">
    <div className="dasorte-modal">
      <div className="dasorte-modal-topo">
        <div>
          <span>NOVO ASSINANTE</span>
          <h2>Cadastrar cliente DA SORTE</h2>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario(false)}
        >
          ✕
        </button>
      </div>

      <div className="dasorte-formulario">
        <label>
          Nome do cliente
          <input
  type="text"
  placeholder="Ex.: João da Silva"
  value={novoNome}
  onChange={(e) => setNovoNome(e.target.value)}
/>
        </label>

        <label>
          WhatsApp
          <input
  type="text"
  placeholder="(83) 99999-9999"
  value={novoWhatsapp}
  onChange={(e) => setNovoWhatsapp(e.target.value)}
/>
        </label>

        <label>
          Plano
          <select
  value={novoPlano}
  onChange={(e) => setNovoPlano(e.target.value)}
>
  <option value="" disabled>
    Escolha um plano
  </option>
  <option value="mensal">Mensal</option>
  <option value="trimestral">Trimestral</option>
  <option value="semestral">Semestral</option>
  <option value="anual">Anual</option>
</select>
        </label>

      <label>
  Data de ativação
  <input
    type="date"
    value={novaDataAtivacao}
    onChange={(e) => setNovaDataAtivacao(e.target.value)}
  />
</label>
        <label>
  Vencimento
  <input
    type="date"
    value={novoVencimento}
    onChange={(e) => setNovoVencimento(e.target.value)}
  />
</label>

        <label>
  Status
  <select
    value={novoStatus}
    onChange={(e) => setNovoStatus(e.target.value)}
  >
    <option value="ativo">Ativo</option>
    <option value="bloqueado">Bloqueado</option>
  </select>
</label>
      </div>

      <div className="dasorte-modal-acoes">
        <button
          type="button"
          className="secundario"
          onClick={() => setMostrarFormulario(false)}
        >
          Cancelar
        </button>

        <button
  type="button"
  onClick={salvarCliente}
>
  Salvar cliente
</button>
      </div>
    </div>
  </div>
)}
       {clientes.length === 0 ? (
  <div className="dasorte-vazio">
    <Clover size={40} />

    <strong>
      Nenhum cliente cadastrado ainda
    </strong>

    <p>
      Quando alguém se cadastrar no DA SORTE,
      o cliente aparecerá aqui.
    </p>
  </div>
) : (
  <div className="dasorte-clientes-lista">
    {clientes.map((cliente) => (
      <div
        key={cliente.id}
        className="dasorte-cliente-item"
      >
        <div>
          <strong>{cliente.nome}</strong>
          <span>{cliente.whatsapp}</span>
        </div>
<div className="dasorte-cliente-status">
  <span>
    Plano: {cliente.plano}
  </span>

  <strong
    className={
      cliente.status === "ativo"
        ? "status-ativo"
        : cliente.status === "bloqueado"
          ? "status-bloqueado"
          : "status-teste"
    }
  >
    {cliente.status === "ativo"
      ? "● ATIVO"
      : cliente.status === "bloqueado"
        ? "● BLOQUEADO"
        : cliente.status === "teste"
          ? "● EM TESTE"
          : cliente.status}
  </strong>
</div>
       <div className="dasorte-cliente-acoes">
        <button
  type="button"
  onClick={() => abrirEdicaoCliente(cliente)}
>
  Editar
</button>
  <button
  type="button"
 onClick={() =>
  atualizarStatusCliente(cliente.id, "ativo")
}

>
  Ativar
</button>

  <button
    type="button"
    onClick={() =>
      atualizarStatusCliente(cliente.id, "bloqueado")
    }
  >
    Bloquear
  </button>

  <button
    type="button"
    onClick={() => excluirCliente(cliente.id)}
  >
    Excluir
  </button>
</div>
      </div>
    ))}
  </div>
)}
      </section>
    </div>
  )
}