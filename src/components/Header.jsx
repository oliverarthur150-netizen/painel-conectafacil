export default function Header({
  data,
  hora,
  clima,
  temperatura,
}) {
  return (
    <header className="header-premium">

      <div className="header-logo">
        <img
          src="/logo.png"
          alt="ConectaFácil"
        />

        <div className="header-titulos">
          <span className="header-sistema">
            CONECTAFÁCIL
          </span>

          <small>
            TV Indoor Inteligente
          </small>
        </div>
      </div>

      <div className="header-centro">

        <div className="header-chip">
          🚢 Travessia Cabedelo • Lucena
        </div>

      </div>

      <div className="header-direita">

        <div className="header-data">
          {data}
        </div>

        <div className="header-hora">
          {hora}
        </div>

        <div className="header-informacoes">

          <span className="header-clima">
            {clima} {temperatura}
          </span>

          <span className="header-online">
            <span className="header-ponto" />
            Online
          </span>

        </div>

      </div>

    </header>
  )
}