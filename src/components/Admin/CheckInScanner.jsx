import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../../supabaseClient";
import EventRegistrantsPanel from "./EventRegistrantsPanel";

export default function CheckInScanner() {
  const [result, setResult] = useState(null);
  const [lastError, setLastError] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");

  // Registrar asistencia en Supabase
  async function registrarAsistencia(payload) {
    setConfirmMsg("");
    setLastError("");

    try {
      const obj = JSON.parse(payload);
      if (!obj.reg_id || !obj.event_id) throw new Error("QR inválido");

      const { data: reg, error } = await supabase
        .from("registrations")
        .select("id, user_id, event_id, checked_in_at")
        .eq("id", obj.reg_id)
        .eq("event_id", obj.event_id)
        .single();

      if (error || !reg) throw new Error("Registro no encontrado");

      if (!reg.checked_in_at) {
        await supabase
          .from("registrations")
          .update({ checked_in_at: new Date().toISOString() })
          .eq("id", reg.id);
      }

      await supabase.from("attendance").insert({ registration_id: reg.id });
      setConfirmMsg("✔️ Asistencia registrada");
    } catch (err) {
      setLastError(err?.message || "Error al registrar asistencia");
    }
  }

  // ✅ Detecta QR leído
  const handleDecode = (decodedText) => {
    if (decodedText && decodedText !== result) {
      setResult(decodedText);
      registrarAsistencia(decodedText);
    }
  };

  // ✅ Maneja errores del scanner
  const handleError = (err) => {
    console.error(err);
    setLastError(err?.message || "Error en el escaneo");
  };

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "#000",
          aspectRatio: "16/9",
        }}
      >
        <Scanner
          onDecode={handleDecode}               // Correcto para QR detectado
          onError={handleError}                 // Correcto para errores
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div>
        <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Resultado</h4>
        {result && (
          <pre
            style={{
              fontSize: 12,
              padding: 8,
              background: "#f3f4f6",
              borderRadius: 12,
              overflowX: "auto",
            }}
          >
            {result}
          </pre>
        )}
        {confirmMsg && (
          <p style={{ color: "#065f46", fontSize: 14, marginTop: 8 }}>
            {confirmMsg}
          </p>
        )}
        {lastError && (
          <p style={{ color: "#b91c1c", fontSize: 14, marginTop: 8 }}>
            {lastError}
          </p>
        )}
        <EventRegistrantsPanel />
      </div>
    </div>
  );
}
