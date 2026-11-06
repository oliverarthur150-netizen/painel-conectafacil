
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Monitor,
  Plus,
  Trash2,
  RefreshCw,
  Tv,
  Image,
  Clock,
} from "lucide-react";

import { supabase } from "../services/supabase";

export default function Programacao() {
  const [telas, setTelas] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [vinculos, setVinculos] = useState([]);
  const [telaSelecionada, setTelaSelecionada] = useState("");
  const [anuncioSelecionado, setAnuncioSelecionado] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resultadoTelas, resultadoAnuncios, resultadoVinculos] =
        await Promise.all([
          supabase
            .from("telas")
            .select("id,codigo,nome,local")
            .order("nome"),

          supabase
            .from("anuncios")
            .select(
              "id,titulo,cliente,tipo_midia,arquivo_url,duracao_segundos,data_inicio,data_termino,status,prioridade,visualizacoes"
            )
            .order("prioridade", { ascending: false }),

          supabase
            .from("anuncios_telas")
            .select("id,anuncio_id,tela_id"),
        ]);

      if (resultadoTelas.error) throw resultadoTelas.error;
      if (resultadoAnuncios.error) throw resultadoAnuncios.error;
      if (resultadoVinculos.error) throw resultadoVinculos.error;

      const listaTelas = resultadoTelas.data || [];

      setTelas(listaTelas);
      setAnuncios(resultadoAnuncios.data || []);
      setVinculos(resultadoVinculos.data || []);

      setTelaSelecionada((atual) => {
        if (listaTelas.some((t) => t.id === atual)) return atual;
        return listaTelas[0]?.id || "";
      });

    } catch (error) {
      setErro(error.message || "Erro ao carregar programação.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const anunciosDaTela = useMemo(() => {
    return vinculos
      .filter((v) => v.tela_id === telaSelecionada)
      .map((v) => ({
        ...v,
        anuncio: anuncios.find((a) => a.id === v.anuncio_id),
      }))
      .filter((v) => v.anuncio);
  }, [vinculos, anuncios, telaSelecionada]);

  const anunciosDisponiveis = anuncios.filter(
    (anuncio) =>
      anuncio.status === "ativo" &&
      !vinculos.some(
        (v) =>
          v.tela_id === telaSelecionada &&
          v.anuncio_id === anuncio.id
      )
  );

  async function adicionarAnuncio() {
    if (!telaSelecionada || !anuncioSelecionado) {
      setErro("Selecione uma TV e um anúncio.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      const { data, error } = await supabase
        .from("anuncios_telas")
        .insert({
          anuncio_id: anuncioSelecionado,
          tela_id: telaSelecionada,
        })
        .select("id,anuncio_id,tela_id")
        .single();

      if (error) throw error;

      setVinculos((atuais) => [...atuais, data]);
      setAnuncioSelecionado("");
      setMensagem("Anúncio adicionado à programação com sucesso!");

    } catch (error) {
      setErro(error.message || "Não foi possível adicionar o anúncio.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerAnuncio(vinculoId) {
    const confirmar = window.confirm(
      "Deseja retirar este anúncio da programação desta TV?"
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const { error } = await supabase
        .from("anuncios_telas")
        .delete()
        .eq("id", vinculoId);

      if (error) throw error;

      setVinculos((atuais) =>
        atuais.filter((v) => v.id !== vinculoId)
      );

      setMensagem("Anúncio retirado da programação.");

    } catch (error) {
      setErro(error.message || "Erro ao remover anúncio.");
    }
  }

  const telaAtual = telas.find(
    (t) => t.id === telaSelecionada
  );

  const totalDuracao = anunciosDaTela.reduce(
    (total, item) =>
      total + Number(item.anuncio.duracao_segundos || 0),
    0
  );

  const painel = {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "16px",
    padding: "20px",
  };

  const botao = {
    border: "none",
    borderRadius: "9px",
    padding: "11px 16px",
    fontWeight: "700",
    cursor: "pointer",
  };

  const campo = {
    width: "100%",
    padding: "12px",
    borderRadius: "9px",
    border: "1px solid #45617e",
    background: "#102943",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <section
      className="cloud-pagina"
      style={{ color: "#fff" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div>
          <span style={{
            color: "#38bdf8",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "2px",
          }}>
            CENTRAL DE CONTEÚDOS
          </span>

          <h1 style={{ margin: "8px 0" }}>
            📅 Programação
          </h1>

          <p style={{ color: "#94a9c0", margin: 0 }}>
            Organize os anúncios exibidos em cada tela.
          </p>
        </div>

        <button
          onClick={carregarDados}
          disabled={carregando}
          style={{
            ...botao,
            background: "#1769e8",
            color: "#fff",
          }}
        >
          <RefreshCw
            size={15}
            style={{ verticalAlign: "middle", marginRight: 7 }}
          />
          Atualizar
        </button>
      </div>

      {erro && (
        <div style={{
          ...painel,
          color: "#fca5a5",
          marginBottom: "16px",
          borderColor: "#ef4444",
        }}>
          {erro}
        </div>
      )}

      {mensagem && (
        <div style={{
          ...painel,
          color: "#6ee7b7",
          marginBottom: "16px",
        }}>
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div style={painel}>
          Carregando programação...
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "15px",
            marginBottom: "22px",
          }}>
            {[
              {
                titulo: "TVs cadastradas",
                valor: telas.length,
                icone: <Tv size={23} />,
              },
              {
                titulo: "Anúncios disponíveis",
                valor: anuncios.length,
                icone: <Image size={23} />,
              },
              {
                titulo: "Anúncios nesta TV",
                valor: anunciosDaTela.length,
                icone: <Monitor size={23} />,
              },
              {
                titulo: "Duração total",
                valor: `${Math.floor(totalDuracao / 60)} min`,
                icone: <Clock size={23} />,
              },
            ].map((item) => (
              <div
                key={item.titulo}
                style={{
                  ...painel,
                  background: "#10243a",
                }}
              >
                <div style={{ color: "#38bdf8" }}>
                  {item.icone}
                </div>

                <h2 style={{ margin: "12px 0 5px" }}>
                  {item.valor}
                </h2>

                <span style={{
                  color: "#9bb0c8",
                  fontSize: "13px",
                }}>
                  {item.titulo}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            ...painel,
            marginBottom: "20px",
          }}>
            <h3 style={{ marginTop: 0 }}>
              <Monitor
                size={19}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Selecione a televisão
            </h3>

            <select
              value={telaSelecionada}
              onChange={(e) => setTelaSelecionada(e.target.value)}
              style={campo}
            >
              {telas.length === 0 && (
                <option value="">Nenhuma TV cadastrada</option>
              )}

              {telas.map((tela) => (
                <option
                  key={tela.id}
                  value={tela.id}
                  style={{ color: "#111" }}
                >
                  {tela.nome || tela.codigo} — {tela.local || "Sem local"}
                </option>
              ))}
            </select>

            {telaAtual && (
              <p style={{
                color: "#94a9c0",
                fontSize: "13px",
                marginBottom: 0,
              }}>
                Código: {telaAtual.codigo} · Local: {telaAtual.local}
              </p>
            )}
          </div>

          <div style={{
            ...painel,
            marginBottom: "20px",
          }}>
            <h3 style={{ marginTop: 0 }}>
              <Plus
                size={19}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Adicionar anúncio à TV
            </h3>

            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <select
                value={anuncioSelecionado}
                onChange={(e) => setAnuncioSelecionado(e.target.value)}
                style={{ ...campo, flex: "1 1 250px" }}
                disabled={!telaSelecionada}
              >
                <option value="">
                  Selecione um anúncio disponível
                </option>

                {anunciosDisponiveis.map((anuncio) => (
                  <option
                    key={anuncio.id}
                    value={anuncio.id}
                    style={{ color: "#111" }}
                  >
                    {anuncio.titulo} — {anuncio.cliente}
                  </option>
                ))}
              </select>

              <button
                onClick={adicionarAnuncio}
                disabled={salvando || !anuncioSelecionado}
                style={{
                  ...botao,
                  background: salvando ? "#64748b" : "#0875f5",
                  color: "#fff",
                }}
              >
                <Plus
                  size={16}
                  style={{ verticalAlign: "middle", marginRight: 5 }}
                />
                {salvando ? "Salvando..." : "Adicionar"}
              </button>
            </div>
          </div>

          <div style={painel}>
            <h3 style={{ marginTop: 0 }}>
              Programação da TV selecionada
            </h3>

            {anunciosDaTela.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "35px 10px",
                color: "#94a9c0",
              }}>
                <CalendarDays size={35} />
                <p>Esta TV ainda não possui anúncios vinculados.</p>
                <span style={{ fontSize: "13px" }}>
                  Escolha um anúncio acima para começar.
                </span>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gap: "12px",
              }}>
                {anunciosDaTela.map((item, index) => {
                  const anuncio = item.anuncio;

                  return (
                    <article
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        flexWrap: "wrap",
                        padding: "15px",
                        borderRadius: "12px",
                        background: "#102943",
                        border: "1px solid #29435f",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "13px",
                      }}>
                        <div style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "#164e78",
                          display: "grid",
                          placeItems: "center",
                          color: "#7dd3fc",
                        }}>
                          <Image size={19} />
                        </div>

                        <div>
                          <strong>
                            {index + 1}. {anuncio.titulo}
                          </strong>

                          <p style={{
                            color: "#9bb0c8",
                            margin: "5px 0",
                            fontSize: "13px",
                          }}>
                            {anuncio.cliente} · {anuncio.tipo_midia}
                            {" · "}
                            {anuncio.duracao_segundos || 0}s
                          </p>

                          <span style={{
                            color: "#6ee7b7",
                            fontSize: "12px",
                          }}>
                            Vinculado à TV
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removerAnuncio(item.id)}
                        style={{
                          ...botao,
                          background: "#4b202b",
                          color: "#fca5a5",
                        }}
                      >
                        <Trash2
                          size={15}
                          style={{ verticalAlign: "middle", marginRight: 5 }}
                        />
                        Retirar
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
