import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Label from "../ui/Label";
import Select from "../ui/Select";
import dayjs from "dayjs";

export default function EventRegistrantsPanel(){
  const [eventId, setEventId] = useState("");
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from("events").select("id,title").order("starts_at");
    setEvents(data||[]);
  })(); },[]);

  useEffect(()=>{ if(eventId) fetchRegs(eventId); },[eventId]);

  async function fetchRegs(id){
    const { data } = await supabase
      .from("registrations_admin_view")
      .select("id, event_id, user_email, full_name, phone, checked_in_at, title")
      .eq("event_id", id)
      .order("checked_in_at", { ascending: false });
    setItems(data||[]);
  }

  return (
    <div style={{marginTop:12}}>
      <Label>Ver inscritos por evento</Label>
      <Select value={eventId} onChange={(e)=>setEventId(e.target.value)}>
        <option value="">Selecciona evento…</option>
        {events.map(e=> <option key={e.id} value={e.id}>{e.title}</option>)}
      </Select>
      <div style={{marginTop:8, maxHeight:300, overflow:"auto", border:"1px solid #e5e7eb", borderRadius:12}}>
        <table style={{width:"100%", fontSize:13}}>
          <thead style={{position:"sticky", top:0, background:"#f9fafb"}}>
            <tr>
              <th style={{textAlign:"left", padding:8}}>Nombre</th>
              <th style={{textAlign:"left", padding:8}}>Correo</th>
              <th style={{textAlign:"left", padding:8}}>Teléfono</th>
              <th style={{textAlign:"left", padding:8}}>Check-in</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r=> (
              <tr key={r.id} style={{borderTop:"1px solid #e5e7eb"}}>
                <td style={{padding:8}}>{r.full_name||"—"}</td>
                <td style={{padding:8}}>{r.user_email}</td>
                <td style={{padding:8}}>{r.phone||"—"}</td>
                <td style={{padding:8}}>{r.checked_in_at? dayjs(r.checked_in_at).format("DD/MM HH:mm"): "Pendiente"}</td>
              </tr>
            ))}
            {items.length===0 && (
              <tr><td colSpan={4} style={{padding:12, textAlign:"center", color:"#6b7280"}}>Sin inscritos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
