import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 👈 añadimos React Router
import { supabase } from "./supabaseClient";
import "./styles/global.css";

import Card from "./components/ui/Card";
import Button from "./components/ui/Button";

import AuthForm from "./components/Auth/AuthForm";
import AdminHint from "./components/Auth/AdminHint";
import ProfileForm from "./components/Profile/ProfileForm";
import AlumnoArea from "./components/Alumno/AlumnoArea";
import MisRegistros from "./components/Alumno/MisRegistros";
import AdminArea from "./components/Admin/AdminArea";
import ForgotPasswordForm from "./components/Auth/ForgotPasswordForm"; // 👈 ahora dentro de Auth
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("public");
  const [refreshFlag, setRefreshFlag] = useState(0);

  // 👇 Manejo de sesión
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    })();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,role,full_name,phone")
        .eq("id", session.user.id)
        .single();
      if (!error) {
        setProfile(data);
        setView(data.role === "admin" ? "admin" : "alumno");
      }
    })();
  }, [session?.user?.id]);

  return (
    <Router>
      <Routes>
        {/* 🔹 Rutas especiales para recuperación de contraseña */}
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* 🔹 Ruta principal */}
        <Route
          path="/"
          element={
            !session ? (
              <div
                style={{
                  minHeight: "100vh",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    maxWidth: 960,
                    width: "100%",
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <Card>
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      Registro de Talleres & Conferencias
                    </h1>
                    <p style={{ color: "#6b7280", marginBottom: 12 }}>
                      Regístrate con tu correo para inscribirte a actividades
                      con cupo, generar tu QR y pasar lista en el evento.
                    </p>
                    <AuthForm />
                  </Card>
                  <Card>
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      Semana Académica Administración y Contaduría
                    </h2>
                    <AdminHint />
                  </Card>
                </div>
              </div>
            ) : (
              <div
                style={{ minHeight: "100vh", background: "#f9fafb", padding: 16 }}
              >
                <header
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>
                      Sistema de Inscripciones con QR
                    </h1>
                    <p style={{ fontSize: 12, color: "#6b7280" }}>
                      Bienvenido {profile?.full_name || profile?.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      onClick={() => setView("alumno")}
                      className={view === "alumno" ? "active" : ""}
                    >
                      Alumno
                    </Button>
                    {profile?.role === "admin" && (
                      <Button
                        onClick={() => setView("admin")}
                        className={view === "admin" ? "active" : ""}
                      >
                        Admin
                      </Button>
                    )}
                    <Button onClick={() => supabase.auth.signOut()}>
                      Salir
                    </Button>
                  </div>
                </header>

                <main
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "2fr 1fr",
                  }}
                >
                  <div style={{ display: "grid", gap: 16 }}>
                    {view === "alumno" && (
                      <AlumnoArea
                        profile={profile}
                        onInscripcion={() =>
                          setRefreshFlag((prev) => prev + 1)
                        }
                      /> 
                    )}
                    {view === "admin" && <AdminArea />}
                  </div>
                  
                  <div className="space-y-6">
                    <ProfileForm profile={profile} onSaved={setProfile} />
                    <MisRegistros refreshFlag={refreshFlag} />
                  </div>
                </main>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}
