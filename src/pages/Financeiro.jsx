import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Filter,
  Landmark,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import {
  CloudBadge,
  CloudButton,
  CloudCard,
  CloudEmptyState,
  CloudLoading,
  CloudSectionTitle,
  CloudStatus,
} from "../components/cloud";

import { buscarFinanceiro } from "../services/financeiroService";

import "./FinanceiroV2.css";

const filtrosStatus = [
  {
    id: "todos",
    label: "Todas",
  },
  {
    id: "pago",
    label: "Pagas",
  },
  {
    id: "pendente",
    label: "Pendentes",
  },
  {
    id: "vence-em-breve",
    label: "Vencendo",
  },
  {
    id: "atrasado",
    label: "Atrasadas",
  },
];

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterStatusCobranca(status) {
  const statusMap = {
    pago: {
      label: "Pago",
      variant: "success",
      cloudStatus: "online",
    },
    pendente: {
      label: "Pendente",
      variant: "blue",
      cloudStatus: "pending",
    },
    "vence-em-breve": {
      label: "Vence em breve",
      variant: "warning",
      cloudStatus: "pending",
    },
    atrasado: {
      label: "Em atraso",
      variant: "danger",
      cloudStatus: "offline",
    },
    cancelado: {
      label: "Cancelado",
      variant: "neutral",
      cloudStatus: "neutral",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      variant: "neutral",
      cloudStatus: "neutral",
    }
  );
}

function ResumoFinanceiro({ resumo }) {
  const cards = [
    {
      titulo: "Receita mensal",
      valor: formatarMoeda(resumo.receitaMensal),
      detalhe: "Receita recorrente atual",
      icon: CircleDollarSign,
      classe: "receita",
      tendencia: "+17,8%",
      positiva: true,
    },
    {
      titulo: "Recebido no mês",
      valor: formatarMoeda(resumo.recebidoMes),
      detalhe: "Pagamentos confirmados",
      icon: CheckCircle2,
      classe: "recebido",
      tendencia: "71,2%",
      positiva: true,
    },
    {
      titulo: "Em aberto",
      valor: formatarMoeda(resumo.totalEmAberto),
      detalhe: "Cobranças aguardando",
      icon: Clock3,
      classe: "aberto",
      tendencia: "4 cobranças",
      positiva: false,
    },
    {
      titulo: "Em atraso",
      valor: formatarMoeda(resumo.totalAtrasado),
      detalhe: "Valores inadimplentes",
      icon: AlertTriangle,
      classe: "atrasado",
      tendencia: "1 cliente",
      positiva: false,
    },
    {
      titulo: "Despesas",
      valor: formatarMoeda(resumo.despesasMes),
      detalhe: "Custos deste mês",
      icon: ArrowDownRight,
      classe: "despesas",
      tendencia: "30,3%",
      positiva: false,
    },
    {
      titulo: "Lucro estimado",
      valor: formatarMoeda(resumo.lucroEstimado),
      detalhe: `${resumo.margemLucro.toFixed(1)}% de margem`,
      icon: TrendingUp,
      classe: "lucro",
      tendencia: "+12,4%",
      positiva: true,
    },
  ];

  return (
    <section className="cf-financeiro-resumo">
      {cards.map((item) => {
        const Icon = item.icon;
        const TrendIcon = item.positiva
          ? ArrowUpRight
          : ArrowDownRight;

        return (
          <article
            key={item.titulo}
            className={`cf-financeiro-resumo-card ${item.classe}`}
          >
            <header>
              <span className="cf-financeiro-resumo-icon">
                <Icon size={21} />
              </span>

              <span
                className={
                  item.positiva
                    ? "cf-financeiro-tendencia positiva"
                    : "cf-financeiro-tendencia neutra"
                }
              >
                <TrendIcon size={12} />
                {item.tendencia}
              </span>
            </header>

            <strong>{item.valor}</strong>
            <span>{item.titulo}</span>
            <small>{item.detalhe}</small>
          </article>
        );
      })}
    </section>
  );
}

function GraficoComparativo({ dados }) {
  const maiorValor = Math.max(
    ...dados.flatMap((item) => [
      item.receita,
      item.despesas,
    ]),
    1
  );

  return (
    <CloudCard className="cf-financeiro-chart-card">
      <div className="cf-financeiro-card-title">
        <div>
          <span>
            <BarChart3 size={18} />
          </span>

          <div>
            <h3>Fluxo financeiro</h3>
            <p>Receitas e despesas dos últimos meses</p>
          </div>
        </div>

        <CloudBadge variant="success">
          Crescimento
        </CloudBadge>
      </div>

      <div className="cf-financeiro-chart-legend">
        <span>
          <i className="receita" />
          Receitas
        </span>

        <span>
          <i className="despesa" />
          Despesas
        </span>
      </div>

      <div className="cf-financeiro-chart">
        {dados.map((item) => {
          const alturaReceita =
            (item.receita / maiorValor) * 100;

          const alturaDespesa =
            (item.despesas / maiorValor) * 100;

          return (
            <div
              key={item.mes}
              className="cf-financeiro-chart-column"
            >
              <div className="cf-financeiro-chart-bars">
                <span
                  className="receita"
                  style={{
                    height: `${alturaReceita}%`,
                  }}
                  title={formatarMoeda(item.receita)}
                />

                <span
                  className="despesa"
                  style={{
                    height: `${alturaDespesa}%`,
                  }}
                  title={formatarMoeda(item.despesas)}
                />
              </div>

              <strong>{item.mes}</strong>
            </div>
          );
        })}
      </div>
    </CloudCard>
  );
}

function ReceitaPorServico({ dados }) {
  return (
    <CloudCard className="cf-financeiro-services-card">
      <div className="cf-financeiro-card-title">
        <div>
          <span>
            <WalletCards size={18} />
          </span>

          <div>
            <h3>Receita por serviço</h3>
            <p>Participação no faturamento mensal</p>
          </div>
        </div>
      </div>

      <div className="cf-financeiro-services-list">
        {dados.map((item) => (
          <article key={item.id}>
            <header>
              <div>
                <strong>{item.nome}</strong>
                <small>{formatarMoeda(item.valor)}</small>
              </div>

              <span>{item.percentual}%</span>
            </header>

            <div className="cf-financeiro-progress">
              <span
                style={{
                  width: `${item.percentual}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </CloudCard>
  );
}

function CobrancaCard({ cobranca, aoSelecionar }) {
  const status = obterStatusCobranca(cobranca.status);

  return (
    <button
      type="button"
      className="cf-cobranca-card"
      onClick={() => aoSelecionar(cobranca)}
    >
      <div className="cf-cobranca-cliente">
        <span>
          {cobranca.cliente
            .split(" ")
            .slice(0, 2)
            .map((parte) => parte[0])
            .join("")
            .toUpperCase()}
        </span>

        <div>
          <small>{cobranca.codigo}</small>
          <strong>{cobranca.cliente}</strong>
          <p>{cobranca.descricao}</p>
        </div>
      </div>

      <div className="cf-cobranca-referencia">
        <small>Referência</small>
        <strong>{cobranca.referencia}</strong>
        <span>{cobranca.servico}</span>
      </div>

      <div className="cf-cobranca-vencimento">
        <small>Vencimento</small>
        <strong>{cobranca.vencimentoFormatado}</strong>

        {cobranca.diasAtraso > 0 && (
          <span>{cobranca.diasAtraso} dias em atraso</span>
        )}
      </div>

      <div className="cf-cobranca-status">
        <CloudStatus
          status={status.cloudStatus}
          label={status.label}
        />

        <small>{cobranca.formaPagamento}</small>
      </div>

      <div className="cf-cobranca-valor">
        <small>Valor</small>
        <strong>{formatarMoeda(cobranca.valor)}</strong>

        <span>
          Ver detalhes
          <ArrowRight size={13} />
        </span>
      </div>
    </button>
  );
}

function PainelCobranca({ cobranca, aoFechar }) {
  if (!cobranca) {
    return null;
  }

  const status = obterStatusCobranca(cobranca.status);

  return (
    <div className="cf-financeiro-panel-overlay">
      <button
        type="button"
        className="cf-financeiro-panel-backdrop"
        onClick={aoFechar}
        aria-label="Fechar detalhes"
      />

      <aside className="cf-financeiro-panel">
        <header className="cf-financeiro-panel-header">
          <div>
            <span>{cobranca.codigo}</span>
            <h2>Detalhes da cobrança</h2>
            <p>{cobranca.cliente}</p>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar painel"
          >
            <X size={21} />
          </button>
        </header>

        <div className="cf-financeiro-panel-content">
          <section className="cf-financeiro-panel-value">
            <small>Valor da cobrança</small>
            <strong>{formatarMoeda(cobranca.valor)}</strong>

            <CloudBadge variant={status.variant}>
              {status.label}
            </CloudBadge>
          </section>

          <section className="cf-financeiro-panel-block">
            <h3>
              <FileText size={17} />
              Informações
            </h3>

            <div className="cf-financeiro-detail-grid">
              <div>
                <small>Cliente</small>
                <strong>{cobranca.cliente}</strong>
              </div>

              <div>
                <small>Referência</small>
                <strong>{cobranca.referencia}</strong>
              </div>

              <div>
                <small>Descrição</small>
                <strong>{cobranca.descricao}</strong>
              </div>

              <div>
                <small>Categoria</small>
                <strong>{cobranca.categoria}</strong>
              </div>

              <div>
                <small>Serviço</small>
                <strong>{cobranca.servico}</strong>
              </div>

              <div>
                <small>Forma de pagamento</small>
                <strong>{cobranca.formaPagamento}</strong>
              </div>
            </div>
          </section>

          <section className="cf-financeiro-panel-block">
            <h3>
              <CalendarDays size={17} />
              Datas
            </h3>

            <div className="cf-financeiro-detail-grid">
              <div>
                <small>Vencimento</small>
                <strong>
                  {cobranca.vencimentoFormatado}
                </strong>
              </div>

              <div>
                <small>Pagamento</small>
                <strong>
                  {cobranca.pagamentoFormatado}
                </strong>
              </div>
            </div>
          </section>

          {cobranca.status === "atrasado" && (
            <section className="cf-financeiro-warning">
              <AlertTriangle size={19} />

              <div>
                <strong>Cobrança em atraso</strong>
                <p>
                  Este pagamento está atrasado há{" "}
                  {cobranca.diasAtraso} dias.
                </p>
              </div>
            </section>
          )}
        </div>

        <footer className="cf-financeiro-panel-actions">
          <CloudButton
            variant="secondary"
            icon={FileText}
          >
            Gerar recibo
          </CloudButton>

          <CloudButton
            variant="secondary"
            icon={CreditCard}
          >
            Enviar cobrança
          </CloudButton>

          {cobranca.status !== "pago" && (
            <CloudButton
              icon={CheckCircle2}
              fullWidth
            >
              Registrar pagamento
            </CloudButton>
          )}
        </footer>
      </aside>
    </div>
  );
}

export default function Financeiro() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState("todos");

  const [cobrancaSelecionada, setCobrancaSelecionada] =
    useState(null);

  async function carregarFinanceiro() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await buscarFinanceiro();

      setDados(resposta);
    } catch (error) {
      console.error(
        "Erro ao carregar financeiro:",
        error
      );

      setErro(
        "Não foi possível carregar as informações financeiras."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  const cobrancasFiltradas = useMemo(() => {
    if (!dados) {
      return [];
    }

    const termo = normalizarTexto(pesquisa);

    return dados.cobrancas.filter((cobranca) => {
      const correspondePesquisa =
        !termo ||
        [
          cobranca.cliente,
          cobranca.codigo,
          cobranca.descricao,
          cobranca.referencia,
          cobranca.servico,
        ].some((valor) =>
          normalizarTexto(valor).includes(termo)
        );

      const correspondeStatus =
        filtroStatus === "todos" ||
        cobranca.status === filtroStatus;

      return correspondePesquisa && correspondeStatus;
    });
  }, [dados, pesquisa, filtroStatus]);

  function limparFiltros() {
    setPesquisa("");
    setFiltroStatus("todos");
  }

  if (carregando) {
    return (
      <div className="cf-financeiro-page">
        <CloudLoading
          title="Carregando financeiro"
          description="Consultando receitas, cobranças e despesas."
        />
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="cf-financeiro-page">
        <CloudEmptyState
          icon={AlertTriangle}
          title="Financeiro indisponível"
          description={
            erro ||
            "Não foi possível encontrar os dados financeiros."
          }
          actionLabel="Tentar novamente"
          actionIcon={RefreshCw}
          onAction={carregarFinanceiro}
        />
      </div>
    );
  }

  return (
    <div className="cf-financeiro-page">
      <CloudSectionTitle
        eyebrow="GESTÃO FINANCEIRA"
        title="Financeiro"
        description="Acompanhe receitas, cobranças, inadimplência, despesas e o desempenho financeiro da operação."
        icon={Landmark}
        action={
          <div className="cf-financeiro-header-actions">
            <CloudButton
              variant="secondary"
              icon={Download}
            >
              Exportar
            </CloudButton>

            <CloudButton icon={Plus}>
              Nova cobrança
            </CloudButton>
          </div>
        }
      />

      <ResumoFinanceiro resumo={dados.resumo} />

      <section className="cf-financeiro-analytics">
        <GraficoComparativo
          dados={dados.comparativoMensal}
        />

        <ReceitaPorServico
          dados={dados.receitaPorServico}
        />
      </section>

      <CloudCard
        className="cf-financeiro-filter-card"
        padding="small"
      >
        <div className="cf-financeiro-filters">
          <label className="cf-financeiro-search">
            <Search size={18} />

            <input
              type="search"
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(event.target.value)
              }
              placeholder="Pesquisar por cliente, cobrança, referência ou serviço..."
            />

            {pesquisa && (
              <button
                type="button"
                onClick={() => setPesquisa("")}
                aria-label="Limpar pesquisa"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="cf-financeiro-status-filter">
            {filtrosStatus.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                className={
                  filtroStatus === filtro.id
                    ? "ativo"
                    : ""
                }
                onClick={() =>
                  setFiltroStatus(filtro.id)
                }
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <CloudButton
            variant="ghost"
            icon={Filter}
            onClick={limparFiltros}
          >
            Limpar
          </CloudButton>
        </div>
      </CloudCard>

      <div className="cf-financeiro-section-header">
        <div>
          <Receipt size={18} />

          <span>
            Cobranças encontradas:{" "}
            <strong>
              {cobrancasFiltradas.length}
            </strong>
          </span>
        </div>

        <CloudBadge variant="success" pulse>
          Financeiro operacional
        </CloudBadge>
      </div>

      {cobrancasFiltradas.length > 0 ? (
        <CloudCard
          className="cf-financeiro-cobrancas"
          padding="none"
        >
          <div className="cf-cobrancas-table-header">
            <span>Cliente</span>
            <span>Referência</span>
            <span>Vencimento</span>
            <span>Status</span>
            <span>Valor</span>
          </div>

          <div className="cf-cobrancas-list">
            {cobrancasFiltradas.map((cobranca) => (
              <CobrancaCard
                key={cobranca.id}
                cobranca={cobranca}
                aoSelecionar={setCobrancaSelecionada}
              />
            ))}
          </div>
        </CloudCard>
      ) : (
        <CloudCard>
          <CloudEmptyState
            icon={Search}
            title="Nenhuma cobrança encontrada"
            description="Não existem cobranças correspondentes aos filtros selecionados."
            actionLabel="Limpar filtros"
            actionIcon={X}
            onAction={limparFiltros}
          />
        </CloudCard>
      )}

      <PainelCobranca
        cobranca={cobrancaSelecionada}
        aoFechar={() =>
          setCobrancaSelecionada(null)
        }
      />
    </div>
  );
}