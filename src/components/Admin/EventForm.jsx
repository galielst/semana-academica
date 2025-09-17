import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";

export default function EventForm({ onCreated, eventToEdit, onCancel }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("taller");
  const [starts_at, setStartsAt] = useState("");
  const [ends_at, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setType(eventToEdit.type || "taller");
      setCapacity(eventToEdit.capacity || 50);

      if (eventToEdit.starts_at) {
        const dt = new Date(eventToEdit.starts_at);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
        setStartsAt(local.toISOString().slice(0, 16));
      } else {
        setStartsAt("");
      }

      if (eventToEdit.ends_at) {
        if (/^\d{2}:\d{2}/.test(eventToEdit.ends_at)) {
          setEndsAt(eventToEdit.ends_at.slice(0, 5));
        } else {
          const dtEnd = new Date(eventToEdit.ends_at);
          const localEnd = new Date(dtEnd.getTime() - dtEnd.getTimezoneOffset() * 60000);
          setEndsAt(localEnd.toISOString().slice(11, 16));
        }
      } else {
        setEndsAt("");
      }
    } else {
      resetForm();
    }
  }, [eventToEdit]);

  const resetForm = () => {
    setTitle("");
    setType("taller");
    setStartsAt("");
    setEndsAt("");
    setCapacity(50);
    setErrorMessage("");
  };

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (starts_at && ends_at) {
      const startDate = new Date(starts_at);
      const [h, m] = ends_at.split(":");
      const endDate = new Date(startDate);
      endDate.setHours(parseInt(h), parseInt(m), 0, 0);
      if (endDate <= startDate) {
        setErrorMessage("La hora de fin debe ser posterior a la de inicio.");
        setLoading(false);
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();

    try {
      if (eventToEdit) {
        const { error } = await supabase
          .from("events")
          .update({
            title,
            type,
            starts_at: starts_at || null,
            ends_at: ends_at || null,
            capacity,
          })
          .eq("id", eventToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert({
          title,
          type,
          starts_at: starts_at || null,
          ends_at: ends_at || null,
          capacity,
          created_by: user.id,
        });
        if (error) throw error;
      }
      resetForm();
      onCreated?.();
    } catch (err) {
      setErrorMessage("Error al guardar el evento: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Estilos para inputs adaptativos
  const inputStyle = {
    width: "auto",
    minWidth: "80px",
    maxWidth: "100%",
    padding: "6px 8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "60px",
    padding: "8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    resize: "vertical",
  };

  return (
    <div>
      <h4 style={{ fontWeight: 700, marginBottom: 8 }}>
        {eventToEdit ? "Editar evento" : "Crear evento"}
      </h4>

      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        <div>
          <Label>Título</Label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={textareaStyle}
          />
        </div>

        <div>
          <Label>Tipo</Label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
          >
            <option value="taller">Taller</option>
            <option value="conferencia">Conferencia</option>
            <option value="concurso">Concurso</option>
            <option value="otra..">Otra..</option>
          </Select>
        </div>

        <div>
          <Label>Fecha y hora de inicio</Label>
          <Input
            type="datetime-local"
            value={starts_at}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <Label>Hora de fin</Label>
          <Input
            type="time"
            value={ends_at}
            onChange={(e) => setEndsAt(e.target.value)}
            style={inputStyle}
          />
          {errorMessage && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errorMessage}
            </p>
          )}
        </div>

        <div>
          <Label>Cupo máximo</Label>
          <Input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value || "0"))}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : eventToEdit ? "Actualizar" : "Crear"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={() => {
                resetForm();
                onCancel();
              }}
              style={{ backgroundColor: "#ccc", color: "#000" }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
