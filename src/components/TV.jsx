import { useEffect, useMemo, useState } from "react"

const STORAGE_PUBLICIDADE = "conectafacil_publicidade"
const TEMPO_IMAGEM_PADRAO = 10000
const TEMPO_ABERTURA = 2400
const INTERVALO_ATUALIZACAO = 5000

function carregarAnunciosSalvos() {
  try {
    const dados = localStorage.getItem(STORAGE_PUBLICIDADE)
    const lista = dados ? JSON.parse(dados) : []

    return Array.isArray(lista) ? lista : []
  } catch (erro) {
    console.error("Erro ao carregar anúncios da TV:", erro)
    return []
  }
}

function obterTelasDoAnuncio(anuncio) {
  if (Array.isArray(anuncio.telas)) return anuncio.telas
  if (anuncio.tela) return [anuncio.tela]
  return []
}

function anuncioEstaNoPeriodo(anuncio) {
  const agora = new Date()
  const inicioDoDia = new Date(agora)
  inicioDoDia.setHours(0, 0, 0, 0)

  if (anuncio.dataInicio) {
    const inicio = new Date(`${anuncio.dataInicio}T00:00:00`)
    if (inicio > inicioDoDia) return false
  }

  if (anuncio.dataTermino) {
    const termino = new Date(`${anuncio.dataTermino}T23:59:59`)
    if (termino < agora) return false
  }

  return true
}

export default function TV({
  videos = [],
  imagens = [],
  telaAtual = "Lancha 01",
}) {
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [mostrarAbertura, setMostrarAbertura] = useState(true)
  const [progresso, setProgresso] = useState(0)
  const [orientacaoImagem, setOrientacaoImagem] = useState("horizontal")
  const [anuncios, setAnuncios] = useState(carregarAnunciosSalvos)

  useEffect(() => {
    function atualizarAnuncios() {
      setAnuncios(carregarAnunciosSalvos())
    }

    atualizarAnuncios()

    const intervalo = window.setInterval(
      atualizarAnuncios,
      INTERVALO_ATUALIZACAO
    )

    window.addEventListener("storage", atualizarAnuncios)

    return () => {
      window.clearInterval(intervalo)
      window.removeEventListener("storage", atualizarAnuncios)
    }
  }, [])

  const playlist = useMemo(() => {
    const anunciosDaTela = anuncios
      .filter((anuncio) => {
        const telas = obterTelasDoAnuncio(anuncio)

        return (
          anuncio.status === "Ativo" &&
          anuncioEstaNoPeriodo(anuncio) &&
          telas.includes(telaAtual) &&
          anuncio.arquivoUrl
        )
      })
      .map((anuncio) => ({
        id: `anuncio-${anuncio.id}`,
        nome: anuncio.nome,
        cliente: anuncio.cliente,
        tipo:
          anuncio.tipoMidia === "video" ||
          anuncio.arquivoTipo?.startsWith("video/")
            ? "video"
            : "imagem",
        src: anuncio.arquivoUrl,
        duracao:
          Number(anuncio.duracao) > 0
            ? Number(anuncio.duracao) * 1000
            : TEMPO_IMAGEM_PADRAO,
      }))

    if (anunciosDaTela.length > 0) return anunciosDaTela

    const listaVideos = videos.map((src) => ({
      id: `video-${src}`,
      tipo: "video",
      src,
      duracao: 0,
    }))

    const listaImagens = imagens.map((src) => ({
      id: `imagem-${src}`,
      tipo: "imagem",
      src,
      duracao: TEMPO_IMAGEM_PADRAO,
    }))

    return [...listaVideos, ...listaImagens]
  }, [anuncios, telaAtual, videos, imagens])

  const midiaAtual = playlist[indiceAtual] ?? null

  function proximaMidia() {
    setIndiceAtual((indiceAnterior) => {
      if (playlist.length <= 1) return 0
      return (indiceAnterior + 1) % playlist.length
    })
  }

  function identificarOrientacao(evento) {
    const imagem = evento.currentTarget

    if (imagem.naturalWidth >= imagem.naturalHeight) {
      setOrientacaoImagem("horizontal")
    } else {
      setOrientacaoImagem("vertical")
    }
  }

  useEffect(() => {
    let valor = 0

    const intervalo = setInterval(() => {
      valor += 5

      if (valor >= 100) {
        valor = 100
        clearInterval(intervalo)
      }

      setProgresso(valor)
    }, 80)

    const encerramento = setTimeout(() => {
      setMostrarAbertura(false)
    }, TEMPO_ABERTURA)

    return () => {
      clearInterval(intervalo)
      clearTimeout(encerramento)
    }
  }, [])

  useEffect(() => {
    if (playlist.length === 0) {
      setIndiceAtual(0)
      return
    }

    if (indiceAtual >= playlist.length) {
      setIndiceAtual(0)
    }
  }, [indiceAtual, playlist.length])

  useEffect(() => {
    if (!midiaAtual || midiaAtual.tipo !== "imagem") return

    const temporizador = setTimeout(() => {
      proximaMidia()
    }, midiaAtual.duracao || TEMPO_IMAGEM_PADRAO)

    return () => clearTimeout(temporizador)
  }, [midiaAtual, indiceAtual])

  useEffect(() => {
    setOrientacaoImagem("horizontal")
  }, [midiaAtual?.src])

  return (
    <section className="tv">
      {mostrarAbertura && (
        <div className="tv-abertura">
          <div className="tv-abertura-luz" />

          <div className="tv-abertura-conteudo">
            <div className="tv-abertura-logo">
              <img src="/logo.png" alt="ConectaFácil" />
            </div>

            <span className="tv-abertura-selo">TV INDOOR</span>
            <h1>ConectaFácil</h1>
            <p>Preparando a programação</p>

            <div className="tv-barra-carregamento">
              <div
                className="tv-barra-progresso"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <strong>{progresso}%</strong>
          </div>
        </div>
      )}

      <div className="tv-conteudo">
        {midiaAtual?.tipo === "imagem" && (
          <>
            <div
              className="tv-fundo-desfocado"
              style={{ backgroundImage: `url("${midiaAtual.src}")` }}
            />

            <img
              key={midiaAtual.id}
              src={midiaAtual.src}
              alt={midiaAtual.nome || "Programação ConectaFácil"}
              className={`tv-midia tv-imagem tv-imagem-${orientacaoImagem}`}
              onLoad={identificarOrientacao}
              onError={proximaMidia}
            />
          </>
        )}

        {midiaAtual?.tipo === "video" && (
          <video
            key={midiaAtual.id}
            className="tv-midia tv-video"
            src={midiaAtual.src}
            autoPlay
            muted
            playsInline
            onEnded={proximaMidia}
            onError={proximaMidia}
          />
        )}

        {!midiaAtual && (
          <div className="tv-sem-conteudo">
            <span>📺</span>
            <strong>Aguardando programação</strong>
            <small>Nenhum anúncio ativo para {telaAtual}.</small>
          </div>
        )}

        <div className="tv-sombra" />
        <div className="tv-linha-luminosa" />
        <div className="tv-efeito-reflexo" />

        <div className="tv-apresentacao">
          <div className="tv-logo">
            <img src="/logo.png" alt="ConectaFácil" />
          </div>

          <span className="tv-etiqueta">{telaAtual}</span>
          <h1>Informação que acompanha sua viagem</h1>
          <p>Embarques, publicidade e serviços em tempo real</p>
        </div>

        <div className="tv-rodape-interno">
          <div className="tv-programacao-status">
            <span className="tv-status-ponto" />
            Programação ativa
          </div>

          <div className="tv-posicao">
            {playlist.length > 0
              ? `${indiceAtual + 1} de ${playlist.length}`
              : "Sem conteúdo"}
          </div>
        </div>
      </div>
    </section>
  )
}