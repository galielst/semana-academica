// ./components/Admin/ExportListas.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Button from "../ui/Button";
import Label from "../ui/Label";
import Select from "../ui/Select";
import escapeCSV from "../utils/escapeCSV";

export default function ExportListas() {
  const [eventId, setEventId] = useState("");
  const [rows, setRows] = useState([]);
  const [events, setEvents] = useState([]);

  // Cargar eventos disponibles
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("events").select("id,title").order("starts_at");
      setEvents(data || []);
    })();
  }, []);

  // Cargar inscripciones del evento seleccionado
  useEffect(() => {
    if (eventId) load();
    else setRows([]);
  }, [eventId]);

  async function load() {
    const { data, error } = await supabase
      .from("registrations_admin_view")
      .select("id, title, user_email, full_name, phone, checked_in_at")
      .eq("event_id", eventId)
      .order("full_name");
    if (!error) setRows(data || []);
  }

  // Eliminar inscripción
  async function removeRegistration(id) {
    if (!window.confirm("¿Eliminar inscripción de este alumno?")) return;
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (!error) load();
    else alert("Error al eliminar: " + error.message);
  }

  function toCSV() {
    const header = ["Nombre","Correo","Teléfono","Asistencia","Evento"];
    const lines = rows.map(r => [
      escapeCSV(r.full_name || ""),
      escapeCSV(r.user_email || ""),
      escapeCSV(r.phone || ""),
      escapeCSV(r.checked_in_at ? "Sí" : "No"),
      escapeCSV(r.title || "")
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista_evento_${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Label>Selecciona evento</Label>
      <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
        <option value="">—</option>
        {events.map(e => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </Select>

      {eventId && rows.length > 0 && (
        <div style={{marginTop:12, maxHeight:300, overflowY:"auto", border:"1px solid #e5e7eb", borderRadius:12, padding:8}}>
          <strong>Vista previa de alumnos inscritos ({rows.length}):</strong>
          <table style={{width:"100%", fontSize:13, marginTop:8, borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f3f4f6"}}>
                <th style={{textAlign:"left", padding:6}}>Nombre</th>
                <th style={{textAlign:"left", padding:6}}>Correo</th>
                <th style={{textAlign:"left", padding:6}}>Teléfono</th>
                <th style={{textAlign:"left", padding:6}}>Check-in</th>
                <th style={{textAlign:"center", padding:6}}>Acción</th> {/* Nueva columna */}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                  <td style={{padding:6}}>{r.full_name || "—"}</td>
                  <td style={{padding:6}}>{r.user_email}</td>
                  <td style={{padding:6}}>{r.phone || "—"}</td>
                  <td style={{padding:6}}>{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : "Pendiente"}</td>
                  <td style={{padding:6, textAlign:"center"}}>
                    <Button
                      onClick={() => removeRegistration(r.id)}
                      style={{ backgroundColor: "#ef4444", color: "#fff" }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{marginTop:8}}>
        <Button onClick={toCSV} disabled={!rows.length}>Descargar CSV</Button>
      </div>
    </div>
  );
}
