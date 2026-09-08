import { useEffect, useMemo, useState } from "react"
import {
  FileImage,
  Film,
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  RefreshCw,
} from "lucide-react"

import { supabase } from "../services/supabase"

export default function Biblioteca() {
  const [midias, setMidias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [pesquisa, setPesquisa] = useState("")

  async function carregarMidias() {
    try {
      setCarregando(true)
      setErro("")

      const { data, error } = await supabase
        .from("anuncios")
        .select(`
          id,
          titulo,
          cliente,
          tipo_midia,
          arquivo_url,
          arquivo_path,
          criado_em
        `)
        .order("criado_em", {
          ascending: false,
        })

      if (error) {
        throw error
      }

      const urlsVistas = new Set()

      const lista = (data || []).filter((item) => {
        if (!item?.arquivo_url) {
          return false
        }

        if (urlsVistas.has(item.arquivo_url)) {
          return false
        }

        urlsVistas.add(item.arquivo_url)
        return true
      })

      setMidias(lista)
    } catch (error) {
      console.error(
        "Erro ao carregar biblioteca:",
        error
      )

      setErro(
        error?.message ||
          "Não foi possível carregar a biblioteca."
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarMidias()
  }, [])

  const midiasFiltradas = useMemo(() => {
    const termo = pesquisa
      .trim()
      .toLowerCase()

    if (!termo) {
      return midias
    }

    return midias.filter((item) => {
      return (
        String(item.titulo || "")
          .toLowerCase()
          .includes(termo) ||
        String(item.cliente || "")
          .toLowerCase()
          .includes(termo)
      )
    })
  }, [midias, pesquisa])

  const totalImagens = midias.filter(
    (item) => item.tipo_midia === "imagem"
  ).length

  const totalVideos = midias.filter(
    (item) => item.tipo_midia === "video"
  ).length

  return (
    <div
      style={{
        padding: "24px",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span
            style={{
              color: "#38bdf8",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1.5px",
            }}
          >
            CENTRAL DE MÍDIAS
          </span>

          <h1
            style={{
              margin: "6px 0 4px",
              fontSize: "32px",
            }}
          >
            Biblioteca
          </h1>

          <p
            style={{
              margin: 0,
              color: "#8fa8c3",
            }}
          >
            Imagens e vídeos disponíveis para uso nas TVs.
          </p>
        </div>

        <button
          type="button"
          style={{
            border: 0,
            borderRadius: "12px",
            padding: "12px 18px",
            background:
              "linear-gradient(135deg, #1687ff, #6a5cff)",
            color: "#fff",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Upload size={18} />
          Enviar mídia
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <div className="biblioteca-resumo-card">
          <FileImage size={22} />
          <div>
            <strong>{midias.length}</strong>
            <span>Total de mídias</span>
          </div>
        </div>

        <div className="biblioteca-resumo-card">
          <ImageIcon size={22} />
          <div>
            <strong>{totalImagens}</strong>
            <span>Imagens</span>
          </div>
        </div>

        <div className="biblioteca-resumo-card">
          <Film size={22} />
          <div>
            <strong>{totalVideos}</strong>
            <span>Vídeos</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 14px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,0.09)",
            background: "#0b1b2e",
          }}
        >
          <Search size={18} />

          <input
            value={pesquisa}
            onChange={(event) =>
              setPesquisa(event.target.value)
            }
            placeholder="Pesquisar mídia ou cliente..."
            style={{
              width: "100%",
              height: "44px",
              border: 0,
              outline: "none",
              background: "transparent",
              color: "#fff",
            }}
          />
        </div>

        <button
          type="button"
          onClick={carregarMidias}
          style={{
            width: "46px",
            borderRadius: "12px",
            border:
              "1px solid rgba(255,255,255,0.09)",
            background: "#0b1b2e",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {carregando ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            color: "#9bb0c8",
          }}
        >
          Carregando biblioteca...
        </div>
      ) : erro ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
          }}
        >
          <strong>
            Não foi possível carregar a biblioteca.
          </strong>

          <p>{erro}</p>
        </div>
      ) : midiasFiltradas.length === 0 ? (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            border:
              "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "16px",
          }}
        >
          <ImageIcon size={42} />

          <h2>Nenhuma mídia encontrada</h2>

          <p>
            As imagens e vídeos enviados aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="biblioteca-grid">
          {midiasFiltradas.map((midia) => (
            <article
              key={midia.id}
              className="biblioteca-card"
            >
              <div className="biblioteca-preview">
                {midia.tipo_midia === "video" ? (
                  <video
                    src={midia.arquivo_url}
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={midia.arquivo_url}
                    alt={midia.titulo || "Mídia"}
                  />
                )}

                <span className="biblioteca-tipo">
                  {midia.tipo_midia === "video" ? (
                    <>
                      <Video size={14} />
                      Vídeo
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} />
                      Imagem
                    </>
                  )}
                </span>
              </div>

              <div className="biblioteca-card-conteudo">
                <strong>
                  {midia.titulo || "Sem título"}
                </strong>

                <span>
                  {midia.cliente || "Sem cliente"}
                </span>

                <div className="biblioteca-card-acoes">
                  <button type="button">
                    Usar em anúncio
                  </button>

                  <button
                    type="button"
                    title="Excluir mídia"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}