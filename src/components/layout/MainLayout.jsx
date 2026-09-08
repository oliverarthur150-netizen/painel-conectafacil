import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  function alternarMenu() {
    setMenuAberto((estadoAtual) => !estadoAtual);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <div className="cf-v2-app">
      <Sidebar
        menuAberto={menuAberto}
        aoFechar={fecharMenu}
      />

      {menuAberto && (
        <button
          type="button"
          className="cf-v2-overlay"
          onClick={fecharMenu}
          aria-label="Fechar menu"
        />
      )}

      <main className="cf-v2-main">
        <Topbar aoAlternarMenu={alternarMenu} />

        <section className="cf-v2-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}