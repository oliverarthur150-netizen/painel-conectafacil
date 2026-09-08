import { dashboardData } from "../data/dashboard";

const TEMPO_SIMULADO_DA_API = 350;

function copiarDados(dados) {
  return JSON.parse(JSON.stringify(dados));
}

export async function buscarDashboard() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(copiarDados(dashboardData));
    }, TEMPO_SIMULADO_DA_API);
  });
}