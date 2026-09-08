import { NavLink } from "react-router-dom";

import {
  BarChart3,
  CalendarClock,
  ChevronRight,
  CircleUserRound,
  Clover,
  FileBarChart,
  LayoutDashboard,
  MonitorPlay,
  Settings,
  Ship,
  Users,
  X,
  Megaphone,
} from "lucide-react";

const itensMenu = [
  {
    nome: "Dashboard",
    caminho: "/",
    icone: LayoutDashboard,
    fim: true,
  },
  {
    nome: "Clientes",
    caminho: "/clientes",
    icone: Users,
  },
  {
  nome: "DA SORTE",
  caminho: "/da-sorte",
  icone: Clover,
},
  {
    nome: "Telas",
    caminho: "/telas",
    icone: MonitorPlay,
  },
  {
    nome: "Publicidade",
    caminho: "/publicidade",
    icone: Megaphone,
  },
  {
    nome: "Embarques",
    caminho: "/embarques",
    icone: Ship,
  },
  {
    nome: "Programação",
    caminho: "/programacao",
    icone: CalendarClock,
  },
  {
    nome: "Relatórios",
    caminho: "/relatorios",
    icone: FileBarChart,
  },
  {
    nome: "Usuários",
    caminho: "/usuarios",
    icone: CircleUserRound,
  },
];

export default function Sidebar({
  menuAberto = false,
  aoFechar,
}) {
  return (
    <aside
      className={`cf-v2-sidebar ${
        menuAberto ? "cf-v2-sidebar-aberta" : ""
      }`}
    >
      <div className="cf-v2-sidebar-topo">
        <div className="cf-v2-marca">
          <div className="cf-v2-logo">
            <span>C</span>
            <span>F</span>
          </div>

          <div className="cf-v2-marca-texto">
            <strong>ConectaFácil</strong>
            <span>Cloud</span>
          </div>
        </div>

        <button
          type="button"
          className="cf-v2-fechar-menu"
          onClick={aoFechar}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="cf-v2-usuario-card">
        <div className="cf-v2-avatar">
          <CircleUserRound size={26} />
        </div>

        <div className="cf-v2-usuario-info">
          <strong>Administrador Geral</strong>

          <span>
            <i />
            Sistema online
          </span>
        </div>
      </div>

      <nav className="cf-v2-navegacao">
        <span className="cf-v2-menu-titulo">
          MENU PRINCIPAL
        </span>

        <div className="cf-v2-menu-lista">
          {itensMenu.map((item) => {
            const Icone = item.icone;

            return (
              <NavLink
                key={item.nome}
                to={item.caminho}
                end={item.fim}
                onClick={aoFechar}
                className={({ isActive }) =>
                  `cf-v2-menu-item ${
                    isActive ? "ativo" : ""
                  }`
                }
              >
                <span className="cf-v2-menu-icone">
                  <Icone size={20} strokeWidth={1.9} />
                </span>

                <span className="cf-v2-menu-nome">
                  {item.nome}
                </span>

                <ChevronRight
                  className="cf-v2-menu-seta"
                  size={17}
                />
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="cf-v2-sidebar-rodape">
        <NavLink
          to="/configuracoes"
          onClick={aoFechar}
          className={({ isActive }) =>
            `cf-v2-menu-item ${
              isActive ? "ativo" : ""
            }`
          }
        >
          <span className="cf-v2-menu-icone">
            <Settings size={20} strokeWidth={1.9} />
          </span>

          <span className="cf-v2-menu-nome">
            Configurações
          </span>

          <ChevronRight
            className="cf-v2-menu-seta"
            size={17}
          />
        </NavLink>

        <div className="cf-v2-versao">
          <BarChart3 size={18} />

          <div>
            <strong>ConectaFácil Cloud</strong>
            <span>Versão 2.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}