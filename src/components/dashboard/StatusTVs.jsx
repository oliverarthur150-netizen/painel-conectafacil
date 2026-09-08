const telas = [
  {
    nome: "Lancha 01",
    local: "Travessia Cabedelo • Lucena",
    status: "online",
    detalhe: "Sincronizada agora",
  },
  {
    nome: "Lancha 02",
    local: "Travessia Lucena • Cabedelo",
    status: "online",
    detalhe: "Sincronizada há 1 minuto",
  },
  {
    nome: "Balsa 01",
    local: "Terminal de veículos",
    status: "offline",
    detalhe: "Sem conexão há 18 minutos",
  },
  {
    nome: "Rodoviária",
    local: "Terminal principal",
    status: "online",
    detalhe: "Sincronizada há 3 minutos",
  },
  {
    nome: "Mercado Público",
    local: "Área central",
    status: "online",
    detalhe: "Sincronizada há 4 minutos",
  },
];

export default function StatusTVs() {
  return (
    <section className="dashboard-painel">
      <div className="dashboard-painel-topo">
        <div>
          <span className="dashboard-painel-etiqueta">
            MONITORAMENTO
          </span>

          <h2>Status das TVs</h2>
        </div>

        <span className="dashboard-contador-online">
          4 online
        </span>
      </div>

      <div className="dashboard-telas-lista">
        {telas.map((tela) => (
          <article
            key={tela.nome}
            className="dashboard-tela-item"
          >
            <span
              className={`dashboard-tela-status ${tela.status}`}
            />

            <div className="dashboard-tela-textos">
              <strong>{tela.nome}</strong>
              <span>{tela.local}</span>
            </div>

            <small>{tela.detalhe}</small>
          </article>
        ))}
      </div>
    </section>
  );
}