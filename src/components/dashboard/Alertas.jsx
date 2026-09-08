import NeoCard from "../ui/NeoCard";

const alertas = [
  {
    titulo: "TV Balsa 01 offline",
    descricao: "Sem comunicação há 18 minutos.",
    tipo: "erro",
    icone: "📺",
  },
  {
    titulo: "Mensalidade vence hoje",
    descricao: "Supermercado Beira Mar precisa de atenção.",
    tipo: "aviso",
    icone: "💳",
  },
  {
    titulo: "Campanhas agendadas",
    descricao: "5 campanhas iniciam hoje às 08:00.",
    tipo: "info",
    icone: "📅",
  },
];

export default function Alertas() {
  return (
    <NeoCard destaque="laranja" className="dashboard-painel">
      <div className="dashboard-painel-topo">
        <div>
          <span className="dashboard-painel-etiqueta">
            CENTRAL DE ATENÇÃO
          </span>

          <h2>Alertas importantes</h2>
        </div>

        <span className="dashboard-alertas-total">
          {alertas.length}
        </span>
      </div>

      <div className="dashboard-alertas-lista">
        {alertas.map((alerta) => (
          <article
            key={alerta.titulo}
            className={`dashboard-alerta ${alerta.tipo}`}
          >
            <span className="dashboard-alerta-icone">
              {alerta.icone}
            </span>

            <div>
              <strong>{alerta.titulo}</strong>
              <p>{alerta.descricao}</p>
            </div>
          </article>
        ))}
      </div>
    </NeoCard>
  );
}