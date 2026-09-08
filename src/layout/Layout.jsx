import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function Layout({
  children,
  paginaInicial = "dashboard",
}) {
  const [paginaAtual, setPaginaAtual] =
    useState(paginaInicial)

  const titulos = {
    dashboard: {
      titulo: "Dashboard",
      subtitulo: "Visão geral do sistema",
    },
    anuncios: {
      titulo: "Anúncios",
      subtitulo: "Gerencie campanhas e mídias",
    },
    tvs: {
      titulo: "TVs",
      subtitulo: "Gerencie telas e dispositivos",
    },
    embarques: {
      titulo: "Embarques",
      subtitulo: "Controle horários e viagens",
    },
    clientes: {
      titulo: "Clientes",
      subtitulo: "Gerencie seus anunciantes",
    },
    biblioteca: {
      titulo: "Biblioteca",
      subtitulo: "Imagens e vídeos enviados",
    },
    relatorios: {
      titulo: "Relatórios",
      subtitulo: "Acompanhe resultados e desempenho",
    },
    configuracoes: {
      titulo: "Configurações",
      subtitulo: "Preferências do ConectaFácil",
    },
  }

  const cabecalho =
    titulos[paginaAtual] || titulos.dashboard

  return (
    <div className="control-layout">
      <Sidebar
        paginaAtual={paginaAtual}
        onMudarPagina={setPaginaAtual}
      />

      <div className="control-layout-principal">
        <Header
          titulo={cabecalho.titulo}
          subtitulo={cabecalho.subtitulo}
        />

        <main className="control-conteudo">
          {typeof children === "function"
            ? children({
                paginaAtual,
                setPaginaAtual,
              })
            : children}
        </main>
      </div>
    </div>
  )
}