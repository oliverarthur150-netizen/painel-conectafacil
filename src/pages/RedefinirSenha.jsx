import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (evento) => {
        if (!ativo) return;

        if (evento === "PASSWORD_RECOVERY") {
          setAutorizado(true);
          setMensagem("");
          setCarregando(false);
        }
      }
    );

    async function verificarLink() {
      try {
        const parametros = new URLSearchParams(
          window.location.search
        );

        const fragmento = new URLSearchParams(
          window.location.hash.substring(1)
        );

        const erroLink =
          parametros.get("error_description") ||
          fragmento.get("error_description");

        if (erroLink) {
          throw new Error(
            decodeURIComponent(erroLink.replace(/\+/g, " "))
          );
        }

        const codigo = parametros.get("code");
        const token = parametros.get("token_hash");
        const tipo = parametros.get("type");

        if (token && tipo === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "recovery",
          });

          if (error) throw error;

          if (ativo) setAutorizado(true);
        } else if (codigo) {
          const { data, error } =
            await supabase.auth.getSession();

          if (error) throw error;

          if (data.session) {
            if (ativo) setAutorizado(true);
          } else {
            const resultado =
              await supabase.auth.exchangeCodeForSession(codigo);

            if (resultado.error) throw resultado.error;

            if (ativo) setAutorizado(true);
          }
        } else if (
          fragmento.get("type") === "recovery"
        ) {
          const { data, error } =
            await supabase.auth.getSession();

          if (error) throw error;

          if (data.session) {
            if (ativo) setAutorizado(true);
          } else if (ativo) {
            setMensagem(
              "Não foi possível validar o link. Solicite um novo e-mail de recuperação."
            );
          }
        } else if (ativo) {
          setMensagem(
            "Abra esta página pelo link de recuperação enviado ao seu e-mail."
          );
        }
      } catch (erro) {
        if (ativo) {
          setMensagem(
            erro.message ||
              "O link de recuperação é inválido ou expirou."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    verificarLink();

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function salvarNovaSenha(evento) {
    evento.preventDefault();

    if (!autorizado) {
      setMensagem(
        "É necessário abrir um link de recuperação válido."
      );
      return;
    }

    if (novaSenha.length < 8) {
      setMensagem(
        "A nova senha precisa ter pelo menos 8 caracteres."
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem("As duas senhas não são iguais.");
      return;
    }

    try {
      setSalvando(true);
      setMensagem("");

      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) throw error;

      setConcluido(true);
      setNovaSenha("");
      setConfirmarSenha("");
      setMensagem("Senha alterada com sucesso!");

      await supabase.auth.signOut();
    } catch (erro) {
      setMensagem(
        erro.message || "Não foi possível alterar a senha."
      );
    } finally {
      setSalvando(false);
    }
  }

  const estiloInput = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginTop: "8px",
    marginBottom: "20px",
    borderRadius: "9px",
    border: "1px solid #45617e",
    background: "#0b1d33",
    color: "#ffffff",
    fontSize: "15px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #08172b, #122b49)",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          borderRadius: "18px",
          background: "#142a46",
          color: "#ffffff",
          boxShadow: "0 15px 45px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <h1
            style={{
              fontSize: "25px",
              marginBottom: "8px",
            }}
          >
            📺 ConectaFácil Cloud
          </h1>

          <p
            style={{
              color: "#b9c9dc",
              fontSize: "14px",
            }}
          >
            Recuperação de acesso administrativo
          </p>
        </div>

        {carregando ? (
          <p style={{ textAlign: "center" }}>
            Verificando link de recuperação...
          </p>
        ) : concluido ? (
          <p
            style={{
              color: "#67e8a5",
              textAlign: "center",
            }}
          >
            Sua senha foi atualizada com sucesso.
            Você já pode utilizá-la para entrar
            no painel administrativo.
          </p>
        ) : autorizado ? (
          <form onSubmit={salvarNovaSenha}>
            <label htmlFor="novaSenha">
              Nova senha
            </label>

            <input
              id="novaSenha"
              type="password"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(evento) =>
                setNovaSenha(evento.target.v
