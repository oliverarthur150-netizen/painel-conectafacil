import { useEffect, useRef, useState } from "react";

import {
  Bell,
  CheckCheck,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";

const avisosIniciais = [
  {
    id: 1,
    titulo: "TV Balsa 01 desconectada",
    descricao: "A tela está sem comunicação há 18 minutos.",
    horario: "Agora",
    tipo: "erro",
    lida: false,
  },
  {
    id: 2,
    titulo: "Nova campanha cadastrada",
    descricao: "Uma nova publicidade foi adicionada.",
    horario: "Há 12 minutos",
    tipo: "sucesso",
    lida: false,
  },
  {
    id: 3,
    titulo: "Mensalidade vence hoje",
    descricao: "Existe uma cobrança que precisa de atenção.",
    horario: "Há 1 hora",
    tipo: "aviso",
    lida: true,
  },
];

export default function Topbar({ aoAlternarMenu }) {
  const [dataHora, setDataHora] = useState(new Date());
  const [pesquisa, setPesquisa] = useState("");
  const [avisos, setAvisos] = useState(avisosIniciais);
  const [avisosAbertos, setAvisosAbertos] =
    useState(false);

  const notificacoesRef = useRef(null);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setDataHora(new Date());
    }, 1000);

    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function verificarCliqueFora(event) {
      if (
        notificacoesRef.current &&
        !notificacoesRef.current.contains(event.target)
      ) {
        setAvisosAbertos(false);
      }
    }

    document.addEventListener(
      "mousedown",
      verificarCliqueFora
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        verificarCliqueFora
      );
    };
  }, []);

  const quantidadeNaoLida = avisos.filter(
    (aviso) => !aviso.lida
  ).length;

  const dataFormatada = dataHora.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }
  );

  const horaFormatada = dataHora.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  function marcarTodasComoLidas() {
    setAvisos((listaAtual) =>
      listaAtual.map((aviso) => ({
        ...aviso,
        lida: true,
      }))
    );
  }

  function marcarComoLida(id) {
    setAvisos((listaAtual) =>
      listaAtual.map((aviso) =>
        aviso.id === id
          ? { ...aviso, lida: true }
          : aviso
      )
    );
  }

  function removerAviso(id) {
    setAvisos((listaAtual) =>
      listaAtual.filter((aviso) => aviso.id !== id)
    );
  }

  function pesquisar(event) {
    event.preventDefault();

    const termo = pesquisa.trim();

    if (!termo) {
      return;
    }

    console.log("Pesquisa:", termo);
  }

  return (
    <header className="cf-v2-topbar">
      <div className="cf-v2-topbar-esquerda">
        <button
          type="button"
          className="cf-v2-menu-mobile"
          onClick={aoAlternarMenu}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>

        <div className="cf-v2-topbar-titulo">
          <span>PAINEL ADMINISTRATIVO</span>
          <strong>ConectaFácil Cloud</strong>
        </div>
      </div>

      <form
        className="cf-v2-pesquisa"
        onSubmit={pesquisar}
      >
        <Search size={19} />

        <input
          type="search"
          value={pesquisa}
          onChange={(event) =>
            setPesquisa(event.target.value)
          }
          placeholder="Pesquisar no sistema..."
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
      </form>

      <div className="cf-v2-topbar-acoes">
        <div className="cf-v2-data-hora">
          <strong>{horaFormatada}</strong>
          <span>{dataFormatada}</span>
        </div>

        <div
          className="cf-v2-notificacoes"
          ref={notificacoesRef}
        >
          <button
            type="button"
            className="cf-v2-acao-botao"
            onClick={() =>
              setAvisosAbertos((estado) => !estado)
            }
            aria-label="Notificações"
          >
            <Bell size={20} />

            {quantidadeNaoLida > 0 && (
              <span className="cf-v2-notificacao-contador">
                {quantidadeNaoLida}
              </span>
            )}
          </button>

          {avisosAbertos && (
            <div className="cf-v2-notificacoes-painel">
              <div className="cf-v2-notificacoes-topo">
                <div>
                  <span>CENTRAL DE AVISOS</span>
                  <strong>Notificações</strong>
                </div>

                {quantidadeNaoLida > 0 && (
                  <button
                    type="button"
                    onClick={marcarTodasComoLidas}
                  >
                    <CheckCheck size={15} />
                    Marcar como lidas
                  </button>
                )}
              </div>

              <div className="cf-v2-notificacoes-lista">
                {avisos.length === 0 ? (
                  <div className="cf-v2-sem-avisos">
                    <Bell size={28} />
                    <strong>Nenhum aviso</strong>
                    <span>
                      As notificações aparecerão aqui.
                    </span>
                  </div>
                ) : (
                  avisos.map((aviso) => (
                    <article
                      key={aviso.id}
                      className={`cf-v2-aviso ${
                        aviso.lida ? "lido" : ""
                      }`}
                      onClick={() =>
                        marcarComoLida(aviso.id)
                      }
                    >
                      <span
                        className={`cf-v2-aviso-status ${aviso.tipo}`}
                      />

                      <div>
                        <strong>{aviso.titulo}</strong>
                        <p>{aviso.descricao}</p>
                        <small>{aviso.horario}</small>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removerAviso(aviso.id);
                        }}
                        aria-label="Remover aviso"
                      >
                        <X size={15} />
                      </button>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          className="cf-v2-perfil"
        >
          <span className="cf-v2-perfil-avatar">
            <UserRound size={20} />
          </span>

          <span className="cf-v2-perfil-texto">
            <strong>Administrador</strong>
            <small>
              <i />
              Online
            </small>
          </span>
        </button>
      </div>
    </header>
  );
}