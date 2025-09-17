import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("alumno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (existingUser) {
          setError("❌ Este correo ya está registrado. Intenta iniciar sesión.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const user = data.user;
        if (!user) {
          setError("❌ No se pudo crear el usuario. Intenta de nuevo.");
          return;
        }

        await supabase.from("profiles").insert({
          id: user.id,
          email,
          role,
          full_name: "",
          phone: ""
        });

        setMessage(
          "✅ Registro exitoso. Ingresa a tu correo y valida tu cuenta para poder ingresar."
        );
        setEmail("");
        setPassword("");
        setRole("alumno");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) setError("❌ Credenciales incorrectas. Intenta de nuevo.");
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
      }}
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Botones modo */}
        <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
          <Button
            type="button"
            onClick={() => setMode("login")}
            variant={mode === "login" ? "primary" : "secondary"}
          >
            Iniciar sesión
          </Button>
          <Button
            type="button"
            onClick={() => setMode("signup")}
            variant={mode === "signup" ? "primary" : "secondary"}
          >
            Crear cuenta
          </Button>
        </div>

        {/* Selección de rol en signup */}
        {mode === "signup" && (
          <div>
            <Label>Rol</Label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="alumno">Alumno</option>
            </Select>
          </div>
        )}

        {/* Campos */}
        <div>
          <Label>Correo</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "80%" }}
          />
        </div>

        <div>
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "80%" }}
          />
        </div>

        {/* Mensajes */}
        {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
        {message && <p style={{ color: "#16a34a", fontSize: 13 }}>{message}</p>}

        {/* Botón submit */}
        <Button disabled={loading}  style={{ width: "85%" }}>
          {loading ? "Procesando..." : mode === "signup" ? "Registrarme" : "Entrar"}
        </Button>

        {/* Enlace a recuperar contraseña */}
        {mode === "login" && (
          <p style={{ fontSize: 14, textAlign: "center", marginTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        )}

        {mode === "signup" && (
          <p style={{ fontSize: 13, color: "#4b5563" }}>
            Una vez dando clic en <b>Registrarme</b>, revisa tu bandeja de correo para validar tu cuenta.
          </p>
        )}
      </form>
    </div>
  );
}
