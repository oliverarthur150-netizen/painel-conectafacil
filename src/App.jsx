import { useEffect, useRef, useState } from "react"
import "./App.css"
import { enviarAnuncioCompleto } from "./services/midias.service"
import Header from "./components/Header"
import TV from "./components/TV"
import { supabase } from "./services/supabase"
import Layout from "./layout/Layout"
import Dashboard from "./pages/Dashboard"
import Publicidade from "./pages/Publicidade"
import Telas from "./pages/Telas"
import Embarques from "./pages/Embarques"
import Clientes from "./pages/Clientes"
import DaSorte from "./pages/DaSorte"
import Biblioteca from "./pages/Biblioteca"
import Relatorios from "./pages/Relatorios"
import Configuracoes from "./pages/Configuracoes"
const STORAGE_EMBARQUES = "conectafacil_embarques"

const IMAGENS_INICIAIS = [
  "/fundo.jpg",
  "/fundo1.jpg",
  "/fundo2.jpg",
]

function criarId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function carregarEmbarques() {
  try {
    const dadosSalvos = localStorage.getItem(
      STORAGE_EMBARQUES
    )

    if (!dadosSalvos) {
      return []
    }

    const lista = JSON.parse(dadosSalvos)

    if (!Array.isArray(lista)) {
      return []
    }

    return lista
      .map((item) => ({
        id: item.id || criarId(),
        nome: String(item.nome || "").trim(),
        horario: String(item.horario || "").trim(),
      }))
      .filter((item) => item.nome)
  } catch (erro) {
    console.error(
      "Erro ao carregar os embarques:",
      erro
    )

    return []
  }
}

function formatarHorarioDigitado(valor) {
  return valor
    .replace(/[^\d:]/g, "")
    .slice(0, 5)
}

export default function App() {
  const [embarques, setEmbarques] =
    useState(carregarEmbarques)

  const [novoEmbarque, setNovoEmbarque] =
    useState("")

  const [novoHorario, setNovoHorario] =
    useState("")

  const [hora, setHora] = useState("")
  const [data, setData] = useState("")

  const [temperatura] = useState("28°C")
  const [clima] = useState("☀️")

  const [videos, setVideos] = useState([])

  const [imagens, setImagens] = useState(
    IMAGENS_INICIAIS
  )

  const videoInputRef = useRef(null)
  const imagemInputRef = useRef(null)

  const videosRef = useRef([])
  const imagensTemporariasRef = useRef([])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_EMBARQUES,
        JSON.stringify(embarques)
      )
    } catch (erro) {
      console.error(
        "Erro ao salvar os embarques:",
        erro
      )
    }
  }, [embarques])

  useEffect(() => {
    function atualizarRelogio() {
      const agora = new Date()

      setHora(
        agora.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )

      setData(
        agora.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      )
    }

    atualizarRelogio()

    const intervalo = setInterval(
      atualizarRelogio,
      1000
    )

    return () => {
      clearInterval(intervalo)
    }
  }, [])
useEffect(() => {
  async function testarSupabase() {
    const { data, error } = await supabase
      .from("telas")
      .select("*")

    console.log("TELAS:", data)

    if (error) {
      console.error(error)
    }
  }

  testarSupabase()
}, [])
  useEffect(() => {
    return () => {
      videosRef.current.forEach((endereco) => {
        URL.revokeObjectURL(endereco)
      })

      imagensTemporariasRef.current.forEach(
        (endereco) => {
          URL.revokeObjectURL(endereco)
        }
      )
    }
  }, [])

  function adicionarEmbarque() {
    const nome = novoEmbarque.trim()
    const horario = novoHorario.trim()

    if (!nome) {
      alert("Digite o nome do embarque.")
      return
    }

    if (!horario) {
      alert("Digite o horário do embarque.")
      return
    }

    const novo = {
      id: criarId(),
      nome,
      horario,
    }

    setEmbarques((listaAtual) => [
      ...listaAtual,
      novo,
    ])

    setNovoEmbarque("")
    setNovoHorario("")
  }

  function excluirEmbarque(id) {
    setEmbarques((listaAtual) =>
      listaAtual.filter(
        (embarque) => embarque.id !== id
      )
    )
  }

  function limparEmbarques() {
    if (embarques.length === 0) {
      return
    }

    const confirmou = window.confirm(
      "Deseja realmente apagar todos os embarques?"
    )

    if (!confirmou) {
      return
    }

    setEmbarques([])
  }

  function adicionarVideo(evento) {
    const arquivo = evento.target.files?.[0]

    if (!arquivo) {
      return
    }

    const endereco =
      URL.createObjectURL(arquivo)

    videosRef.current.push(endereco)

    setVideos((listaAtual) => [
      ...listaAtual,
      endereco,
    ])

    evento.target.value = ""
  }

 async function adicionarImagem(evento) {
  const arquivo = evento.target.files?.[0]

  if (!arquivo) {
    return
  }

  try {
    console.log("Enviando imagem para o Supabase...")

    const resultado = await enviarAnuncioCompleto({
      arquivo,
      titulo: arquivo.name,
      cliente: "ConectaFácil",
      duracaoSegundos: 10,
      codigoTela: "LANCHA-01",
    })

    console.log("UPLOAD CONCLUÍDO:", resultado)

    alert(
      "Imagem enviada para a nuvem e vinculada à LANCHA-01."
    )
  } catch (erro) {
    console.error("ERRO NO UPLOAD:", erro)

    alert(
      erro?.message ||
        "Não foi possível enviar a imagem."
    )
  } finally {
    evento.target.value = ""
  }
}

  function verificarEnter(evento) {
    if (evento.key !== "Enter") {
      return
    }

    adicionarEmbarque()
  }

 return (
  <Layout>
  {({ paginaAtual }) => (
    <>
 {paginaAtual === "dashboard" ? (
  <Dashboard />
) : paginaAtual === "anuncios" ? (
  <Publicidade />
) : paginaAtual === "tvs" ? (
  <Telas />
) : paginaAtual === "embarques" ? (
  <Embarques />
) : paginaAtual === "clientes" ? (
  <Clientes />
) : paginaAtual === "da-sorte" ? (
  <DaSorte />
) : paginaAtual === "biblioteca" ? (
  <Biblioteca />
  ) : paginaAtual === "relatorios" ? (
  <Relatorios />
  ) : paginaAtual === "configuracoes" ? (
  <Configuracoes />
) : (
  <div className="aplicativo">
      <Header
        data={data}
        hora={hora}
        clima={clima}
        temperatura={temperatura}
      />

      <section className="painel-controle">
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="input-arquivo"
          onChange={adicionarVideo}
        />

        <input
          ref={imagemInputRef}
          type="file"
          accept="image/*"
          className="input-arquivo"
          onChange={adicionarImagem}
        />

        <div className="controle-arquivos">
          <button
            type="button"
            className="botao-controle botao-video"
            onClick={() =>
              videoInputRef.current?.click()
            }
          >
            <span className="botao-icone">
              📺
            </span>

            <span>Adicionar vídeo</span>
          </button>

          <button
            type="button"
            className="botao-controle botao-imagem"
            onClick={() =>
              imagemInputRef.current?.click()
            }
          >
            <span className="botao-icone">
              🖼️
            </span>

            <span>Adicionar imagem</span>
          </button>
        </div>

        <div className="controle-embarque">
          <input
            type="text"
            className="campo-controle campo-destino"
            value={novoEmbarque}
            onChange={(evento) =>
              setNovoEmbarque(
                evento.target.value
              )
            }
            onKeyDown={verificarEnter}
            placeholder="Nome ou destino do embarque"
          />

          <input
            type="text"
            inputMode="numeric"
            className="campo-controle campo-horario"
            value={novoHorario}
            onChange={(evento) =>
              setNovoHorario(
                formatarHorarioDigitado(
                  evento.target.value
                )
              )
            }
            onKeyDown={verificarEnter}
            placeholder="Horário: 06:00"
            maxLength={5}
          />

          <button
            type="button"
            className="botao-controle botao-adicionar"
            onClick={adicionarEmbarque}
          >
            <span className="botao-icone">
              🚢
            </span>

            <span>Adicionar</span>
          </button>

          <button
            type="button"
            className="botao-controle botao-limpar"
            onClick={limparEmbarques}
            disabled={embarques.length === 0}
          >
            <span className="botao-icone">
              🗑️
            </span>

            <span>Limpar tudo</span>
          </button>
        </div>
      </section>

      <main className="area-principal">
        <TV
          videos={videos}
          imagens={imagens}
        />

        <aside className="painel-embarques">
          <div className="painel-embarques-topo">
            <div>
              <span className="painel-legenda">
                PAINEL DE VIAGENS
              </span>

              <h2>
                <span>🛳️</span>
                Próximos embarques
              </h2>
            </div>

            <span className="painel-contador">
              {embarques.length}
            </span>
          </div>

          <div className="lista-embarques">
            {embarques.length === 0 ? (
              <div className="embarques-vazio">
                <span className="vazio-icone">
                  🚢
                </span>

                <strong>
                  Nenhum embarque cadastrado
                </strong>

                <small>
                  Cadastre a próxima saída no
                  painel de controle.
                </small>
              </div>
            ) : (
              embarques.map(
                (embarque, indice) => {
                  const primeiro =
                    indice === 0

                  return (
                    <article
                      key={embarque.id}
                      className={
                        primeiro
                          ? "cartao-embarque cartao-destaque"
                          : "cartao-embarque"
                      }
                    >
                      <div className="cartao-informacoes">
                        {primeiro && (
                          <span className="selo-proximo">
                            <span className="ponto-verde" />
                            PRÓXIMO EMBARQUE
                          </span>
                        )}

                        <strong className="embarque-destino">
                          <span>
                            {primeiro
                              ? "🚢"
                              : "🛳️"}
                          </span>

                          {embarque.nome}
                        </strong>

                        <span className="embarque-horario">
                          <span>🕒</span>
                          {embarque.horario}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="botao-excluir"
                        title={`Excluir ${embarque.nome}`}
                        aria-label={`Excluir embarque ${embarque.nome}`}
                        onClick={() =>
                          excluirEmbarque(
                            embarque.id
                          )
                        }
                      >
                        🗑️
                      </button>
                    </article>
                  )
                }
              )
            )}
          </div>

          <div className="painel-embarques-rodape">
            <span className="ponto-verde" />

            Atualização em tempo real
          </div>
        </aside>
      </main>

      <div className="ticker">
        <div className="ticker-conteudo">
          <span>
            🚢 ConectaFácil
          </span>

          <span>•</span>

          <span>
            Embarques em tempo real
          </span>

          <span>•</span>

          <span>
            Publicidade inteligente
          </span>

          <span>•</span>

          <span>
            Informação para passageiros
          </span>

          <span>•</span>

          <span>
            Boa viagem
          </span>
        </div>
      </div>

      <footer className="rodape">
        <span>
          ConectaFácil TV Indoor
        </span>

        <span className="rodape-status">
          <span className="ponto-online" />
          Sistema ativo
        </span>
            </footer>
      </div>
        )}
</>
    )}
  </Layout>
  )
}