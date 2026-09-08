const itensMenu = [
  { id: "dashboard", icone: "🏠", texto: "Dashboard" },
  { id: "anuncios", icone: "📢", texto: "Anúncios" },
  { id: "tvs", icone: "📺", texto: "TVs" },
  { id: "embarques", icone: "🛥️", texto: "Embarques" },
  { id: "clientes", icone: "👥", texto: "Clientes" },
  { id: "da-sorte", icone: "🍀", texto: "DA SORTE" },
  { id: "biblioteca", icone: "🖼️", texto: "Biblioteca" },
  { id: "relatorios", icone: "📊", texto: "Relatórios" },
  { id: "configuracoes", icone: "⚙️", texto: "Configurações" },
]

export default function Sidebar({
  paginaAtual = "dashboard",
  onMudarPagina,
}) {
  return (
    <aside className="control-sidebar">
      <div className="control-sidebar-topo">
        <div className="control-sidebar-logo">
          <div className="control-sidebar-logo-icone">
            C
          </div>

          <div>
            <strong>ConectaFácil</strong>
            <span>Control Center</span>
          </div>
        </div>

        <div className="control-sidebar-status">
          <span className="control-status-ponto" />
          Sistema online
        </div>
      </div>

      <nav className="control-sidebar-menu">
        {itensMenu.map((item) => {
          const ativo = paginaAtual === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={
                ativo
                  ? "control-menu-item control-menu-item-ativo"
                  : "control-menu-item"
              }
              onClick={() =>
                onMudarPagina?.(item.id)
              }
            >
              <span className="control-menu-icone">
                {item.icone}
              </span>

              <span>{item.texto}</span>
            </button>
          )
        })}
      </nav>

      <div className="control-sidebar-rodape">
        <strong>ConectaFácil TV</strong>
        <span>Versão 1.0 PRO</span>
      </div>
    </aside>
  )
}