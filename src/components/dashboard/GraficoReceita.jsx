const meses = [
  { mes: "Fev", valor: 42 },
  { mes: "Mar", valor: 55 },
  { mes: "Abr", valor: 49 },
  { mes: "Mai", valor: 68 },
  { mes: "Jun", valor: 76 },
  { mes: "Jul", valor: 88 },
];

export default function GraficoReceita() {
  return (
    <section className="dashboard-painel dashboard-grafico-painel">
      <div className="dashboard-painel-topo">
        <div>
          <span className="dashboard-painel-etiqueta">
            DESEMPENHO FINANCEIRO
          </span>

          <h2>Receita dos últimos meses</h2>
        </div>

        <div className="dashboard-grafico-total">
          <small>Receita atual</small>
          <strong>R$ 12.850</strong>
        </div>
      </div>

      <div className="dashboard-grafico">
        {meses.map((item) => (
          <div
            key={item.mes}
            className="dashboard-grafico-coluna"
          >
            <div className="dashboard-grafico-area">
              <span
                className="dashboard-grafico-barra"
                style={{ height: `${item.valor}%` }}
              />
            </div>

            <small>{item.mes}</small>
          </div>
        ))}
      </div>
    </section>
  );
}