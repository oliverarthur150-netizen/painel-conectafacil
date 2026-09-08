function obterSaudacao() {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Bom dia";
  }

  if (hora < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export default function Saudacao() {
  const hoje = new Date();

  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="dashboard-saudacao">
      <div className="dashboard-saudacao-textos">
        <span className="dashboard-saudacao-etiqueta">
          CONECTAFÁCIL CLOUD
        </span>

        <h1>
          {obterSaudacao()}, Diogo! 👋
        </h1>

        <p>
          Hoje é {dataFormatada}. O sistema está funcionando
          normalmente.
        </p>
      </div>

      <div className="dashboard-saudacao-status">
        <span className="dashboard-status-ponto" />

        <div>
          <strong>Operação normal</strong>
          <small>Todos os serviços disponíveis</small>
        </div>
      </div>
    </section>
  );
}