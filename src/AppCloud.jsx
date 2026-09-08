import "./styles/Cloud.css";
import "./styles/CloudV2.css";
import "./components/cloud/CloudComponents.css";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Telas from "./pages/Telas";
import Publicidade from "./pages/Publicidade";
import Embarques from "./pages/Embarques";
import Programacao from "./pages/Programacao";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";
import DaSorte from "./pages/DaSorte";
export default function AppCloud() {
  return (
    <BrowserRouter basename="/cloud">
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="clientes" element={<Clientes />} />
          <Route path="da-sorte" element={<DaSorte />} />
          <Route path="telas" element={<Telas />} />
          <Route
            path="publicidade"
            element={<Publicidade />}
          />
          <Route
            path="embarques"
            element={<Embarques />}
          />
          <Route
            path="programacao"
            element={<Programacao />}
          />
          <Route
            path="financeiro"
            element={<Financeiro />}
          />
          <Route
            path="relatorios"
            element={<Relatorios />}
          />
          <Route
            path="usuarios"
            element={<Usuarios />}
          />
          <Route
            path="configuracoes"
            element={<Configuracoes />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}