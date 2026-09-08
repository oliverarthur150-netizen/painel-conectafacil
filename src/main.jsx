import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.jsx";
import AppCloud from "./AppCloud.jsx";
import CadastroDaSorte from "./pages/CadastroDaSorte.jsx";

const caminhoAtual = window.location.pathname;

const abrirCloud =
  caminhoAtual === "/cloud" ||
  caminhoAtual.startsWith("/cloud/");

const abrirCadastroDaSorte =
  caminhoAtual === "/cadastro-da-sorte" ||
  caminhoAtual.startsWith("/cadastro-da-sorte/");

let aplicativo = <App />;

if (abrirCloud) {
  aplicativo = <AppCloud />;
}

if (abrirCadastroDaSorte) {
  aplicativo = <CadastroDaSorte />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {aplicativo}
  </StrictMode>
);