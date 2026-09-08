export default function Header({
  titulo = "Dashboard",
  subtitulo = "Visão geral do sistema",
}) {
  const agora = new Date()

  const hora = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const data = agora.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <header className="control-header">
      <div className="control-header-titulo">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      <div className="control-header-direita">
        <div className="control-header-status">
          <span className="control-status-ponto" />
          Cloud conectado
        </div>

        <div className="control-header-data">
          <strong>{hora}</strong>
          <span>{data}</span>
        </div>

        <div className="control-header-usuario">
          <div className="control-header-avatar">
            D
          </div>

          <div>
            <strong>Administrador</strong>
            <span>ConectaFácil</span>
          </div>
        </div>
      </div>
    </header>
  )
}