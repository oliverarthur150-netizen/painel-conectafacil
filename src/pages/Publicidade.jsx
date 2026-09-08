import { useEffect, useMemo, useState } from "react";
import "../styles/Publicidade.css";
import {
  listarAnunciosCloud,
  listarTelasCloud,
  alterarStatusAnuncioCloud,
  excluirAnuncioCloud,
} from "../services/publicidadeService"
import {
  enviarAnuncioCompleto,
  atualizarAnuncioCompleto,
} from "../services/midias.service"
const STORAGE_KEY = "conectafacil_publicidade";

const TELAS_DISPONIVEIS = [
  "Lancha 01",
  "Lancha 02",
  "Balsa 01",
  "Balsa 02",
  "Terminal",
];

function carregarAnuncios() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    const lista = dados ? JSON.parse(dados) : [];

    return lista.map((anuncio) => ({
      ...anuncio,
      telas:
        Array.isArray(anuncio.telas) && anuncio.telas.length > 0
          ? anuncio.telas
          : anuncio.tela
            ? [anuncio.tela]
            : [],
    }));
  } catch {
    return [];
  }
}

function salvarAnuncios(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

const formularioInicial = {
  nome: "",
  cliente: "",
  tipoMidia: "",
  duracao: "",
  valor: "",
  dataInicio: "",
  dataTermino: "",
  telas: [],
  arquivoNome: "",
  arquivoUrl: "",
  arquivoTipo: "",
};

export default function Publicidade() {
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [anuncios, setAnuncios] = useState(carregarAnuncios);
  const [telasCloud, setTelasCloud] = useState([])
  const [carregandoCloud, setCarregandoCloud] = useState(true)
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const [pesquisa, setPesquisa] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);
  const [anuncioEditandoId, setAnuncioEditandoId] = useState(null);
  const anunciosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    if (!termo) {
      return anuncios;
    }

    return anuncios.filter((anuncio) => {
      return (
        anuncio.nome.toLowerCase().includes(termo) ||
        anuncio.cliente.toLowerCase().includes(termo) ||
        (Array.isArray(anuncio.telas)
          ? anuncio.telas.join(" ")
          : anuncio.tela || ""
        )
          .toLowerCase()
          .includes(termo)
      );
    });
  }, [anuncios, pesquisa]);

  const anunciosAtivos = anuncios.filter(
    (anuncio) => anuncio.status === "Ativo"
  ).length;

  const anunciosAgendados = anuncios.filter(
    (anuncio) => anuncio.status === "Agendado"
  ).length;

  const anunciosExpirados = anuncios.filter(
    (anuncio) => anuncio.status === "Expirado"
  ).length;

  const receitaTotal = anuncios.reduce(
    (total, anuncio) => total + Number(anuncio.valor || 0),
    0
  );

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function alternarTela(tela) {
    setFormulario((anterior) => {
      const telasAtuais = Array.isArray(anterior.telas) ? anterior.telas : [];
      const jaSelecionada = telasAtuais.includes(tela);

      return {
        ...anterior,
        telas: jaSelecionada
          ? telasAtuais.filter((item) => item !== tela)
          : [...telasAtuais, tela],
      };
    });
  }

 function selecionarArquivo(evento) {
  const arquivo = evento.target.files?.[0];
setArquivoSelecionado(arquivo || null)
  if (!arquivo) {
    setFormulario((anterior) => ({
      ...anterior,
      arquivoNome: "",
      arquivoUrl: "",
      arquivoTipo: "",
    }));

    return;
  }

  const ehImagem = arquivo.type.startsWith("image/");
  const ehVideo = arquivo.type.startsWith("video/");

  if (!ehImagem && !ehVideo) {
    alert("Selecione uma imagem ou um vídeo MP4.");
    evento.target.value = "";
    return;
  }

  if (ehImagem && arquivo.size > 2 * 1024 * 1024) {
    alert(
      "A imagem é muito grande. Para este teste, escolha uma imagem com até 2 MB."
    );

    evento.target.value = "";
    return;
  }

  if (ehVideo) {
    setFormulario((anterior) => ({
      ...anterior,
      arquivoNome: arquivo.name,
      arquivoUrl: "",
      arquivoTipo: arquivo.type,
      tipoMidia: "video",
    }));

    return;
  }

  const leitor = new FileReader();

  leitor.onload = () => {
    setFormulario((anterior) => ({
      ...anterior,
      arquivoNome: arquivo.name,
      arquivoUrl: leitor.result,
      arquivoTipo: arquivo.type,
      tipoMidia: "imagem",
    }));
  };

  leitor.onerror = () => {
    alert("Não foi possível carregar essa imagem.");
  };

  leitor.readAsDataURL(arquivo);
}

  function fecharFormulario() {
  setFormularioAberto(false);
  setFormulario(formularioInicial);
  setAnuncioEditandoId(null);
  setArquivoSelecionado(null)
}

  function definirStatus(dataInicio, dataTermino) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataTermino) {
      const termino = new Date(`${dataTermino}T23:59:59`);

      if (termino < hoje) {
        return "Expirado";
      }
    }

    if (dataInicio) {
      const inicio = new Date(`${dataInicio}T00:00:00`);

      if (inicio > hoje) {
        return "Agendado";
      }
    }

    return "Ativo";
  }

  function atualizarStatusAutomaticos(lista) {
    let houveAlteracao = false;

    const listaAtualizada = lista.map((anuncio) => {
      if (anuncio.status === "Pausado") {
        return anuncio;
      }

      const novoStatus = definirStatus(
        anuncio.dataInicio,
        anuncio.dataTermino
      );

      if (novoStatus === anuncio.status) {
        return anuncio;
      }

      houveAlteracao = true;

      return {
        ...anuncio,
        status: novoStatus,
      };
    });

    return houveAlteracao ? listaAtualizada : lista;
  }
useEffect(() => {
  async function carregarDadosCloud() {
    try {
      setCarregandoCloud(true)

      const [anunciosCloud, telas] =
        await Promise.all([
          listarAnunciosCloud(),
          listarTelasCloud(),
        ])

      const anunciosConvertidos =
        anunciosCloud.map((anuncio) => ({
          id: anuncio.id,
          nome: anuncio.titulo || "Publicidade",
          cliente: anuncio.cliente || "",
          tipoMidia:
            anuncio.tipo_midia || "imagem",
          duracao:
            anuncio.duracao_segundos || 10,
          valor: anuncio.valor || 0,
          dataInicio:
            anuncio.data_inicio || "",
          dataTermino:
            anuncio.data_termino || "",
          status:
            anuncio.status === "ativo"
              ? "Ativo"
              : anuncio.status === "pausado"
                ? "Pausado"
                : anuncio.status,
          telas: (anuncio.telas || []).map(
            (tela) =>
              tela.nome ||
              tela.codigo
          ),
          arquivoNome:
            anuncio.titulo || "",
          arquivoUrl:
            anuncio.arquivo_url || "",
          arquivoTipo:
            anuncio.tipo_midia === "video"
              ? "video/mp4"
              : "image/*",
        }))

      setAnuncios(anunciosConvertidos)
      setTelasCloud(telas)
    } catch (error) {
      console.error(
        "Erro ao carregar publicidade da nuvem:",
        error
      )
    } finally {
      setCarregandoCloud(false)
    }
  }

  carregarDadosCloud()
}, [])
  useEffect(() => {
    function verificarDatas() {
      setAnuncios((listaAtual) => {
        const listaAtualizada = atualizarStatusAutomaticos(listaAtual);

        if (listaAtualizada !== listaAtual) {
          salvarAnuncios(listaAtualizada);
        }

        return listaAtualizada;
      });
    }

    verificarDatas();

    const intervalo = window.setInterval(verificarDatas, 60 * 1000);

    return () => window.clearInterval(intervalo);
  }, []);
function abrirNovoAnuncio() {
  setFormulario(formularioInicial);
  setAnuncioEditandoId(null);
  setFormularioAberto(true);
}

function editarAnuncio(anuncio) {
  setFormulario({
    nome: anuncio.nome || "",
    cliente: anuncio.cliente || "",
    tipoMidia: anuncio.tipoMidia || "",
    duracao: anuncio.duracao || "",
    valor: anuncio.valor || "",
    dataInicio: anuncio.dataInicio || "",
    dataTermino: anuncio.dataTermino || "",
    telas:
      Array.isArray(anuncio.telas) && anuncio.telas.length > 0
        ? anuncio.telas
        : anuncio.tela
          ? [anuncio.tela]
          : [],
    arquivoNome: anuncio.arquivoNome || "",
    arquivoUrl: anuncio.arquivoUrl || "",
    arquivoTipo: anuncio.arquivoTipo || "",
  });

  setAnuncioEditandoId(anuncio.id);
  setFormularioAberto(true);
}
async function salvarNovoAnuncio(evento) {
  evento.preventDefault()

  if (
    !formulario.nome.trim() ||
    !formulario.cliente.trim() ||
    !formulario.tipoMidia ||
    !Array.isArray(formulario.telas) ||
    formulario.telas.length === 0
  ) {
    alert(
      "Preencha o nome do anúncio, cliente, tipo de mídia e selecione pelo menos uma tela."
    )
    return
  }

  if (
    formulario.dataInicio &&
    formulario.dataTermino &&
    formulario.dataTermino < formulario.dataInicio
  ) {
    alert(
      "A data de término não pode ser anterior à data de início."
    )
    return
  }

  if (!anuncioEditandoId && !arquivoSelecionado) {
    alert(
      "Selecione uma imagem ou vídeo para enviar."
    )
    return
  }

  try {
    const normalizarTela = (valor = "") =>
      valor
        .toString()
        .toLowerCase()
        .replace(/[\s_-]+/g, "")

    const telasSelecionadasNormalizadas =
      formulario.telas.map(normalizarTela)

    const telaSelecionada =
      telasCloud.find((tela) =>
        telasSelecionadasNormalizadas.includes(
          normalizarTela(tela.nome)
        ) ||
        telasSelecionadasNormalizadas.includes(
          normalizarTela(tela.codigo)
        )
      )

    if (!telaSelecionada) {
      alert(
        "Não foi possível localizar a TV selecionada no Supabase."
      )
      return
    }

    if (anuncioEditandoId) {
      await atualizarAnuncioCompleto({
        anuncioId: anuncioEditandoId,
        arquivo: arquivoSelecionado,
        titulo: formulario.nome,
        cliente: formulario.cliente,
        duracaoSegundos:
          Number(formulario.duracao) || 10,
        valor:
          Number(formulario.valor) || 0,
        dataInicio:
          formulario.dataInicio || null,
        dataTermino:
          formulario.dataTermino || null,
        codigoTela:
          telaSelecionada.codigo,
      })

      alert("Anúncio atualizado com sucesso.")
    } else {
      await enviarAnuncioCompleto({
        arquivo: arquivoSelecionado,
        titulo: formulario.nome,
        cliente: formulario.cliente,
        duracaoSegundos:
          Number(formulario.duracao) || 10,
        valor:
          Number(formulario.valor) || 0,
        dataInicio:
          formulario.dataInicio || null,
        dataTermino:
          formulario.dataTermino || null,
        codigoTela:
          telaSelecionada.codigo,
      })

      alert(
        `Anúncio enviado para a nuvem e vinculado à ${telaSelecionada.nome}.`
      )
    }

    fecharFormulario()

    const anunciosCloud =
      await listarAnunciosCloud()

    const anunciosConvertidos =
      anunciosCloud.map((anuncio) => ({
        id: anuncio.id,
        nome:
          anuncio.titulo || "Publicidade",
        cliente:
          anuncio.cliente || "",
        tipoMidia:
          anuncio.tipo_midia || "imagem",
        duracao:
          anuncio.duracao_segundos || 10,
        valor:
          anuncio.valor || 0,
        dataInicio:
          anuncio.data_inicio || "",
        dataTermino:
          anuncio.data_termino || "",
        status:
          anuncio.status === "ativo"
            ? "Ativo"
            : anuncio.status === "pausado"
              ? "Pausado"
              : anuncio.status,
        telas:
          (anuncio.telas || []).map(
            (tela) =>
              tela.nome || tela.codigo
          ),
        arquivoNome:
          anuncio.titulo || "",
        arquivoUrl:
          anuncio.arquivo_url || "",
        arquivoTipo:
          anuncio.tipo_midia === "video"
            ? "video/mp4"
            : "image/*",
      }))

    setAnuncios(anunciosConvertidos)
  } catch (error) {
    console.error(
      "Erro ao salvar anúncio na nuvem:",
      error
    )

    alert(
      error?.message ||
        "Não foi possível salvar o anúncio na nuvem."
    )
  }
}
async function alterarStatusAnuncio(id) {
  try {
    const anuncio = anuncios.find(
      (item) => item.id === id
    )

    if (!anuncio) {
      return
    }

    const novoStatus =
      anuncio.status === "Pausado"
        ? "ativo"
        : "pausado"

    await alterarStatusAnuncioCloud(
      id,
      novoStatus
    )

    setAnuncios((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                novoStatus === "ativo"
                  ? "Ativo"
                  : "Pausado",
            }
          : item
      )
    )
  } catch (error) {
    console.error(
      "Erro ao alterar status:",
      error
    )

    alert(
      error?.message ||
        "Não foi possível alterar o anúncio."
    )
  }
}
async function excluirAnuncio(id) {
  const confirmou = window.confirm(
    "Tem certeza que deseja excluir este anúncio?"
  )

  if (!confirmou) {
    return
  }

  try {
    await excluirAnuncioCloud(id)

    setAnuncios((listaAtual) =>
      listaAtual.filter(
        (anuncio) => anuncio.id !== id
      )
    )
  } catch (error) {
    console.error(
      "Erro ao excluir anúncio:",
      error
    )

    alert(
      error?.message ||
        "Não foi possível excluir o anúncio."
    )
  }
}
  

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) {
      return "Não informada";
    }

    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  return (
    <section className="cloud-pagina">
      <div className="publicidade-header">
        <div>
          <span className="publicidade-subtitulo">
            MÓDULO DE PUBLICIDADE
          </span>

          <h1>Publicidade</h1>

          <p>Gerencie anúncios, campanhas e mídias das telas.</p>
        </div>

       <button
  className="btn-novo-anuncio"
  onClick={abrirNovoAnuncio}
>
  ＋ Novo anúncio
</button>
      </div>

      <div className="publicidade-cards">
        <div className="card-publicidade">
          <small>Anúncios Ativos</small>
          <strong>{anunciosAtivos}</strong>
        </div>

        <div className="card-publicidade">
          <small>Agendados</small>
          <strong>{anunciosAgendados}</strong>
        </div>

        <div className="card-publicidade">
          <small>Expirados</small>
          <strong>{anunciosExpirados}</strong>
        </div>

        <div className="card-publicidade">
          <small>Receita</small>
          <strong>{formatarValor(receitaTotal)}</strong>
        </div>
      </div>

      <div className="publicidade-pesquisa">
        <input
          value={pesquisa}
          onChange={(evento) => setPesquisa(evento.target.value)}
          placeholder="Pesquisar anúncio, cliente ou tela..."
        />
      </div>

      {anunciosFiltrados.length === 0 ? (
        <div className="publicidade-vazia">
          <div className="icone">📺</div>

          <h2>
            {anuncios.length === 0
              ? "Nenhum anúncio cadastrado"
              : "Nenhum anúncio encontrado"}
          </h2>

          <p>
            {anuncios.length === 0
              ? "Clique em Novo anúncio para criar sua primeira campanha."
              : "Tente pesquisar usando outro nome, cliente ou tela."}
          </p>
        </div>
      ) : (
        <div className="publicidade-lista">
          {anunciosFiltrados.map((anuncio) => {
            return (
              <article className="publicidade-anuncio-card" key={anuncio.id}>
                <div className="publicidade-anuncio-preview">
                  {anuncio.arquivoUrl ? (
                    <img
                      src={anuncio.arquivoUrl}
                      alt={anuncio.nome}
                      className="publicidade-anuncio-imagem" />
                  ) : (
                    <div className="publicidade-anuncio-sem-imagem">
                      <span>
                        {anuncio.tipoMidia === "video" ? "🎬" : "🖼️"}
                      </span>

                      <small>
                        {anuncio.arquivoNome || "Mídia não selecionada"}
                      </small>
                    </div>
                  )}
                </div>

                <div className="publicidade-anuncio-conteudo">
                  <div className="publicidade-anuncio-topo">
                    <div>
                      <span
                        className={`publicidade-status ${
                          anuncio.status === "Ativo"
                            ? "status-ativo"
                            : anuncio.status === "Agendado"
                              ? "status-agendado"
                              : anuncio.status === "Expirado"
                                ? "status-expirado"
                                : "status-pausado"
                        }`}
                      >
                        {anuncio.status}
                      </span>

                      <h3>{anuncio.nome}</h3>

                      <p>{anuncio.cliente}</p>
                    </div>

                    <div className="publicidade-anuncio-acoes">
                      <button
                        className="btn-editar-anuncio"
                        onClick={() => editarAnuncio(anuncio)}
                      >
                        Editar
                      </button>

                      {anuncio.status === "Expirado" ? (
                        <button
                          className="btn-status-anuncio btn-expirado-anuncio"
                          type="button"
                          disabled
                          title="Edite as datas para reativar esta campanha."
                        >
                          Expirado
                        </button>
                      ) : (
                        <button
                          className={`btn-status-anuncio ${
                            anuncio.status === "Pausado"
                              ? "btn-ativar-anuncio"
                              : "btn-pausar-anuncio"
                          }`}
                          onClick={() => alterarStatusAnuncio(anuncio.id)}
                        >
                          {anuncio.status === "Pausado" ? "Reativar" : "Pausar"}
                        </button>
                      )}

                      <button
                        className="btn-excluir-anuncio"
                        onClick={() => excluirAnuncio(anuncio.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="publicidade-anuncio-dados">
                    <div>
                      <small>Telas</small>
                      <strong>
                        {Array.isArray(anuncio.telas) && anuncio.telas.length > 0
                          ? anuncio.telas.join(", ")
                          : anuncio.tela || "Não informada"}
                      </strong>
                    </div>

                    <div>
                      <small>Duração</small>
                      <strong>
                        {anuncio.duracao
                          ? `${anuncio.duracao} segundos`
                          : "Não informada"}
                      </strong>
                    </div>

                    <div>
                      <small>Período</small>
                      <strong>
                        {formatarData(anuncio.dataInicio)} até{" "}
                        {formatarData(anuncio.dataTermino)}
                      </strong>
                    </div>

                    <div>
                      <small>Valor</small>
                      <strong>{formatarValor(anuncio.valor)}</strong>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {formularioAberto && (
        <div className="publicidade-modal-fundo">
          <div className="publicidade-modal">
            <div className="publicidade-modal-topo">
              <div>
                <span className="publicidade-subtitulo">
  {anuncioEditandoId ? "EDITAR CAMPANHA" : "NOVA CAMPANHA"}
</span>

<h2>
  {anuncioEditandoId ? "Editar anúncio" : "Novo anúncio"}
</h2>

                <p>Preencha os dados da campanha publicitária.</p>
              </div>

              <button
                className="publicidade-modal-fechar"
                onClick={fecharFormulario}
              >
                ×
              </button>
            </div>

            <form
              className="publicidade-formulario"
              onSubmit={salvarNovoAnuncio}
            >
              <div className="publicidade-campo publicidade-campo-completo">
                <label>Nome do anúncio</label>

                <input
                  type="text"
                  name="nome"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                  placeholder="Ex.: Promoção Restaurante do Porto"
                />
              </div>

              <div className="publicidade-campo">
                <label>Cliente</label>

                <input
                  type="text"
                  name="cliente"
                  value={formulario.cliente}
                  onChange={atualizarCampo}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="publicidade-campo">
                <label>Tipo de mídia</label>

                <select
                  name="tipoMidia"
                  value={formulario.tipoMidia}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione</option>
                  <option value="imagem">Imagem</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>

              <div className="publicidade-campo">
                <label>Duração da exibição</label>

                <input
                  type="number"
                  name="duracao"
                  value={formulario.duracao}
                  onChange={atualizarCampo}
                  min="1"
                  placeholder="Ex.: 15 segundos"
                />
              </div>

              <div className="publicidade-campo">
                <label>Valor da campanha</label>

                <input
                  type="number"
                  name="valor"
                  value={formulario.valor}
                  onChange={atualizarCampo}
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="publicidade-campo">
                <label>Data de início</label>

                <input
                  type="date"
                  name="dataInicio"
                  value={formulario.dataInicio}
                  onChange={atualizarCampo}
                />
              </div>

              <div className="publicidade-campo">
                <label>Data de término</label>

                <input
                  type="date"
                  name="dataTermino"
                  value={formulario.dataTermino}
                  onChange={atualizarCampo}
                />
              </div>

              <div className="publicidade-campo publicidade-campo-completo">
                <label>Telas de exibição</label>

                <div className="publicidade-telas-grid">
                  {TELAS_DISPONIVEIS.map((tela) => {
                    const selecionada = formulario.telas.includes(tela);

                    return (
                      <label
                        key={tela}
                        className={`publicidade-tela-opcao ${
                          selecionada ? "selecionada" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => alternarTela(tela)}
                        />

                        <span>{tela}</span>
                      </label>
                    );
                  })}
                </div>

                <small className="publicidade-telas-ajuda">
                  Selecione uma ou várias telas para esta campanha.
                </small>
              </div>

              <div className="publicidade-campo publicidade-campo-completo">
                <label>Arquivo da mídia</label>

                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={selecionarArquivo}
                />

               {formulario.arquivoNome && (
  <small className="publicidade-arquivo-selecionado">
    Arquivo selecionado: {formulario.arquivoNome}
  </small>
)}

{formulario.arquivoUrl && (
  <div className="publicidade-preview-formulario">
    <span>Prévia da imagem</span>

    <img
      src={formulario.arquivoUrl}
      alt="Prévia do anúncio"
    />
  </div>
)}

{formulario.arquivoNome &&
  formulario.tipoMidia === "video" && (
    <div className="publicidade-aviso-video">
      🎬 O vídeo foi selecionado. O envio definitivo será conectado ao
      armazenamento do Cloud.
    </div>
  )}
              </div>

              <div className="publicidade-formulario-acoes">
                <button
                  type="button"
                  className="btn-cancelar-anuncio"
                  onClick={fecharFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-salvar-anuncio"
                >
                  {anuncioEditandoId ? "Salvar alterações" : "Salvar anúncio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}