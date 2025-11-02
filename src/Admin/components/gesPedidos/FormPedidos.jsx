import { useEffect, useState } from "react";
import supabase from "../../../api/supabase";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const FormPedidos = () => {
  const { control, handleSubmit, register, reset, watch } = useForm();
  const [pacientes, setPacientes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [detalles, setDetalles] = useState([]);

  // IDs de toast para evitar duplicados
  const toastIds = {
    error: "pedido_error",
    success: "pedido_success",
    warning: "pedido_warning",
  };

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      const [{ data: pac }, { data: meds }] = await Promise.all([
        supabase.from("pacientes").select("id, usuario(nombre)").order("id"),
        supabase.from("medicamentos").select("id, nombre").order("id"),
      ]);
      setPacientes(pac || []);
      setMedicamentos(meds || []);
    };
    loadData();
  }, []);

  // 🔸 Opciones para selects
  const pacienteOptions = pacientes.map((p) => ({
    value: p.id,
    label: p.usuario?.nombre || `Paciente #${p.id}`,
  }));

  const medicamentoOptions = medicamentos.map((m) => ({
    value: m.id,
    label: m.nombre,
  }));

  const estadoOptions = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_ruta", label: "En ruta" },
    { value: "entregado", label: "Entregado" },
    { value: "fallido", label: "Fallido" },
  ];

  // ➕ Agregar medicamento
  const addDetalle = (medicamento, cantidad) => {
    if (!medicamento || !cantidad) {
      if (!toast.isActive(toastIds.warning)) {
        toast.error("Selecciona un medicamento y una cantidad válida.", {
          id: toastIds.warning,
        });
      }
      return;
    }
    setDetalles((prev) => [
      ...prev,
      { medicamento_id: medicamento.value, nombre: medicamento.label, cantidad },
    ]);
    toast.success("Medicamento agregado.", { id: toastIds.success });
  };

  // ❌ Eliminar medicamento
  const removeDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
    toast("Medicamento eliminado.", { icon: "🗑️", id: toastIds.warning });
  };

  // 💾 Guardar pedido
  const onSubmit = async (formData) => {
    const {
      paciente,
      direccion_entrega,
      prioridad,
      estado,
      fecha_pedido,
      fecha_entrega_estimada,
    } = formData;

    if (!paciente) {
      toast.error("Selecciona un paciente antes de guardar.", {
        id: toastIds.error,
      });
      return;
    }

    if (detalles.length === 0) {
      toast.error("Agrega al menos un medicamento al pedido.", {
        id: toastIds.error,
      });
      return;
    }

    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([
        {
          paciente_id: paciente.value,
          direccion_entrega,
          prioridad: parseInt(prioridad),
          estado: estado?.value,
          fecha_pedido: fecha_pedido || new Date().toISOString(),
          fecha_entrega_estimada: fecha_entrega_estimada || null,
        },
      ])
      .select("id")
      .single();

    if (pedidoError) {
      console.error(pedidoError);
      toast.error("Error al crear el pedido.", { id: toastIds.error });
      return;
    }

    const detallesInsert = detalles.map((d) => ({
      pedido_id: pedido.id,
      medicamento_id: d.medicamento_id,
      cantidad: d.cantidad,
    }));

    const { error: detalleError } = await supabase
      .from("pedido_detalle")
      .insert(detallesInsert);

    if (detalleError) {
      console.error(detalleError);
      toast.error("Error al agregar los medicamentos al pedido.", {
        id: toastIds.error,
      });
      return;
    }

    toast.success("Pedido creado con éxito ✅", { id: toastIds.success });
    reset();
    setDetalles([]);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 text-sm bg-white"
    >
      {/* 🧍 Paciente */}
      <div className="space-y-1">
        <label className="block font-medium text-gray-700">Paciente</label>
        <Controller
          name="paciente"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={pacienteOptions}
              placeholder="Seleccione paciente..."
            />
          )}
        />
      </div>

      {/* 📍 Dirección de entrega */}
      <div className="space-y-1">
        <label className="block font-medium text-gray-700">
          Dirección de entrega
        </label>
        <input
          {...register("direccion_entrega")}
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Ej. Calle 123 #45-67"
        />
      </div>

      {/* ⚙️ Prioridad y Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block font-medium text-gray-700">Prioridad</label>
          <input
            {...register("prioridad")}
            type="number"
            min="1"
            max="5"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="1 - 5"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-gray-700">Estado</label>
          <Controller
            name="estado"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={estadoOptions}
                placeholder="Seleccione estado..."
              />
            )}
          />
        </div>
      </div>

      {/* 📅 Rango de fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block font-medium text-gray-700">
            Fecha de pedido
          </label>
          <input
            {...register("fecha_pedido")}
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-medium text-gray-700">
            Fecha estimada de entrega
          </label>
          <input
            {...register("fecha_entrega_estimada")}
            type="date"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
      </div>

      {/* 💊 Medicamentos */}
      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">
          Medicamentos del pedido
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex-1 w-full">
            <Controller
              name="medicamento"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={medicamentoOptions}
                  placeholder="Seleccionar medicamento..."
                />
              )}
            />
          </div>

          <input
            {...register("cantidad")}
            type="number"
            min="1"
            className="w-24 border border-gray-300 rounded-md px-2 py-2 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            placeholder="Cant."
          />

          <button
            type="button"
            onClick={() => addDetalle(watch("medicamento"), watch("cantidad"))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm"
          >
            <FaPlus /> Agregar
          </button>
        </div>

        {/* Lista de medicamentos añadidos */}
        {detalles.length > 0 && (
          <ul className="border rounded-md divide-y max-h-36 overflow-y-auto bg-gray-50">
            {detalles.map((d, i) => (
              <li
                key={i}
                className="flex justify-between p-2 text-sm text-gray-700"
              >
                <span>
                  {d.nombre} — {d.cantidad} unid.
                </span>
                <button
                  type="button"
                  onClick={() => removeDetalle(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 💾 Botón guardar */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
      >
        Guardar Pedido
      </button>
    </form>
  );
};

export default FormPedidos;