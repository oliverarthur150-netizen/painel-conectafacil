import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Megaphone,
  Monitor,
  MoreHorizontal,
  Radio,
  Ship,
  TrendingUp,
  Tv,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import { buscarDashboard } from "../services/dashboardService";

import "./DashboardV2.css";

const iconesResumo = {
  telas: Tv,
  clientes: Users,
  campanhas: Megaphone,
  receita: CircleDollarSign,
};

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

function IconeAtividade({ tipo }) {
  if (tipo === "campanha") {
    return <Megaphone size={18} />;
  }

  if (tipo === "tela") {
    return <Monitor size={18} />;
  }

  if (tipo === "cliente") {
    return <Users size={18} />;
  }

  return <Clock3 size={18} />;
}

function DashboardCarregando() {
  return (
    <div className="cf-dashboard-v2">
      <section className="cf-dashboard-hero">
        <div className="cf-dashboard-hero-conteudo">
          <span className="cf-dashboard-hero-etiqueta">
            CONECTAFÁCIL CLOUD
          </span>

          <h1>Carregando painel...</h1>

          <p>
            Estamos organizando as informações da sua operação.
          </p>
        </div>
      </section>
    </div>
  );
}

function DashboardErro({ aoTentarNovamente }) {
  return (
    <div className="cf-dashboard-v2">
      <section className="cf-dashboard-hero">
        <div className="cf-dashboard-hero-conteudo">
          <span className="cf-dashboard-hero-etiqueta">
            CONECTAFÁCIL CLOUD
          </span>

          <h1>Não foi possível carregar o painel</h1>

          <p>
            Ocorreu um problema ao consultar as informações.
          </p>

          <div className="cf-dashboard-hero-acoes">
            <button
              type="button"
              className="cf-dashboard-botao-principal"
              onClick={aoTentarNovamente}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro(false);

      const resposta = await buscarDashboard();

      setDados(resposta);
    } catch (error) {
      console.error(
        "Erro ao carregar o Dashboard:",
        error
      );

      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  if (carregando) {
    return <DashboardCarregando />;
  }

  if (erro || !dados) {
    return (
      <DashboardErro
        aoTentarNovamente={carregarDashboard}
      />
    );
  }

  const saudacao = obterSaudacao();

  return (
    <div className="cf-dashboard-v2">
      <section className="cf-dashboard-hero">
        <div className="cf-dashboard-hero-conteudo">
          <span className="cf-dashboard-hero-etiqueta">
            CONECTAFÁCIL CLOUD
          </span>

          <h1>
            {saudacao}, {dados.usuario.nome}!

            <span className="cf-dashboard-aceno">
              👋
            </span>
          </h1>

          <p>
            Acompanhe toda a operação das telas, clientes,
            campanhas e receitas em um único lugar.
          </p>

          <div className="cf-dashboard-hero-acoes">
            <button
              type="button"
              className="cf-dashboard-botao-principal"
            >
              <TrendingUp size={18} />
              Gerar relatório
            </button>

            <button
              type="button"
              className="cf-dashboard-botao-secundario"
            >
              Ver atividades
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>

        <div className="cf-dashboard-operacao">
          <div className="cf-dashboard-operacao-icone">
            <Radio size={26} />
          </div>

          <div>
            <span>STATUS DA OPERAÇÃO</span>

            <strong>
              {dados.operacao.titulo}
            </strong>

            <p>
              <i />
              {dados.operacao.descricao}
            </p>
          </div>
        </div>

        <span className="cf-dashboard-hero-brilho um" />
        <span className="cf-dashboard-hero-brilho dois" />
      </section>

      <section className="cf-dashboard-resumo">
        {dados.resumo.map((item) => {
          const Icone =
            iconesResumo[item.icone] || Activity;

          return (
            <article
              key={item.id}
              className={`cf-dashboard-card-resumo ${item.cor}`}
            >
              <div className="cf-dashboard-card-topo">
                <span className="cf-dashboard-card-icone">
                  <Icone size={22} />
                </span>

                <button
                  type="button"
                  aria-label={`Opções de ${item.titulo}`}
                >
                  <MoreHorizontal size={19} />
                </button>
              </div>

              <div className="cf-dashboard-card-valor">
                <strong>{item.valor}</strong>
                <span>{item.titulo}</span>
              </div>

              <div className="cf-dashboard-card-rodape">
                <span>{item.detalhe}</span>

                <small>
                  <TrendingUp size={13} />
                  {item.tendencia}
                </small>
              </div>

              <span className="cf-dashboard-card-luz" />
            </article>
          );
        })}
      </section>

      <section className="cf-dashboard-grid-principal">
        <article className="cf-dashboard-painel cf-dashboard-receita">
          <div className="cf-dashboard-painel-topo">
            <div>
              <span className="cf-dashboard-painel-etiqueta">
                DESEMPENHO FINANCEIRO
              </span>

              <h2>Receita mensal</h2>

              <p>
                Evolução dos recebimentos nos últimos seis meses.
              </p>
            </div>

            <div className="cf-dashboard-receita-total">
              <span>Total no período</span>

              <strong>
                {dados.financeiro.totalPeriodo}
              </strong>

              <small>
                <TrendingUp size={14} />
                {dados.financeiro.crescimento}
              </small>
            </div>
          </div>

          <div className="cf-dashboard-grafico">
            <div className="cf-dashboard-grafico-linhas">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="cf-dashboard-grafico-colunas">
              {dados.financeiro.meses.map((item) => (
                <div
                  key={item.mes}
                  className="cf-dashboard-grafico-item"
                >
                  <div className="cf-dashboard-grafico-barra-area">
                    <span
                      className="cf-dashboard-grafico-barra"
                      style={{
                        height: `${item.valor}%`,
                      }}
                    >
                      <i>{item.valor}%</i>
                    </span>
                  </div>

                  <small>{item.mes}</small>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="cf-dashboard-painel cf-dashboard-status">
          <div className="cf-dashboard-painel-topo">
            <div>
              <span className="cf-dashboard-painel-etiqueta">
                MONITORAMENTO
              </span>

              <h2>Status das telas</h2>

              <p>
                Conexão e atualização dos equipamentos.
              </p>
            </div>

            <span className="cf-dashboard-status-geral">
              <Wifi size={16} />
              90% online
            </span>
          </div>

          <div className="cf-dashboard-telas-lista">
            {dados.telas.map((tv) => (
              <article
                key={tv.id}
                className={`cf-dashboard-tv ${tv.status}`}
              >
                <span className="cf-dashboard-tv-icone">
                  {tv.status === "online" ? (
                    <Wifi size={18} />
                  ) : (
                    <WifiOff size={18} />
                  )}
                </span>

                <div className="cf-dashboard-tv-info">
                  <strong>{tv.nome}</strong>
                  <span>{tv.local}</span>
                </div>

                <div className="cf-dashboard-tv-status">
                  <strong>
                    <i />

                    {tv.status === "online"
                      ? "Online"
                      : "Offline"}
                  </strong>

                  <span>{tv.atividade}</span>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="cf-dashboard-link"
          >
            Ver todas as telas
            <ArrowUpRight size={16} />
          </button>
        </article>
      </section>

      <section className="cf-dashboard-grid-secundario">
        <article className="cf-dashboard-painel">
          <div className="cf-dashboard-painel-topo">
            <div>
              <span className="cf-dashboard-painel-etiqueta">
                MOVIMENTAÇÕES
              </span>

              <h2>Atividades recentes</h2>

              <p>
                Últimas ações registradas no sistema.
              </p>
            </div>

            <Activity size={23} />
          </div>

          <div className="cf-dashboard-atividades">
            {dados.atividades.map((atividade) => (
              <article
                key={atividade.id}
                className="cf-dashboard-atividade"
              >
                <span
                  className={`cf-dashboard-atividade-icone ${atividade.tipo}`}
                >
                  <IconeAtividade
                    tipo={atividade.tipo}
                  />
                </span>

                <div>
                  <strong>
                    {atividade.titulo}
                  </strong>

                  <span>
                    {atividade.descricao}
                  </span>
                </div>

                <small>{atividade.horario}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="cf-dashboard-painel">
          <div className="cf-dashboard-painel-topo">
            <div>
              <span className="cf-dashboard-painel-etiqueta">
                CENTRAL DE ATENÇÃO
              </span>

              <h2>Alertas importantes</h2>

              <p>
                Pontos que precisam ser acompanhados.
              </p>
            </div>

            <span className="cf-dashboard-alertas-total">
              {dados.alertas.length}
            </span>
          </div>

          <div className="cf-dashboard-alertas">
            {dados.alertas.map((alerta) => (
              <article
                key={alerta.id}
                className={`cf-dashboard-alerta ${alerta.tipo}`}
              >
                <span className="cf-dashboard-alerta-icone">
                  {alerta.tipo === "erro" && (
                    <AlertTriangle size={19} />
                  )}

                  {alerta.tipo === "aviso" && (
                    <Clock3 size={19} />
                  )}

                  {alerta.tipo === "info" && (
                    <CheckCircle2 size={19} />
                  )}
                </span>

                <div>
                  <strong>{alerta.titulo}</strong>
                  <p>{alerta.descricao}</p>
                </div>

                <button
                  type="button"
                  aria-label={`Abrir alerta ${alerta.titulo}`}
                >
                  <ArrowUpRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="cf-dashboard-rodape-status">
        <div>
          <span className="cf-dashboard-rodape-icone">
            <Ship size={21} />
          </span>

          <div>
            <strong>
              {dados.travessia.titulo}
            </strong>

            <p>
              {dados.travessia.descricao}
            </p>
          </div>
        </div>

        <span>
          <i />
          {dados.travessia.atualizadoEm}
        </span>
      </section>
    </div>
  );
}