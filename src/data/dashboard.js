export const dashboardData = {
  usuario: {
    nome: "Diogo",
    cargo: "Administrador Geral",
  },

  operacao: {
    titulo: "Funcionamento normal",
    descricao:
      "Todos os principais serviços estão disponíveis",
    status: "online",
  },

  resumo: [
    {
      id: 1,
      titulo: "Telas online",
      valor: "18",
      detalhe: "2 telas offline",
      tendencia: "+3 este mês",
      icone: "telas",
      cor: "azul",
    },
    {
      id: 2,
      titulo: "Clientes ativos",
      valor: "11",
      detalhe: "1 novo cliente",
      tendencia: "+9,8%",
      icone: "clientes",
      cor: "roxo",
    },
    {
      id: 3,
      titulo: "Campanhas ativas",
      valor: "24",
      detalhe: "5 programadas",
      tendencia: "+4 hoje",
      icone: "campanhas",
      cor: "laranja",
    },
    {
      id: 4,
      titulo: "Receita mensal",
      valor: "R$ 8.750",
      detalhe: "Meta: R$ 10 mil",
      tendencia: "+12,4%",
      icone: "receita",
      cor: "verde",
    },
  ],

  financeiro: {
    totalPeriodo: "R$ 42.680",
    crescimento: "12,4%",

    meses: [
      {
        mes: "Fev",
        valor: 44,
      },
      {
        mes: "Mar",
        valor: 58,
      },
      {
        mes: "Abr",
        valor: 51,
      },
      {
        mes: "Mai",
        valor: 70,
      },
      {
        mes: "Jun",
        valor: 78,
      },
      {
        mes: "Jul",
        valor: 90,
      },
    ],
  },

  telas: [
    {
      id: 1,
      nome: "TV Balsa 01",
      local: "Balsa de veículos",
      status: "online",
      atividade: "Atualizada agora",
    },
    {
      id: 2,
      nome: "TV Balsa 02",
      local: "Balsa de veículos",
      status: "online",
      atividade: "Atualizada há 2 min",
    },
    {
      id: 3,
      nome: "TV Lancha 01",
      local: "Lancha de passageiros",
      status: "offline",
      atividade: "Sem conexão há 18 min",
    },
    {
      id: 4,
      nome: "TV Ponto 01",
      local: "Terminal de Lucena",
      status: "online",
      atividade: "Atualizada há 5 min",
    },
  ],

  atividades: [
    {
      id: 1,
      titulo: "Nova campanha publicada",
      descricao: "Supermercado Beira Mar",
      horario: "Agora",
      tipo: "campanha",
    },
    {
      id: 2,
      titulo: "TV voltou a ficar online",
      descricao: "TV Balsa 02",
      horario: "Há 8 min",
      tipo: "tela",
    },
    {
      id: 3,
      titulo: "Novo cliente cadastrado",
      descricao: "Mercadinho São José",
      horario: "Há 35 min",
      tipo: "cliente",
    },
    {
      id: 4,
      titulo: "Programação atualizada",
      descricao: "Grupo Travessia Principal",
      horario: "Há 1 hora",
      tipo: "programacao",
    },
  ],

  alertas: [
    {
      id: 1,
      titulo: "TV Lancha 01 offline",
      descricao:
        "A tela está sem comunicação há 18 minutos.",
      tipo: "erro",
    },
    {
      id: 2,
      titulo: "Mensalidade vence hoje",
      descricao:
        "Supermercado Beira Mar precisa de atenção.",
      tipo: "aviso",
    },
    {
      id: 3,
      titulo: "Campanhas programadas",
      descricao:
        "Cinco campanhas serão iniciadas hoje.",
      tipo: "info",
    },
  ],

  travessia: {
    titulo: "Operação da travessia",
    descricao:
      "Embarques, anúncios e painéis estão sincronizados.",
    atualizadoEm: "Sistema atualizado agora",
  },
};