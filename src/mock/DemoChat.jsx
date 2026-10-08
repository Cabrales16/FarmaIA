import { useEffect, useRef, useState } from "react";
import { FaCommentMedical, FaPaperPlane, FaTimes } from "react-icons/fa";
import supabase from "../api/supabase";
import UseAuth from "../context/UseAuth";
import { notifyDataChange } from "../common/dataEvents";

// Asistente simulado para la demo: reemplaza el agente real (n8n + MCP + IA),
// que necesita servicios externos. Responde con reglas sobre los datos de la demo.

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const INICIO = [
  "👋 ¡Hola! Soy el asistente virtual de FarmaIA (versión demo).",
  "💊 Prueba: «medicamentos», «mis pedidos» o «pedir losartán».",
];

export default function DemoChat() {
  const { userId } = UseAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState(INICIO.map((t) => ({ from: "bot", text: t })));
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, open]);

  const getPaciente = async () => {
    const { data: u } = await supabase.from("usuario").select("id, nombre").eq("auth_id", userId).single();
    if (!u) return null;
    const { data: p } = await supabase.from("pacientes").select("id").eq("usuario_id", u.id).single();
    return p ? { id: p.id, nombre: u.nombre } : null;
  };

  const responder = async (texto) => {
    const t = norm(texto);
    const { data: meds } = await supabase.from("medicamentos").select("id, nombre").order("id");

    if (/^(hola|buenas|hey|buenos)/.test(t)) {
      return "¡Hola! ¿En qué puedo ayudarte? Puedo mostrar medicamentos, tus pedidos o crear un pedido.";
    }

    if (/(pedir|solicitar|quiero|necesito)/.test(t)) {
      const med = meds.find((m) => t.includes(norm(m.nombre).split(" ")[0]));
      if (!med) return "¿Qué medicamento necesitas? Escribe por ejemplo «pedir metformina».";
      const pac = await getPaciente();
      if (!pac) return "No encontré tu perfil de paciente.";
      const { data: ultimo } = await supabase
        .from("pedidos")
        .select("direccion_entrega, latitud, longitud")
        .eq("paciente_id", pac.id)
        .order("fecha_pedido", { ascending: false })
        .limit(1);
      const base = ultimo?.[0];
      const { data: pedido, error } = await supabase
        .from("pedidos")
        .insert([
          {
            paciente_id: pac.id,
            estado: "pendiente",
            prioridad: 2,
            direccion_entrega: base?.direccion_entrega || "Dirección registrada del paciente",
            latitud: base?.latitud ?? null,
            longitud: base?.longitud ?? null,
            fecha_pedido: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();
      if (error) return "No pude crear el pedido, inténtalo de nuevo.";
      await supabase.from("pedido_detalle").insert([{ pedido_id: pedido.id, medicamento_id: med.id, cantidad: 1 }]);
      notifyDataChange("pedidos");
      return `✅ Listo, ${pac.nombre.split(" ")[0]}: creé el pedido #${pedido.id} con ${med.nombre}. Ya aparece en «Mis pedidos».`;
    }

    if (/(medicamento|inventario|disponible|catalogo)/.test(t)) {
      return `Medicamentos disponibles:\n${meds.map((m) => `• ${m.nombre}`).join("\n")}`;
    }

    if (/(pedido|estado|entrega|historial)/.test(t)) {
      const pac = await getPaciente();
      if (!pac) return "Este asistente de demo muestra pedidos solo para pacientes.";
      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, estado, fecha_pedido")
        .eq("paciente_id", pac.id)
        .order("fecha_pedido", { ascending: false })
        .limit(5);
      if (!pedidos.length) return "Aún no tienes pedidos.";
      return `Tus últimos pedidos:\n${pedidos
        .map((p) => `• #${p.id} — ${p.estado.replace("_", " ")} (${new Date(p.fecha_pedido).toLocaleDateString("es-CO")})`)
        .join("\n")}`;
    }

    return "No estoy seguro de haberte entendido 🤔. Prueba con «medicamentos», «mis pedidos» o «pedir losartán».";
  };

  const enviar = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto) return;
    setInput("");
    setMensajes((m) => [...m, { from: "user", text: texto }]);
    try {
      const r = await responder(texto);
      setMensajes((m) => [...m, { from: "bot", text: r }]);
    } catch (err) {
      console.error(err);
      setMensajes((m) => [...m, { from: "bot", text: "Ocurrió un error inesperado." }]);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Asistente FarmaIA 💊</p>
              <p className="text-xs text-blue-100">Respuestas simuladas (demo)</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <FaTimes />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 text-sm">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 ${
                    m.from === "user" ? "bg-green-100 text-slate-900" : "bg-sky-100 text-slate-800"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={enviar} className="flex gap-2 border-t border-gray-200 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700" aria-label="Enviar">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir chat"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-800"
      >
        <FaCommentMedical />
      </button>
    </>
  );
}
