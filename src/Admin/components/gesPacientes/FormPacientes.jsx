import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import supabase from "../../../api/supabase";
import toast from "react-hot-toast";

const FormPacientes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [regimenes, setRegimenes] = useState([]);
  const [epsList, setEpsList] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuariosRes, regimenesRes, epsRes, municipiosRes] = await Promise.all([
          supabase.from("usuario").select("id, nombre, documento").eq("perfil_id", 3),
          supabase.from("regimen").select("id, tipo"),
          supabase.from("eps").select("id, nombre"),
          supabase.from("municipios").select("id, nombre"),
        ]);

        if (usuariosRes.data) setUsuarios(usuariosRes.data);
        if (regimenesRes.data) setRegimenes(regimenesRes.data);
        if (epsRes.data) setEpsList(epsRes.data);
        if (municipiosRes.data) setMunicipios(municipiosRes.data);
      } catch (error) {
        toast.error("Error cargando datos.");
        console.error("Error cargando datos:", error);
      }
    };

    fetchData();
  }, []);

  const usuarioOptions = usuarios.map((u) => ({
    value: u.id,
    label: `${u.nombre} (${u.documento})`,
  }));
  const regimenOptions = regimenes.map((r) => ({ value: r.id, label: r.tipo }));
  const epsOptions = epsList.map((e) => ({ value: e.id, label: e.nombre }));
  const municipioOptions = municipios.map((m) => ({ value: m.id, label: m.nombre }));
  const vulnerabilidadOptions = [
    { value: "BAJO", label: "Bajo" },
    { value: "MEDIO", label: "Medio" },
    { value: "ALTO", label: "Alto" },
  ];

  const onSubmit = async (formData) => {
    const paciente = {
      usuario_id: formData.paciente?.value,
      regimen_id: formData.regimen?.value || null,
      eps_id: formData.eps?.value || null,
      municipio_id: formData.municipio?.value || null,
      nivel_vulnerabilidad: formData.vulnerabilidad?.value || null,
    };

    const { error } = await supabase.from("pacientes").insert(paciente);
    if (error) {
      console.error(error);
      toast.error("Error al crear el paciente.");
    } else {
      toast.success("Paciente creado con éxito.");
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[
        { name: "paciente", label: "Paciente", options: usuarioOptions },
        { name: "regimen", label: "Régimen", options: regimenOptions },
        { name: "eps", label: "EPS", options: epsOptions },
        { name: "municipio", label: "Municipio", options: municipioOptions },
        { name: "vulnerabilidad", label: "Nivel de vulnerabilidad", options: vulnerabilidadOptions },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <Controller
            name={field.name}
            control={control}
            render={({ field: ctrl }) => (
              <Select {...ctrl} options={field.options} placeholder={`Selecciona ${field.label.toLowerCase()}...`} />
            )}
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
      >
        Crear Paciente
      </button>
    </form>
  );
};

export default FormPacientes;