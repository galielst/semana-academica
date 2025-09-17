import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // 🔹 Importamos el plugin UTC
import Badge from "../ui/Badge";

dayjs.extend(utc); // 🔹 Extendemos dayjs con UTC

export default function QRItem({ reg }) {
  const canvasRef = useRef(null);

  // Generar QR
  useEffect(() => {
    const payload = JSON.stringify({
      reg_id: reg.id,
      event_id: reg.event_id,
    });
    QRCode.toCanvas(canvasRef.current, payload, { width: 220 });
  }, [reg.id, reg.event_id]);

  // 🔹 Formateo de hora de inicio y fin usando UTC para evitar cambios de zona horaria
  const start = dayjs.utc(reg.starts_at).format("DD/MM/YYYY HH:mm");
  const end = reg.ends_at ? dayjs.utc(reg.ends_at).format("HH:mm") : null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 12,
        background: "#fff",
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div>
          <p style={{ fontWeight: 700, fontSize: 14 }}>
            {reg.title}{" "}
            <span style={{ fontSize: 12, color: "#6b7280" }}>({reg.type})</span>
          </p>
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            {end ? `${start} - ${end}` : start}
          </p>
        </div>
        <Badge>QR</Badge>
      </div>

      {/* QR */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
