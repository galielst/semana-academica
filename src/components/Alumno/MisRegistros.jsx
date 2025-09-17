import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import dayjs from "dayjs";
import QRItem from "./QRItem";

export default function MisRegistros({ refreshFlag }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRegistros() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("registrations_view")
      .select("id,event_id,title,type,starts_at")
      .eq("user_id", user.id)
      .order("starts_at", { ascending: true });
    setLoading(false);
    if (!error) setItems(data || []);
  }

  useEffect(() => { fetchRegistros(); }, [refreshFlag]); // 👈 se recarga cuando cambia refreshFlag

  return (
    <div>
      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Mis registros / QR</h3>
      {loading? <p>Cargando...</p> : (
        <div style={{display:"grid", gap:12}}>
          {items.map(it => (<QRItem key={it.id} reg={it} />))}
          {items.length===0 && <p style={{color:"#6b7280"}}>Aún no te has inscrito.</p>}
        </div>
      )}
    </div>
  );
}
