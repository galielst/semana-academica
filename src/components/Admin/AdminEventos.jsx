import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { supabase } from "../../supabaseClient";
import EventForm from "./EventForm";
import EventActions from "./EventActions";

export default function AdminEventos({ filterFull = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 fetchData con ordenamiento
  async function fetchData() {
    setLoading(true);
    const { data } = await supabase.rpc("events_with_counts");
    setLoading(false);

    // Ordenamos primero por fecha/hora de inicio y luego por título
    let sortedData = (data || []).sort((a, b) => {
      const startA = new Date(a.starts_at);
      const startB = new Date(b.starts_at);

      if (startA < startB) return -1;
      if (startA > startB) return 1;

      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });

    // 🔹 Si filterFull es true, mostramos solo eventos llenos
    if (filterFull) {
      sortedData = sortedData.filter(e => e.registered_count >= e.capacity);
    }

    setEvents(sortedData);
  }

  const handleEdit = (event) => {
    setEditingEvent(event);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  function formatEndTime(ends_at) {
    if (!ends_at) return "";
    if (/^\d{2}:\d{2}/.test(ends_at)) {
      return ends_at.slice(0, 5);
    }
    return dayjs(ends_at).format("HH:mm");
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Formulario arriba */}
      <div ref={formRef}>
        <EventForm
          eventToEdit={editingEvent}
          onCreated={() => {
            fetchData();
            setEditingEvent(null);
          }}
          onCancel={() => setEditingEvent(null)}
        />
      </div>

      {/* Eventos abajo en 2 columnas */}
      <div>
        <h4 style={{ fontWeight: 700, marginBottom: 8 }}>
          {filterFull ? "Eventos llenos" : "Eventos creados"}
        </h4>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700 }}>
                      {e.title}{" "}
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        ({e.type})
                      </span>
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280" }}>
                      {dayjs(e.starts_at).format("DD/MM/YYYY HH:mm")}
                      {e.ends_at && <> - {formatEndTime(e.ends_at)}</>}
                    </p>
                    <p style={{ fontSize: 12 }}>
                      Cupo: {e.registered_count}/{e.capacity}
                    </p>
                  </div>
                  <EventActions
                    eventId={e.id}
                    onChanged={fetchData}
                    onEdit={() => handleEdit(e)}
                  />
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
                {filterFull ? "No hay eventos llenos." : "No hay eventos creados aún."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
