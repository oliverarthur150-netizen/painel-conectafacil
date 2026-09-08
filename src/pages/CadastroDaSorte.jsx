import { useState } from "react"
import { supabase } from "../services/supabase"
import {
  Clover,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export default function CadastroDaSorte() {
  const [plano, setPlano] = useState("mensal")
  const [nome, setNome] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  return (
    <div className="cadastro-dasorte-page">
      <div className="cadastro-dasorte-card">
        <div className="cadastro-dasorte-topo">
          <div className="cadastro-dasorte-logo">
            <Clover size={34} />
          </div>

          <span>DA SORTE</span>
          <h1>Crie sua conta</h1>

          <p>
            Cadastre-se, escolha seu plano e receba acesso ao aplicativo DA SORTE.
          </p>
        </div>

        <div className="cadastro-dasorte-beneficios">
          <span>
            <Smartphone size={17} />
            Aplicativo no celular
          </span>

          <span>
            <ShieldCheck size={17} />
            Conta protegida
          </span>

          <span>
            <Sparkles size={17} />
            Motor inteligente
          </span>
        </div>

        <div className="cadastro-dasorte-formulario">
          <label>
  Nome completo
  <input
    type="text"
    placeholder="Digite seu nome"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
  />
</label>

         <label>
  WhatsApp
  <input
    type="tel"
    placeholder="(83) 99999-9999"
    value={whatsapp}
    onChange={(e) => setWhatsapp(e.target.value)}
  />
</label>
        </div>

        <div className="cadastro-dasorte-planos">
          <h2>Escolha seu plano</h2>

          <div className="cadastro-dasorte-planos-grid">
            <button
  type="button"
  className={plano === "teste" ? "ativo" : ""}
  onClick={() => setPlano("teste")}
>
  <span>Teste grátis</span>
  <strong>3 dias</strong>
  <small>Conheça o DA SORTE antes de assinar</small>

  {plano === "teste" && (
    <CheckCircle2 size={20} />
  )}
</button>
            <button
              type="button"
              className={plano === "mensal" ? "ativo" : ""}
              onClick={() => setPlano("mensal")}
            >
              <span>Mensal</span>
              <strong>R$ 19,90</strong>
              <small>30 dias de acesso</small>

              {plano === "mensal" && (
                <CheckCircle2 size={20} />
              )}
            </button>

            <button
              type="button"
              className={plano === "trimestral" ? "ativo" : ""}
              onClick={() => setPlano("trimestral")}
            >
              <span>Trimestral</span>
              <strong>R$ 49,90</strong>
              <small>90 dias de acesso</small>

              {plano === "trimestral" && (
                <CheckCircle2 size={20} />
              )}
            </button>

            <button
              type="button"
              className={plano === "anual" ? "ativo" : ""}
              onClick={() => setPlano("anual")}
            >
              <span>Anual</span>
              <strong>R$ 149,90</strong>
              <small>12 meses de acesso</small>

              {plano === "anual" && (
                <CheckCircle2 size={20} />
              )}
            </button>
          </div>
        </div>

        <button
  type="button"
  className="cadastro-dasorte-continuar"
  onClick={async () => {
    if (!nome.trim()) {
      alert("Digite seu nome.")
      return
    }

    if (!whatsapp.trim()) {
      alert("Digite seu WhatsApp.")
      return
    }

 const agora = new Date()

const fimTeste = new Date(agora)

if (plano === "teste") {
  fimTeste.setDate(fimTeste.getDate() + 3)
}

const { error } = await supabase
  .from("dasorte_clientes")
  .insert({
    nome: nome.trim(),
    whatsapp: whatsapp.trim(),
    plano,
    status:
      plano === "teste"
        ? "teste"
        : "aguardando_pagamento",
    data_ativacao:
      plano === "teste"
        ? agora.toISOString().slice(0, 10)
        : null,
    vencimento:
      plano === "teste"
        ? fimTeste.toISOString().slice(0, 10)
        : null,
  })

if (error) {
  console.error("Erro ao cadastrar cliente DA SORTE:", error)
  alert("Não foi possível concluir o cadastro.")
  return
}

alert("Cadastro realizado com sucesso!")
setNome("")
setWhatsapp("")
setPlano("mensal")
  }}
>
  Continuar cadastro
</button>

        <p className="cadastro-dasorte-aviso">
          Após a confirmação, sua conta ficará disponível no painel
          ConectaFácil para ativação.
        </p>
      </div>
    </div>
  )
}