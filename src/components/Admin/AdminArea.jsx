import { useState } from "react";
import { supabase } from "../../supabaseClient";
import Card from "../ui/Card";
import Button from "../ui/Button";
import AdminEventos from "./AdminEventos";
import CheckInScanner from "./CheckInScanner";
import ExportListas from "./ExportListas";
import "../../styles/global.css"; // ajusta la ruta según donde esté tu AdminArea.jsx

export default function AdminArea() {
  const [tab, setTab] = useState("eventos"); // eventos | checkin | export | llenos
  const [message, setMessage] = useState(null);

  // 👉 Función para registrar asistencia
  async function registrarAsistencia(payload) {
    try {
      const { reg_id } = JSON.parse(payload); // el QR trae { reg_id, event_id }

      const { error } = await supabase
        .from("attendance")
        .insert({ registration_id: reg_id });

      if (error) throw error;

      setMessage("✅ Asistencia registrada con éxito");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al registrar asistencia");
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <Card>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Button onClick={() => setTab("eventos")}>Eventos</Button>
        <Button onClick={() => setTab("checkin")}>Check-in (QR)</Button>
        <Button onClick={() => setTab("export")}>Listas</Button>
        <Button onClick={() => setTab("llenos")}>Eventos Llenos</Button>
      </div>

      {/* Contenido según tab */}
      {tab === "eventos" && <AdminEventos />}
      {tab === "checkin" && <CheckInScanner onResult={registrarAsistencia} />}
      {tab === "export" && <ExportListas />}
      {tab === "llenos" && <AdminEventos filterFull={true} />}

      {/* Mensaje temporal */}
      {message && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f3f4f6",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}
    </Card>
  );
}
