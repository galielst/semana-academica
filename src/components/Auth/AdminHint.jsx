import TsuImage from "../../assets/tsu_admin_proyectos.jpeg";  // ajusta la ruta según la ubicación

export default function AdminHint() {
  return (
    <div style={{ fontSize: 14, color: "#374151", display: "grid", gap: 8 }}>
      
      <img
        src={TsuImage}
        alt="Validación de correo"
        style={{ width: "100%", height: "auto", borderRadius: 12, objectFit: "cover" }}
      />
    </div>
  );
}
