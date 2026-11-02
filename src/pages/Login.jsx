import { useState } from "react";
import { supabase } from "../services/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

      if (error) {
        setMensagem("E-mail ou senha inválidos.");
      } else {
        window.location.replace("/cloud");
      }
    } catch {
      setMensagem("Não foi possível conectar ao serviço.");
    } finally {
      setCarregando(false);
    }
  }

  async function recuperarSenha() {
    if (!email.trim()) {
      setMensagem("Informe seu e-mail primeiro.");
      return;
    }

    setCarregando(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              window.location.origin +
              "/cloud/redefinir-senha",
          }
        );

      if (error) throw error;

      setMensagem(
        "Se o e-mail estiver cadastrado, você receberá um link de recuperação."
      );
    } catch {
      setMensagem("Não foi possível solicitar a recuperação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#071525",
        padding: 20,
      }}
    >
      <form
        onSubmit={entrar}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          borderRadius: 20,
          background: "#142b46",
          color: "white",
        }}
      >
        <h1>ConectaFácil Cloud</h1>
        <p>Acesso administrativo</p>

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        />

        <button type="submit" disabled={carregando}>
          {carregando ? "Aguarde..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={recuperarSenha}
          disabled={carregando}
          style={{
            display: "block",
            marginTop: 20,
            background: "transparent",
            border: "none",
            color: "#60caff",
            cursor: "pointer",
          }}
        >
          Esqueci minha senha
        </button>

        {mensagem && <p role="status">{mensagem}</p>}
      </form>
    </div>
  );
}
