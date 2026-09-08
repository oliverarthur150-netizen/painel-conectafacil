import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  FileText,
  Filter,
  Mail,
  MapPin,
  Monitor,
  MoreVertical,
  Phone,
  Plus,
  Radio,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
  Wifi,
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

import { buscarClientes } from "../services/clientesService";

import "./ClientesV2.css";

const filtrosStatus = [
  {
    id: "todos",
    label: "Todos",
  },
  {
    id: "ativo",
    label: "Ativos",
  },
  {
    id: "implantacao",
    label: "Implantação",
  },
  {
    id: "inadimplente",
    label: "Inadimplentes",
  },
  {
    id: "inativo",
    label: "Inativos",
  },
];

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function obterStatusCliente(status) {
  const statusMap = {
    ativo: {
      label: "Ativo",
      cloudStatus: "online",
      badge: "success",
    },
    implantacao: {
      label: "Em implantação",
      cloudStatus: "pending",
      badge: "blue",
    },
    inadimplente: {
      label: "Inadimplente",
      cloudStatus: "offline",
      badge: "danger",
    },
    inativo: {
      label: "Inativo",
      cloudStatus: "neutral",
      badge: "neutral",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      cloudStatus: "neutral",
      badge: "neutral",
    }
  );
}

function obterStatusFinanceiro(status) {
  const statusMap = {
    "em-dia": {
      label: "Em dia",
      variant: "success",
    },
    "vence-em-breve": {
      label: "Vence em breve",
      variant: "warning",
    },
    aguardando: {
      label: "Aguardando",
      variant: "blue",
    },
    atrasado: {
      label: "Em atraso",
      variant: "danger",
    },
    cancelado: {
      label: "Cancelado",
      variant: "neutral",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      variant: "neutral",
    }
  );
}

function obterIconeServico(servicoId) {
  const icones = {
    "tv-indoor": Monitor,
    "wifi-turbo": Wifi,
    "cidade-conectada": Radio,
    "card-facil": ReceiptText,
    publicidade: Smartphone,
    cameras: ShieldCheck,
  };

  return icones[servicoId] || CheckCircle2;
}

function ResumoClientes({ clientes }) {
  const ativos = clientes.filter(
    (cliente) => cliente.status === "ativo"
  ).length;

  const implantacao = clientes.filter(
    (cliente) => cliente.status === "implantacao"
  ).length;

  const inadimplentes = clientes.filter(
    (cliente) => cliente.status === "inadimplente"
  ).length;

  const receitaMensal = clientes
    .filter((cliente) => cliente.status !== "inativo")
    .reduce(
      (total, cliente) =>
        total + cliente.financeiro.mensalidade,
      0
    );

  const cards = [
    {
      titulo: "Clientes ativos",
      valor: ativos,
      detalhe: "Contratos em operação",
      icon: Users,
      classe: "ativos",
    },
    {
      titulo: "Em implantação",
      valor: implantacao,
      detalhe: "Projetos sendo ativados",
      icon: Clock3,
      classe: "implantacao",
    },
    {
      titulo: "Inadimplentes",
      valor: inadimplentes,
      detalhe: "Precisam de atenção",
      icon: AlertTriangle,
      classe: "inadimplentes",
    },
    {
      titulo: "Receita mensal",
      valor: formatarMoeda(receitaMensal),
      detalhe: "Receita recorrente estimada",
      icon: CircleDollarSign,
      classe: "receita",
    },
  ];

  return (
    <section className="cf-clientes-resumo">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.titulo}
            className={`cf-clientes-resumo-card ${item.classe}`}
          >
            <span className="cf-clientes-resumo-icon">
              <Icon size={22} />
            </span>

            <div>
              <strong>{item.valor}</strong>
              <span>{item.titulo}</span>
              <small>{item.detalhe}</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ClienteCard({ cliente, aoSelecionar }) {
  const status = obterStatusCliente(cliente.status);
  const financeiro = obterStatusFinanceiro(
    cliente.financeiro.statusPagamento
  );

  return (
    <CloudCard
      className="cf-cliente-card"
      padding="none"
      hover
    >
      <button
        type="button"
        className="cf-cliente-card-button"
        onClick={() => aoSelecionar(cliente)}
      >
        <header className="cf-cliente-card-header">
          <div className="cf-cliente-avatar">
            {cliente.nomeFantasia
              .split(" ")
              .slice(0, 2)
              .map((parte) => parte[0])
              .join("")
              .toUpperCase()}
          </div>

          <div className="cf-cliente-card-title">
            <span>{cliente.codigo}</span>
            <h3>{cliente.nomeFantasia}</h3>
            <p>{cliente.segmento}</p>
          </div>

          <span className="cf-cliente-card-menu">
            <MoreVertical size={18} />
          </span>
        </header>

        <div className="cf-cliente-card-status">
          <CloudStatus
            status={status.cloudStatus}
            label={status.label}
          />

          <CloudBadge variant={financeiro.variant}>
            {financeiro.label}
          </CloudBadge>
        </div>

        <div className="cf-cliente-card-info">
          <div>
            <MapPin size={15} />

            <span>
              <small>Cidade</small>
              <strong>
                {cliente.endereco.cidade} -{" "}
                {cliente.endereco.estado}
              </strong>
            </span>
          </div>

          <div>
            <ShieldCheck size={15} />

            <span>
              <small>Plano</small>
              <strong>{cliente.plano}</strong>
            </span>
          </div>

          <div>
            <Monitor size={15} />

            <span>
              <small>Telas</small>
              <strong>
                {cliente.estatisticas.telas}
              </strong>
            </span>
          </div>

          <div>
            <CircleDollarSign size={15} />

            <span>
              <small>Mensalidade</small>
              <strong>
                {formatarMoeda(
                  cliente.financeiro.mensalidade
                )}
              </strong>
            </span>
          </div>
        </div>

        <div className="cf-cliente-card-services">
          {cliente.servicos.slice(0, 3).map((servico) => {
            const ServiceIcon = obterIconeServico(
              servico.id
            );

            return (
              <span key={servico.id}>
                <ServiceIcon size={13} />
                {servico.nome}
              </span>
            );
          })}
        </div>

        <footer className="cf-cliente-card-footer">
          <span>
            <CalendarDays size={14} />
            Vence dia{" "}
            {cliente.financeiro.diaVencimento}
          </span>

          <strong>
            Ver cliente
            <ArrowRight size={15} />
          </strong>
        </footer>
      </button>
    </CloudCard>
  );
}

function DetalheItem({ icon: Icon, label, value }) {
  return (
    <div className="cf-cliente-detail-item">
      <span>
        <Icon size={17} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value || "--"}</strong>
      </div>
    </div>
  );
}

function PainelCliente({ cliente, aoFechar }) {
  if (!cliente) {
    return null;
  }

  const status = obterStatusCliente(cliente.status);
  const financeiro = obterStatusFinanceiro(
    cliente.financeiro.statusPagamento
  );

  return (
    <div className="cf-cliente-panel-overlay">
      <button
        type="button"
        className="cf-cliente-panel-backdrop"
        aria-label="Fechar painel"
        onClick={aoFechar}
      />

      <aside className="cf-cliente-panel">
        <header className="cf-cliente-panel-header">
          <div className="cf-cliente-panel-avatar">
            {cliente.nomeFantasia
              .split(" ")
              .slice(0, 2)
              .map((parte) => parte[0])
              .join("")
              .toUpperCase()}
          </div>

          <div>
            <span>{cliente.codigo}</span>
            <h2>{cliente.nomeFantasia}</h2>
            <p>{cliente.razaoSocial}</p>
          </div>

          <button
            type="button"
            className="cf-cliente-panel-close"
            onClick={aoFechar}
            aria-label="Fechar detalhes"
          >
            <X size={21} />
          </button>
        </header>

        <div className="cf-cliente-panel-status">
          <CloudStatus
            status={status.cloudStatus}
            label={status.label}
          />

          <CloudBadge variant={financeiro.variant}>
            {financeiro.label}
          </CloudBadge>
        </div>

        <div className="cf-cliente-panel-content">
          <section className="cf-cliente-panel-block">
            <div className="cf-cliente-panel-block-title">
              <Building2 size={18} />
              <h3>Dados gerais</h3>
            </div>

            <div className="cf-cliente-detail-grid">
              <DetalheItem
                icon={FileText}
                label="CNPJ"
                value={cliente.documento}
              />

              <DetalheItem
                icon={ShieldCheck}
                label="Plano"
                value={cliente.plano}
              />

              <DetalheItem
                icon={Building2}
                label="Segmento"
                value={cliente.segmento}
              />

              <DetalheItem
                icon={MapPin}
                label="Cidade"
                value={`${cliente.endereco.cidade} - ${cliente.endereco.estado}`}
              />
            </div>
          </section>

          <section className="cf-cliente-panel-block">
            <div className="cf-cliente-panel-block-title">
              <Users size={18} />
              <h3>Contato responsável</h3>
            </div>

            <div className="cf-cliente-detail-grid">
              <DetalheItem
                icon={Users}
                label="Responsável"
                value={cliente.responsavel.nome}
              />

              <DetalheItem
                icon={Building2}
                label="Cargo"
                value={cliente.responsavel.cargo}
              />

              <DetalheItem
                icon={Phone}
                label="Telefone"
                value={cliente.responsavel.telefone}
              />

              <DetalheItem
                icon={Mail}
                label="E-mail"
                value={cliente.responsavel.email}
              />
            </div>
          </section>

          <section className="cf-cliente-panel-block">
            <div className="cf-cliente-panel-block-title">
              <CircleDollarSign size={18} />
              <h3>Financeiro</h3>
            </div>

            <div className="cf-cliente-financial-grid">
              <div>
                <small>Mensalidade</small>
                <strong>
                  {formatarMoeda(
                    cliente.financeiro.mensalidade
                  )}
                </strong>
              </div>

              <div>
                <small>Vencimento</small>
                <strong>
                  Dia{" "}
                  {cliente.financeiro.diaVencimento}
                </strong>
              </div>

              <div>
                <small>Próximo vencimento</small>
                <strong>
                  {
                    cliente.financeiro
                      .proximoVencimento
                  }
                </strong>
              </div>

              <div>
                <small>Forma de pagamento</small>
                <strong>
                  {
                    cliente.financeiro
                      .formaPagamento
                  }
                </strong>
              </div>
            </div>
          </section>

          <section className="cf-cliente-panel-block">
            <div className="cf-cliente-panel-block-title">
              <CheckCircle2 size={18} />
              <h3>Serviços contratados</h3>
            </div>

            <div className="cf-cliente-services-list">
              {cliente.servicos.map((servico) => {
                const ServiceIcon =
                  obterIconeServico(servico.id);

                return (
                  <article key={servico.id}>
                    <span>
                      <ServiceIcon size={18} />
                    </span>

                    <div>
                      <strong>{servico.nome}</strong>
                      <small>
                        {servico.quantidade}{" "}
                        {servico.unidade}
                      </small>
                    </div>

                    <CloudBadge
                      variant={
                        servico.status === "ativo"
                          ? "success"
                          : servico.status ===
                              "implantacao"
                            ? "blue"
                            : servico.status ===
                                "suspenso"
                              ? "danger"
                              : "neutral"
                      }
                    >
                      {servico.status}
                    </CloudBadge>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="cf-cliente-panel-block">
            <div className="cf-cliente-panel-block-title">
              <Clock3 size={18} />
              <h3>Histórico recente</h3>
            </div>

            <div className="cf-cliente-timeline">
              {cliente.timeline.map((evento) => (
                <article key={evento.id}>
                  <span />

                  <div>
                    <small>{evento.data}</small>
                    <strong>{evento.titulo}</strong>
                    <p>{evento.descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {cliente.observacoes && (
            <section className="cf-cliente-notes">
              <AlertTriangle size={18} />

              <div>
                <strong>Observações</strong>
                <p>{cliente.observacoes}</p>
              </div>
            </section>
          )}
        </div>

        <footer className="cf-cliente-panel-actions">
          <CloudButton
            variant="secondary"
            icon={Edit3}
          >
            Editar cliente
          </CloudButton>

          <CloudButton
            variant="secondary"
            icon={Monitor}
          >
            Ver telas
          </CloudButton>

          <CloudButton
            icon={CircleDollarSign}
            fullWidth
          >
            Abrir financeiro
          </CloudButton>
        </footer>
      </aside>
    </div>
  );
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] =
    useState(true);
  const [erro, setErro] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState("todos");
  const [filtroPlano, setFiltroPlano] =
    useState("todos");

  const [clienteSelecionado, setClienteSelecionado] =
    useState(null);

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await buscarClientes();

      setClientes(resposta);
    } catch (error) {
      console.error(
        "Erro ao carregar clientes:",
        error
      );

      setErro(
        "Não foi possível carregar os clientes cadastrados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const planos = useMemo(() => {
    return [
      ...new Set(
        clientes.map((cliente) => cliente.plano)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [clientes]);

  const clientesFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return clientes.filter((cliente) => {
      const correspondePesquisa =
        !termo ||
        [
          cliente.nomeFantasia,
          cliente.razaoSocial,
          cliente.documento,
          cliente.codigo,
          cliente.segmento,
          cliente.responsavel.nome,
          cliente.endereco.cidade,
        ].some((valor) =>
          normalizarTexto(valor).includes(termo)
        );

      const correspondeStatus =
        filtroStatus === "todos" ||
        cliente.status === filtroStatus;

      const correspondePlano =
        filtroPlano === "todos" ||
        cliente.plano === filtroPlano;

      return (
        correspondePesquisa &&
        correspondeStatus &&
        correspondePlano
      );
    });
  }, [
    clientes,
    pesquisa,
    filtroStatus,
    filtroPlano,
  ]);

  function limparFiltros() {
    setPesquisa("");
    setFiltroStatus("todos");
    setFiltroPlano("todos");
  }

  if (carregando) {
    return (
      <div className="cf-clientes-page">
        <CloudLoading
          title="Carregando clientes"
          description="Consultando cadastros, contratos e serviços."
        />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="cf-clientes-page">
        <CloudEmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar os clientes"
          description={erro}
          actionLabel="Tentar novamente"
          actionIcon={RefreshCw}
          onAction={carregarClientes}
        />
      </div>
    );
  }

  return (
    <div className="cf-clientes-page">
      <CloudSectionTitle
        eyebrow="GESTÃO COMERCIAL"
        title="Clientes"
        description="Gerencie contratos, serviços, mensalidades e o relacionamento com cada cliente."
        icon={Users}
        action={
          <CloudButton icon={Plus}>
            Novo cliente
          </CloudButton>
        }
      />

      <ResumoClientes clientes={clientes} />

      <CloudCard
        className="cf-clientes-filter-card"
        padding="small"
      >
        <div className="cf-clientes-filters">
          <label className="cf-clientes-search">
            <Search size={18} />

            <input
              type="search"
              value={pesquisa}
              onChange={(event) =>
                setPesquisa(event.target.value)
              }
              placeholder="Pesquisar por cliente, responsável, CNPJ ou cidade..."
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

          <div className="cf-clientes-status-filter">
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

          <label className="cf-clientes-select">
            <Filter size={16} />

            <select
              value={filtroPlano}
              onChange={(event) =>
                setFiltroPlano(event.target.value)
              }
            >
              <option value="todos">
                Todos os planos
              </option>

              {planos.map((plano) => (
                <option key={plano} value={plano}>
                  {plano}
                </option>
              ))}
            </select>
          </label>

          <CloudButton
            variant="ghost"
            icon={X}
            onClick={limparFiltros}
          >
            Limpar
          </CloudButton>
        </div>
      </CloudCard>

      <div className="cf-clientes-results-header">
        <span>
          Exibindo{" "}
          <strong>{clientesFiltrados.length}</strong>{" "}
          de <strong>{clientes.length}</strong>{" "}
          clientes
        </span>

        <CloudBadge variant="success" pulse>
          CRM operacional
        </CloudBadge>
      </div>

      {clientesFiltrados.length > 0 ? (
        <section className="cf-clientes-grid">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              aoSelecionar={setClienteSelecionado}
            />
          ))}
        </section>
      ) : (
        <CloudCard>
          <CloudEmptyState
            icon={Search}
            title="Nenhum cliente encontrado"
            description="Não encontramos clientes que correspondam à pesquisa e aos filtros selecionados."
            actionLabel="Limpar filtros"
            actionIcon={X}
            onAction={limparFiltros}
          />
        </CloudCard>
      )}

      <PainelCliente
        cliente={clienteSelecionado}
        aoFechar={() => setClienteSelecionado(null)}
      />
    </div>
  );
}