import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "../../supabaseClient";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";

export default function AlumnoArea({ profile, onInscripcion }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.rpc("events_with_counts");
    setLoading(false);
    setEvents(data || []);
  }

  async function inscribir(event) {
    const remaining = (event.capacity ?? 0) - (event.registered_count ?? 0);
    if (remaining <= 0) { alert("Cupo lleno"); return; }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", profile.id)
      .eq("event_id", event.id)
      .maybeSingle();

    if (existing) { alert("Ya estás inscrito en este evento"); return; }

    const { error } = await supabase
      .from("registrations")
      .insert({ user_id: profile.id, event_id: event.id });

    if (!error) {
      setShowMessage(true);
      fetchEvents();
      if (onInscripcion) onInscripcion();
      setTimeout(() => setShowMessage(false), 3000);
    }
  }

  function formatEndTime(ends_at) {
    if (!ends_at) return "";
    if (/^\d{2}:\d{2}/.test(ends_at)) {
      return ends_at.slice(0, 5);
    }
    return dayjs(ends_at).format("HH:mm");
  }

  const filtered = useMemo(() =>
    events.filter(e =>
      (e.title?.toLowerCase()?.includes(search.toLowerCase())) ||
      (e.type?.toLowerCase()?.includes(search.toLowerCase()))
    ), [events, search]);

  // 🔹 Agrupamos eventos por día y los ordenamos de menor a mayor fecha
  const eventsByDay = useMemo(() => {
    const grouped = {};
    filtered.forEach(ev => {
      const dayKey = dayjs(ev.starts_at).format("DD/MM/YYYY");
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(ev);
    });

    // 🔹 Ordenamos los días de menor a mayor
    const sortedKeys = Object.keys(grouped).sort((a, b) =>
      dayjs(a, "DD/MM/YYYY").toDate() - dayjs(b, "DD/MM/YYYY").toDate()
    );

    // 🔹 Ordenamos los eventos dentro de cada día por hora de inicio
    return sortedKeys.map(key => ({
      day: key,
      events: grouped[key].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    }));
  }, [filtered]);

  const blockColors = ["#f0f9ff", "#fff7ed", "#fef6ff", "#f0fdf4", "#fff1f3"];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Talleres & Conferencias</h3>
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      {loading ? <p>Cargando...</p> : (
        eventsByDay.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No hay resultados.</p>
        ) : (
          eventsByDay.map((group, idx) => (
            <div key={group.day} style={{ marginBottom: 16, backgroundColor: blockColors[idx % blockColors.length], padding: 12, borderRadius: 12 }}>
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Eventos del {group.day}</h4>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                {group.events.map(ev => (
                  <div key={ev.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontWeight: 700 }}>{ev.title}</h4>
                      <Badge>{ev.type}</Badge>
                    </div>
                    <p style={{ fontSize: 12, color: "#6b7280" }}>
                      {dayjs(ev.starts_at).format("DD/MM/YYYY HH:mm")}
                      {ev.ends_at && <> - {formatEndTime(ev.ends_at)}</>}
                    </p>
                    <p style={{ fontSize: 13, marginTop: 6 }}>
                      Cupo: {ev.registered_count}/{ev.capacity} — <b>{Math.max(0, (ev.capacity || 0) - (ev.registered_count || 0))} lugares</b>
                    </p>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <Button onClick={() => inscribir(ev)}>Inscribirme</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )
      )}

      {showMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            ✅ Registro exitoso. Tu QR se generará en <b>'Mis registros'</b>.
          </div>
        </div>
      )}
    </Card>
  );
}
