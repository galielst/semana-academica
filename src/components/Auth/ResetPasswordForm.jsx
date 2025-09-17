import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage("✅ Contraseña actualizada con éxito, serás redirigido al inicio...");
      setSuccess(true);
    }
  }

  // ⏳ Redirigir después de 4 segundos si la actualización fue exitosa
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}
    >
      <h3>Ingresa tu nueva contraseña</h3>
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Confirmar contraseña"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: 10,
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Guardar nueva contraseña
      </button>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </form>
  );
}
