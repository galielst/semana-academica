import { useState } from "react";
import { supabase } from "../../supabaseClient";



export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password", // 👈 ajusta si tu frontend tiene otra URL
    });

    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("📧 Revisa tu correo para restablecer la contraseña.");
    }
  };

  return (
    <form onSubmit={handleForgotPassword} style={{ display: "grid", gap: 12 }}>
      <h3>¿Olvidaste tu contraseña?</h3>
      <input
        type="email"
        placeholder="Tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
      />
      <button type="submit" style={{ padding: 8, borderRadius: 8, background: "#2563eb", color: "#fff" }}>
        Enviar enlace de recuperación
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
