import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";

export default function ProfileForm({ profile, onSaved }) {
  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [tipoPrograma, setTipoPrograma] = useState(""); // TSU o Licenciatura
  const [cuatrimestre, setCuatrimestre] = useState(""); // 1,4,7,10
  const [programa, setPrograma] = useState(""); // Administración o Contaduría

  // Inicializa los estados cuando profile llegue
 useEffect(() => {
  if (profile && !fullName) {  // solo inicializa si fullName aún está vacío
    setFullName(profile.full_name || "");
    setPhone(profile.phone || "");
    setTipoPrograma(profile.tipo_programa || "");
    setCuatrimestre(profile.cuatrimestre?.toString() || "");
    setPrograma(profile.programa_educativo || "");
  }
}, [profile]);

  // Validaciones simples antes de enviar
  const validateForm = () => {
    if (!fullName.trim()) return "El nombre completo es obligatorio.";
    if (!tipoPrograma) return "Selecciona el tipo de programa.";
    if (!cuatrimestre) return "Selecciona el cuatrimestre.";
    if (!programa) return "Selecciona el programa educativo.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!profile) return; // Evita errores si profile es null

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        tipo_programa: tipoPrograma,
        cuatrimestre: Number(cuatrimestre), // convertir a número
        programa_educativo: programa,
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error.message);
      setErrorMessage("Error al guardar el perfil. Revisa los datos.");
      return;
    }

    onSaved(data);
    setShowMessage(true);
    setErrorMessage("");
    setTimeout(() => setShowMessage(false), 2000);
  };

  if (!profile) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h3 className="profile-title">Mi Perfil</h3>
      <form onSubmit={onSubmit} className="profile-form">
        <div>
          <Label>Nombre completo</Label>
          <Input
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <Label>Teléfono</Label>
          <Input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <Label>Nivel Educativo</Label>
          <Select
            name="tipo_programa"
            value={tipoPrograma}
            onChange={(e) => setTipoPrograma(e.target.value)}
          >
            <option value="">Selecciona tipo…</option>
            <option value="TSU">TSU</option>
            <option value="Licenciatura">Licenciatura</option>
          </Select>
        </div>

        <div>
          <Label>Cuatrimestre</Label>
          <Select
            name="cuatrimestre"
            value={cuatrimestre}
            onChange={(e) => setCuatrimestre(e.target.value)}
          >
            <option value="">Selecciona cuatrimestre…</option>
            <option value="1">1°</option>
            <option value="4">4°</option>
            <option value="7">7°</option>
            <option value="10">10°</option>
          </Select>
        </div>

        <div>
          <Label>Programa educativo</Label>
          <Select
            name="programa"
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          >
            <option value="">Selecciona programa…</option>
            <option value="Administracion">Administración</option>
            <option value="Contaduria">Contaduría</option>
          </Select>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <Button>Guardar</Button>
      </form>

      {showMessage && (
        <div className="modal-overlay">
          <div className="modal-content">Guardado con éxito</div>
        </div>
      )}
    </div>
  );
}
