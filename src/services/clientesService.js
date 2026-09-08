import { clientesData } from "../data/clientes";

const TEMPO_API = 350;

function aguardar(tempo = TEMPO_API) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, tempo);
  });
}

function copiarDados(dados) {
  return JSON.parse(JSON.stringify(dados));
}

export async function buscarClientes() {
  await aguardar();

  return copiarDados(clientesData);
}

export async function buscarClientePorId(clienteId) {
  await aguardar(250);

  const cliente = clientesData.find(
    (item) => item.id === clienteId
  );

  if (!cliente) {
    throw new Error("Cliente não encontrado.");
  }

  return copiarDados(cliente);
}

export async function cadastrarCliente(dadosCliente) {
  await aguardar(700);

  return {
    sucesso: true,
    mensagem: "Cliente cadastrado com sucesso.",
    cliente: {
      ...dadosCliente,
      id: `cliente-${Date.now()}`,
      codigo: `CF-CLI-${String(
        clientesData.length + 1
      ).padStart(3, "0")}`,
    },
  };
}

export async function atualizarCliente(
  clienteId,
  dadosCliente
) {
  await aguardar(650);

  const cliente = clientesData.find(
    (item) => item.id === clienteId
  );

  if (!cliente) {
    throw new Error("Cliente não encontrado.");
  }

  return {
    sucesso: true,
    mensagem: "Cliente atualizado com sucesso.",
    cliente: {
      ...cliente,
      ...dadosCliente,
    },
  };
}