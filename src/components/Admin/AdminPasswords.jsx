import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "../../supabaseClient";
import EventForm from "./EventForm";
import EventActions from "./EventActions";


function AdminPasswords(){
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load(){ 
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .order("email");
    if (!error) setUsers(data || []);
  }

  async function sendRecovery(email){
    setMsg("");
    try{
      const redirectTo = window.location.origin + "/recuperar"; 
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setMsg(`📧 Correo de restablecimiento enviado a ${email}`);
    }catch(err){
      setMsg("❌ " + err.message);
    }
  }

  const filtered = users.filter(u =>
    (u.email||"").toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name||"").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h4 style={{fontWeight:700, marginBottom:8}}>Restablecer contraseñas</h4>

      <div style={{display:"flex", gap:8, marginBottom:8}}>
        <Input placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)} />
        <Button onClick={load}>Recargar</Button>
      </div>

      {msg && <p style={{fontSize:13, marginBottom:8}}>{msg}</p>}

      <div style={{maxHeight:360, overflow:"auto", border:"1px solid #e5e7eb", borderRadius:12}}>
        <table style={{width:"100%", fontSize:13}}>
          <thead style={{position:"sticky", top:0, background:"#f9fafb"}}>
            <tr>
              <th style={{textAlign:"left", padding:8}}>Nombre</th>
              <th style={{textAlign:"left", padding:8}}>Correo</th>
              <th style={{textAlign:"left", padding:8}}>Rol</th>
              <th style={{textAlign:"left", padding:8}}></th>
            </tr>
          </thead>
          <tbody>
          {filtered.map(u => (
            <tr key={u.id} style={{borderTop:"1px solid #e5e7eb"}}>
              <td style={{padding:8}}>{u.full_name || "—"}</td>
              <td style={{padding:8}}>{u.email}</td>
              <td style={{padding:8}}>{u.role}</td>
              <td style={{padding:8}}>
                <Button onClick={() => sendRecovery(u.email)}>
                  Enviar correo
                </Button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={4} style={{padding:12, textAlign:"center", color:"#6b7280"}}>Sin resultados</td></tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
