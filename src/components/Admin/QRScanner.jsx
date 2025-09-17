import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "../../supabaseClient";

export default function QRScanner() {
  const [scanned, setScanned] = useState(null);
  const [message, setMessage] = useState("");

  // 👉 Detectar si es móvil o desktop
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const handleResult = async (qrData) => {
    if (!qrData) return;
    setScanned(qrData);

    try {
      // Actualizar check-in en Supabase
      const { data, error } = await supabase
        .from("registrations")
        .update({ checked_in: true, checked_at: new Date() })
        .eq("id", qrData)
        .select()
        .single();

      if (error) throw error;
      setMessage(`✅ Check-in exitoso para ${data?.nombre || "registro #" + data?.id}`);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Escanear QR</h2>
      <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
        <Scanner
          onDecode={handleResult}       // 📌 Antes era onResult
          onError={(err) => console.error(err)}
          constraints={{ facingMode: isMobile ? "environment" : "user" }}
          style={{ width: "100%" }}
        />
      </div>

      {scanned && <p>📷 Código detectado: {scanned}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}
