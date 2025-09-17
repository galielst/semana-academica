import { supabase } from "../../supabaseClient";
import Button from "../ui/Button";

export default function EventActions({ eventId, onChanged, onEdit }) {
  // Eliminar evento
  async function remove() {
    if (!window.confirm("¿Eliminar evento y registros asociados?")) return;
    await supabase.from("events").delete().eq("id", eventId);
    onChanged?.();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Botón Editar */}
      {onEdit && (
        <Button
          onClick={onEdit}
          style={{ backgroundColor: "#facc15", color: "#000" }}
        >
          Editar
        </Button>
      )}

      {/* Botón Eliminar */}
      <Button
        onClick={remove}
        style={{ backgroundColor: "#ef4444", color: "#fff" }}
      >
        Eliminar
      </Button>
    </div>
  );
}
