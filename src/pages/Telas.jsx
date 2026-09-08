import { useEffect, useMemo, useState } from "react";
import {
  buscarTelas,
  solicitarAtualizacaoTela,
  solicitarReinicioTela,
  atualizarNomeTela,
  cadastrarTela,
} from "../services/telasService";
import {
  Activity,
  AlertTriangle,
  Antenna,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Expand,
  Filter,
  Gauge,
  HardDrive,
  Info,
  LayoutGrid,
  ListFilter,
  MapPin,
  MemoryStick,
  Monitor,
  MoreVertical,
  Network,
  PlaySquare,
  Power,
  RefreshCw,
  Router,
  Search,
  Signal,
  SlidersHorizontal,
  Smartphone,
  Thermometer,
  Tv,
  Wifi,
  WifiOff,
  X,
  Zap,
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



import "./TelasV2.css";

const filtrosStatus = [
  { id: "todos", label: "Todas" },
  { id: "online", label: "Online" },
  { id: "offline", label: "Offline" },
  { id: "atualizando", label: "Atualizando" },
];

function normalizarTexto(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterStatusTela(status) {
  if (status === "online") {
    return {
      label: "Online",
      cloudStatus: "online",
      icon: Wifi,
    };
  }

  if (status === "offline") {
    return {
      label: "Offline",
      cloudStatus: "offline",
      icon: WifiOff,
    };
  }

  return {
    label: "Atualizando",
    cloudStatus: "pending",
    icon: RefreshCw,
  };
}

function obterSaudeTela(tela) {
  if (tela.status === "offline") {
    return {
      label: "Comunicação interrompida",
      variant: "danger",
    };
  }

  if (
    tela.internetStatus === "instavel" ||
    Number(tela.temperatura) >= 38
  ) {
    return {
      label: "Requer atenção",
      variant: "warning",
    };
  }

  if (tela.status === "atualizando") {
    return {
      label: "Sincronizando",
      variant: "blue",
    };
  }

  return {
    label: "Funcionamento normal",
    variant: "success",
  };
}

function obterCorMetrica(valor, limiteAlerta = 75) {
  if (valor === null || valor === undefined) {
    return "indisponivel";
  }

  if (valor >= limiteAlerta) {
    return "alerta";
  }

  return "normal";
}

function ResumoTelas({ telas }) {
  const total = telas.length;
  const online = telas.filter(
    (tela) => tela.status === "online"
  ).length;
  const offline = telas.filter(
    (tela) => tela.status === "offline"
  ).length;
  const atualizando = telas.filter(
    (tela) => tela.status === "atualizando"
  ).length;

  const percentualOnline =
    total > 0 ? Math.round((online / total) * 100) : 0;

  const cards = [
    {
      titulo: "Total de telas",
      valor: total,
      detalhe: "Equipamentos cadastrados",
      icone: Tv,
      classe: "total",
    },
    {
      titulo: "Telas online",
      valor: online,
      detalhe: `${percentualOnline}% da operação`,
      icone: Wifi,
      classe: "online",
    },
    {
      titulo: "Telas offline",
      valor: offline,
      detalhe:
        offline === 1
          ? "1 tela precisa de atenção"
          : `${offline} telas precisam de atenção`,
      icone: WifiOff,
      classe: "offline",
    },
    {
      titulo: "Atualizando",
      valor: atualizando,
      detalhe: "Recebendo programação",
      icone: RefreshCw,
      classe: "atualizando",
    },
  ];

  return (
    <section className="cf-telas-resumo">
      {cards.map((item) => {
        const Icone = item.icone;

        return (
          <article
            key={item.titulo}
            className={`cf-telas-resumo-card ${item.classe}`}
          >
            <span className="cf-telas-resumo-icone">
              <Icone size={22} />
            </span>

            <div>
              <strong>{item.valor}</strong>
              <span>{item.titulo}</span>
              <small>{item.detalhe}</small>
            </div>

            <span className="cf-telas-resumo-brilho" />
          </article>
        );
      })}
    </section>
  );
}

function BarraMetrica({
  label,
  valor,
  unidade = "%",
  limiteAlerta = 75,
  icon: Icon,
}) {
  const classe = obterCorMetrica(valor, limiteAlerta);
  const possuiValor =
    valor !== null && valor !== undefined;

  return (
    <div className={`cf-telas-metrica ${classe}`}>
      <div className="cf-telas-metrica-topo">
        <span>
          {Icon && <Icon size={14} />}
          {label}
        </span>

        <strong>
          {possuiValor ? `${valor}${unidade}` : "--"}
        </strong>
      </div>

      <div className="cf-telas-metrica-barra">
        <span
          style={{
            width: possuiValor
              ? `${Math.min(Number(valor), 100)}%`
              : "0%",
          }}
        />
      </div>
    </div>
  );
}

function TelaCard({ tela, aoSelecionar }) {
  const status = obterStatusTela(tela.status);
  const StatusIcon = status.icon;
  const saude = obterSaudeTela(tela);

  return (
    <CloudCard
      className={`cf-tela-card cf-tela-card-${tela.status}`}
      padding="none"
      hover
    >
      <button
        type="button"
        className="cf-tela-card-botao"
        onClick={() => aoSelecionar(tela)}
      >
        <div className="cf-tela-card-preview">
          <div className="cf-tela-card-preview-topo">
            <CloudStatus
              status={status.cloudStatus}
              label={status.label}
            />

            <span className="cf-tela-card-menu">
              <MoreVertical size={18} />
            </span>
          </div>

          <div className="cf-tela-monitor">
            <div className="cf-tela-monitor-tela">
              <span className="cf-tela-monitor-logo">
                CF
              </span>

              <div>
                <strong>{tela.playlist.nome}</strong>
                <small>
                  {tela.playlist.totalMidias} mídias
                </small>
              </div>

              <span
                className={`cf-tela-monitor-sinal ${tela.status}`}
              >
                <StatusIcon size={18} />
              </span>
            </div>

            <span className="cf-tela-monitor-base" />
          </div>

          <div className="cf-tela-card-local">
            <MapPin size={14} />
            {tela.local}, {tela.cidade}
          </div>

          <span className="cf-tela-card-preview-luz" />
        </div>

        <div className="cf-tela-card-conteudo">
          <div className="cf-tela-card-titulo">
            <div>
              <span>{tela.codigo}</span>
              <h3>{tela.nome}</h3>
              <p>{tela.cliente}</p>
            </div>

            <CloudBadge variant={saude.variant}>
              {saude.label}
            </CloudBadge>
          </div>

          <div className="cf-tela-card-informacoes">
            <div>
              <Building2 size={15} />
              <span>
                <small>Grupo</small>
                <strong>{tela.grupo}</strong>
              </span>
            </div>

            <div>
              <Expand size={15} />
              <span>
                <small>Resolução</small>
                <strong>{tela.resolucao}</strong>
              </span>
            </div>

            <div>
              <Thermometer size={15} />
              <span>
                <small>Temperatura</small>
                <strong>
                  {tela.temperatura !== null
                    ? `${tela.temperatura}°C`
                    : "--"}
                </strong>
              </span>
            </div>

            <div>
              <Signal size={15} />
              <span>
                <small>Internet</small>
                <strong>
                  {tela.internet.intensidade > 0
                    ? `${tela.internet.intensidade}%`
                    : "--"}
                </strong>
              </span>
            </div>
          </div>

          <div className="cf-tela-card-rodape">
            <span>
              <Clock3 size={14} />
              Último contato: {tela.ultimoContato}
            </span>

            <strong>
              Ver detalhes
              <ArrowRight size={15} />
            </strong>
          </div>
        </div>
      </button>
    </CloudCard>
  );
}

function ItemDetalhe({ icon: Icon, label, value }) {
  return (
    <div className="cf-tela-detalhe-item">
      <span className="cf-tela-detalhe-item-icone">
        <Icon size={17} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value || "--"}</strong>
      </div>
    </div>
  );
}

function PainelDetalhes({
  tela,
  aoFechar,
  aoAtualizar,
  aoReiniciar,
  executandoAcao,
  mensagem,
  nomeEditando,
  setNomeEditando,
  salvarNomeTela,
}) {
  if (!tela) {
    return null;
  }

  const status = obterStatusTela(tela.status);
  const saude = obterSaudeTela(tela);

  return (
    <div className="cf-tela-detalhes-overlay">
      <button
        type="button"
        className="cf-tela-detalhes-fundo"
        onClick={aoFechar}
        aria-label="Fechar painel"
      />

      <aside className="cf-tela-detalhes">
        <header className="cf-tela-detalhes-header">
          <div>
            <span className="cf-tela-detalhes-etiqueta">
              {tela.codigo}
            </span>

            <h2>{tela.nome}</h2>

            <p>
              {tela.local}, {tela.cidade} - {tela.estado}
            </p>
            <div
  style={{
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  }}
>
  <input
    type="text"
    value={nomeEditando}
    onChange={(event) =>
      setNomeEditando(event.target.value)
    }
    placeholder="Nome da tela"
    style={{
      flex: 1,
      minWidth: 0,
      padding: "10px 12px",
      borderRadius: "10px",
      border:
        "1px solid rgba(255,255,255,0.12)",
      background: "#0b1b2e",
      color: "#fff",
    }}
  />

  <button
    type="button"
    onClick={salvarNomeTela}
    disabled={executandoAcao === "nome"}
    style={{
      padding: "10px 14px",
      border: 0,
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: 800,
    }}
  >
    {executandoAcao === "nome"
      ? "Salvando..."
      : "Salvar nome"}
  </button>
</div>
          </div>

          <button
            type="button"
            className="cf-tela-detalhes-fechar"
            onClick={aoFechar}
            aria-label="Fechar detalhes"
          >
            <X size={21} />
          </button>
        </header>

        <div className="cf-tela-detalhes-status">
          <CloudStatus
            status={status.cloudStatus}
            label={status.label}
          />

          <CloudBadge variant={saude.variant}>
            {saude.label}
          </CloudBadge>
        </div>

        {mensagem && (
          <div className="cf-tela-detalhes-mensagem">
            <CheckCircle2 size={18} />
            <span>{mensagem}</span>
          </div>
        )}

        <div className="cf-tela-detalhes-conteudo">
          <section className="cf-tela-detalhes-bloco">
            <div className="cf-tela-detalhes-bloco-titulo">
              <Monitor size={18} />
              <h3>Informações da tela</h3>
            </div>

            <div className="cf-tela-detalhes-grid">
              <ItemDetalhe
                icon={Building2}
                label="Cliente"
                value={tela.cliente}
              />

              <ItemDetalhe
                icon={LayoutGrid}
                label="Grupo"
                value={tela.grupo}
              />

              <ItemDetalhe
                icon={MapPin}
                label="Local"
                value={tela.local}
              />

              <ItemDetalhe
                icon={Expand}
                label="Formato"
                value={`${tela.resolucao} • ${tela.orientacao}`}
              />

              <ItemDetalhe
                icon={Smartphone}
                label="Tamanho"
                value={tela.tamanhoTela}
              />

              <ItemDetalhe
                icon={Info}
                label="Versão"
                value={tela.versao}
              />
            </div>
          </section>

          <section className="cf-tela-detalhes-bloco">
            <div className="cf-tela-detalhes-bloco-titulo">
              <Activity size={18} />
              <h3>Desempenho do equipamento</h3>
            </div>

            <div className="cf-tela-detalhes-metricas">
              <BarraMetrica
                icon={Cpu}
                label="CPU"
                valor={tela.cpu}
              />

              <BarraMetrica
                icon={MemoryStick}
                label="Memória"
                valor={tela.memoria}
              />

              <BarraMetrica
                icon={HardDrive}
                label="Armazenamento"
                valor={tela.armazenamento}
                limiteAlerta={85}
              />

              <BarraMetrica
                icon={Thermometer}
                label="Temperatura"
                valor={tela.temperatura}
                unidade="°C"
                limiteAlerta={38}
              />
            </div>
          </section>

          <section className="cf-tela-detalhes-bloco">
            <div className="cf-tela-detalhes-bloco-titulo">
              <Router size={18} />
              <h3>Rede e comunicação</h3>
            </div>

            <div className="cf-tela-detalhes-grid">
              <ItemDetalhe
                icon={Network}
                label="Endereço IP"
                value={tela.ip}
              />

              <ItemDetalhe
                icon={Antenna}
                label="Endereço MAC"
                value={tela.mac}
              />

              <ItemDetalhe
                icon={Wifi}
                label="Provedor"
                value={tela.internet.provedor}
              />

              <ItemDetalhe
                icon={Gauge}
                label="Velocidade"
                value={tela.internet.velocidade}
              />

              <ItemDetalhe
                icon={Zap}
                label="Latência"
                value={tela.internet.latencia}
              />

              <ItemDetalhe
                icon={Signal}
                label="Intensidade"
                value={`${tela.internet.intensidade}%`}
              />
            </div>
          </section>

          <section className="cf-tela-detalhes-bloco">
            <div className="cf-tela-detalhes-bloco-titulo">
              <PlaySquare size={18} />
              <h3>Programação atual</h3>
            </div>

            <div className="cf-tela-playlist">
              <span className="cf-tela-playlist-icone">
                <PlaySquare size={24} />
              </span>

              <div>
                <strong>{tela.playlist.nome}</strong>

                <span>
                  {tela.playlist.totalMidias} mídias •{" "}
                  {tela.playlist.duracao}
                </span>

                <small>
                  Atualizada em{" "}
                  {tela.playlist.ultimaAtualizacao}
                </small>
              </div>

              <button type="button">
                Abrir
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          <section className="cf-tela-detalhes-bloco">
            <div className="cf-tela-detalhes-bloco-titulo">
              <Clock3 size={18} />
              <h3>Sincronização</h3>
            </div>

            <div className="cf-tela-sincronizacao">
              <div>
                <small>Último contato</small>
                <strong>{tela.ultimoContato}</strong>
              </div>

              <div>
                <small>Última atualização</small>
                <strong>{tela.ultimaAtualizacao}</strong>
              </div>

              <div>
                <small>Próxima sincronização</small>
                <strong>
                  {tela.proximaSincronizacao}
                </strong>
              </div>
            </div>
          </section>

          {tela.observacoes && (
            <section className="cf-tela-observacoes">
              <AlertTriangle size={18} />

              <div>
                <strong>Observações operacionais</strong>
                <p>{tela.observacoes}</p>
              </div>
            </section>
          )}
        </div>

        <footer className="cf-tela-detalhes-acoes">
          <CloudButton
            variant="secondary"
            icon={RefreshCw}
            loading={executandoAcao === "atualizar"}
            disabled={executandoAcao !== ""}
            onClick={() => aoAtualizar(tela)}
          >
            Atualizar
          </CloudButton>

          <CloudButton
            variant="danger"
            icon={Power}
            loading={executandoAcao === "reiniciar"}
            disabled={
              executandoAcao !== "" ||
              tela.status === "offline"
            }
            onClick={() => aoReiniciar(tela)}
          >
            Reiniciar
          </CloudButton>

          <CloudButton
            icon={PlaySquare}
            fullWidth
          >
            Abrir playlist
          </CloudButton>
        </footer>
      </aside>
    </div>
  );
}

export default function Telas() {
  const [telas, setTelas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState("todos");
  const [filtroGrupo, setFiltroGrupo] =
    useState("todos");

  const [telaSelecionada, setTelaSelecionada] =
    useState(null);
  const [nomeEditando, setNomeEditando] =
  useState("")
  const [mostrarCadastroTela, setMostrarCadastroTela] =
  useState(false)
  const [novoCodigoTela, setNovoCodigoTela] =
  useState("")

const [novoNomeTela, setNovoNomeTela] =
  useState("")

const [novoLocalTela, setNovoLocalTela] =
  useState("")
  const [executandoAcao, setExecutandoAcao] =
    useState("");
  const [mensagemAcao, setMensagemAcao] =
    useState("");

  async function carregarTelas() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await buscarTelas();

      setTelas(resposta);
    } catch (error) {
      console.error("Erro ao carregar telas:", error);

      setErro(
        "Não foi possível carregar as telas cadastradas."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTelas();
  }, []);

  const grupos = useMemo(() => {
    const gruposUnicos = [
      ...new Set(telas.map((tela) => tela.grupo)),
    ];

    return gruposUnicos.sort((a, b) =>
      a.localeCompare(b)
    );
  }, [telas]);

  const telasFiltradas = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return telas.filter((tela) => {
      const correspondePesquisa =
        !termo ||
        [
          tela.nome,
          tela.codigo,
          tela.cliente,
          tela.grupo,
          tela.local,
          tela.cidade,
        ].some((valor) =>
          normalizarTexto(valor).includes(termo)
        );

      const correspondeStatus =
        filtroStatus === "todos" ||
        tela.status === filtroStatus;

      const correspondeGrupo =
        filtroGrupo === "todos" ||
        tela.grupo === filtroGrupo;

      return (
        correspondePesquisa &&
        correspondeStatus &&
        correspondeGrupo
      );
    });
  }, [
    telas,
    pesquisa,
    filtroStatus,
    filtroGrupo,
  ]);

  function limparFiltros() {
    setPesquisa("");
    setFiltroStatus("todos");
    setFiltroGrupo("todos");
  }

 function abrirDetalhes(tela) {
  setMensagemAcao("");
  setTelaSelecionada(tela);
  setNomeEditando(tela.nome || "");
}

async function salvarNomeTela() {
  const novoNome = nomeEditando.trim()

  if (!novoNome) {
    setMensagemAcao(
      "Informe um nome para a tela."
    )
    return
  }

  if (!telaSelecionada) {
    return
  }

  try {
    setExecutandoAcao("nome")
    setMensagemAcao("")

    const telaAtualizada =
      await atualizarNomeTela(
        telaSelecionada.id,
        novoNome
      )

    setTelas((listaAtual) =>
      listaAtual.map((tela) =>
        tela.id === telaSelecionada.id
          ? {
              ...tela,
              nome: telaAtualizada.nome,
            }
          : tela
      )
    )

    setTelaSelecionada((telaAtual) => ({
      ...telaAtual,
      nome: telaAtualizada.nome,
    }))

    setMensagemAcao(
      "Nome da tela atualizado com sucesso."
    )
  } catch (error) {
    setMensagemAcao(
      error.message ||
        "Não foi possível atualizar o nome."
    )
  } finally {
    setExecutandoAcao("")
  }
}
async function salvarNovaTela() {
  const codigo = novoCodigoTela.trim()
  const nome = novoNomeTela.trim()
  const local = novoLocalTela.trim()

  if (!codigo || !nome || !local) {
    setMensagemAcao(
      "Preencha código, nome e local."
    )
    return
  }

  try {
    setExecutandoAcao("cadastrar")
    setMensagemAcao("")

    await cadastrarTela({
      codigo,
      nome,
      local,
    })

    setNovoCodigoTela("")
    setNovoNomeTela("")
    setNovoLocalTela("")
    setMostrarCadastroTela(false)

    await carregarTelas()

    setMensagemAcao(
      "Tela cadastrada com sucesso."
    )
  } catch (error) {
    setMensagemAcao(
      error.message ||
        "Não foi possível cadastrar a tela."
    )
  } finally {
    setExecutandoAcao("")
  }
}
async function salvarNovaTela() {
  const codigo = novoCodigoTela.trim()
  const nome = novoNomeTela.trim()
  const local = novoLocalTela.trim()

  if (!codigo || !nome || !local) {
    setMensagemAcao(
      "Preencha código, nome e local."
    )
    return
  }

  try {
    setExecutandoAcao("cadastro")
    setMensagemAcao("")

    const novaTela = await cadastrarTela({
      codigo,
      nome,
      local,
    })

    console.log("Tela cadastrada:", novaTela)

    setNovoCodigoTela("")
    setNovoNomeTela("")
    setNovoLocalTela("")

    await carregarTelas()

    setMostrarCadastroTela(false)
  } catch (error) {
    console.error(
      "Erro ao cadastrar tela:",
      error
    )

    setMensagemAcao(
      error.message ||
        "Não foi possível cadastrar a tela."
    )
  } finally {
    setExecutandoAcao("")
  }
}
  function fecharDetalhes() {
    setTelaSelecionada(null);
    setMensagemAcao("");
    setExecutandoAcao("");
  }

  async function atualizarTela(tela) {
    try {
      setMensagemAcao("");
      setExecutandoAcao("atualizar");

      const resposta =
        await solicitarAtualizacaoTela(tela.id);

      setMensagemAcao(resposta.mensagem);
    } catch (error) {
      setMensagemAcao(
        error.message ||
          "Não foi possível atualizar a tela."
      );
    } finally {
      setExecutandoAcao("");
    }
  }

  async function reiniciarTela(tela) {
    try {
      setMensagemAcao("");
      setExecutandoAcao("reiniciar");

      const resposta =
        await solicitarReinicioTela(tela.id);

      setMensagemAcao(resposta.mensagem);
    } catch (error) {
      setMensagemAcao(
        error.message ||
          "Não foi possível reiniciar a tela."
      );
    } finally {
      setExecutandoAcao("");
    }
  }

  if (carregando) {
    return (
      <div className="cf-telas-page">
        <CloudLoading
          title="Carregando central de telas"
          description="Consultando equipamentos, conexões e programações."
        />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="cf-telas-page">
        <CloudEmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar as telas"
          description={erro}
          actionLabel="Tentar novamente"
          actionIcon={RefreshCw}
          onAction={carregarTelas}
        />
      </div>
    );
  }

  return (
    <div className="cf-telas-page">
      <CloudSectionTitle
        eyebrow="CENTRAL DE OPERAÇÕES"
        title="Monitoramento de telas"
        description="Acompanhe conexão, desempenho, programação e sincronização de todos os equipamentos."
        icon={Monitor}
        action={
         <button
  type="button"
  onClick={() => setMostrarCadastroTela(true)}
  style={{
    padding: "12px 18px",
    border: 0,
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 800,
  }}
>
  Cadastrar nova tela
</button>
        }
      />

     <ResumoTelas telas={telas} />

{mostrarCadastroTela && (
  <div
    style={{
      marginBottom: "18px",
      padding: "18px",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      background: "rgba(8,20,36,0.95)",
    }}
  >
    <strong
      style={{
        display: "block",
        marginBottom: "12px",
        fontSize: "18px",
        color: "#ffffff",
      }}
    >
      Cadastrar nova tela
    </strong>

   <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "14px",
  }}
>
  <input
    type="text"
    value={novoCodigoTela}
    onChange={(event) =>
      setNovoCodigoTela(event.target.value)
    }
    placeholder="Código. Ex: LANCHA-02"
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "#0b1b2e",
      color: "#fff",
    }}
  />

  <input
    type="text"
    value={novoNomeTela}
    onChange={(event) =>
      setNovoNomeTela(event.target.value)
    }
    placeholder="Nome da tela"
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "#0b1b2e",
      color: "#fff",
    }}
  />

  <input
    type="text"
    value={novoLocalTela}
    onChange={(event) =>
      setNovoLocalTela(event.target.value)
    }
    placeholder="Local"
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "#0b1b2e",
      color: "#fff",
    }}
  />
</div>
<button
  type="button"
  onClick={salvarNovaTela}
  style={{
  padding: "10px 16px",
  marginRight: "10px",
  border: "2px solid #00ff88",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 800,
  background: "#00ff88",
  color: "#001a10",
  display: "inline-block",
}}
>
  {executandoAcao === "cadastro"
  ? "Salvando..."
  : "Salvar tela"}
</button>
    <button
      type="button"
      onClick={() =>
        setMostrarCadastroTela(false)
      }
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        cursor: "pointer",
      }}
    >
      Fechar
    </button>
  </div>
)}

<CloudCard
  className="cf-telas-filtros-card"
  padding="small"
>
  <div className="cf-telas-filtros">
    <label className="cf-telas-pesquisa">
      <Search size={18} />

      <input
        type="search"
        value={pesquisa}
        onChange={(event) =>
          setPesquisa(event.target.value)
        }
        placeholder="Pesquisar por nome, cliente, cidade ou local..."
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

    <div className="cf-telas-filtro-status">
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

    <label className="cf-telas-select">
      <ListFilter size={17} />

      <select
        value={filtroGrupo}
        onChange={(event) =>
          setFiltroGrupo(event.target.value)
        }
      >
        <option value="todos">
          Todos os grupos
        </option>

        {grupos.map((grupo) => (
          <option key={grupo} value={grupo}>
            {grupo}
          </option>
        ))}
      </select>
    </label>

    <CloudButton
      variant="ghost"
      icon={SlidersHorizontal}
      onClick={limparFiltros}
    >
      Limpar
    </CloudButton>
  </div>
</CloudCard>

<div className="cf-telas-resultados-topo">
  <div>
    <Filter size={16} />

    <span>
      Exibindo{" "}
      <strong>{telasFiltradas.length}</strong> de{" "}
      <strong>{telas.length}</strong> telas
    </span>
  </div>

  <CloudBadge
    variant={
      telasFiltradas.some(
        (tela) => tela.status === "offline"
      )
        ? "warning"
        : "success"
    }
    pulse
  >
    Monitoramento ativo
  </CloudBadge>
</div>

{telasFiltradas.length > 0 ? (
  <section className="cf-telas-grid">
    {telasFiltradas.map((tela) => (
      <TelaCard
        key={tela.id}
        tela={tela}
        aoSelecionar={abrirDetalhes}
      />
    ))}
  </section>
) : (
  <CloudCard>
    <CloudEmptyState
      icon={Search}
      title="Nenhuma tela encontrada"
      description="Não encontramos equipamentos que correspondam à pesquisa e aos filtros selecionados."
      actionLabel="Limpar filtros"
      actionIcon={X}
      onAction={limparFiltros}
    />
  </CloudCard>
)}

<PainelDetalhes
  tela={telaSelecionada}
  aoFechar={fecharDetalhes}
  aoAtualizar={atualizarTela}
  aoReiniciar={reiniciarTela}
  executandoAcao={executandoAcao}
  mensagem={mensagemAcao}
  nomeEditando={nomeEditando}
  setNomeEditando={setNomeEditando}
  salvarNomeTela={salvarNomeTela}
/>
    </div>
  );
}