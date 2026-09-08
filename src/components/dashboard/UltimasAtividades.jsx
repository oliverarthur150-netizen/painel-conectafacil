const atividades = [
  {
    titulo: "TV Lancha 01 sincronizada",
    descricao: "A programação foi atualizada com sucesso.",
    tempo: "Há 2 minutos",
    icone: "✅",
  },
  {
    titulo: "Nova campanha publicada",
    descricao: "Campanha Mercado Central enviada para 3 telas.",
    tempo: "Há 18 minutos",
    icone: "📢",
  },
  {
    titulo: "Novo cliente cadastrado",
    descricao: "Supermercado Beira Mar entrou na plataforma.",
    tempo: "Há 1 hora",
    icone: "👥",
  },
  {
    titulo: "Backup concluído",
    descricao: "Os dados do sistema foram protegidos.",
    tempo: "Hoje, 01:30",
    icone: "☁️",
  },
];

export default function UltimasAtividades() {
  return (
    <section className="dashboard-painel">
      <div className="dashboard-painel-topo">
        <div>
          <span className="dashboard-painel-etiqueta">
            MOVIMENTAÇÕES RECENTES
          </span>

          <h2>Últimas atividades</h2>
        </div>

        <button type="button" className="dashboard-botao-link">
          Ver todas
        </button>
      </div>

      <div className="dashboard-atividades-lista">
        {atividades.map((atividade) => (
          <article
            key={`${atividade.titulo}-${atividade.tempo}`}
            className="dashboard-atividade"
          >
            <span className="dashboard-atividade-icone">
              {atividade.icone}
            </span>

            <div className="dashboard-atividade-textos">
              <strong>{atividade.titulo}</strong>
              <p>{atividade.descricao}</p>
            </div>

            <small>{atividade.tempo}</small>
          </article>
        ))}
      </div>
    </section>
  );
}