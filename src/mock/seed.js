// Datos de ejemplo para el modo demo. Todo es ficticio.
// Las fechas se calculan respecto al día actual para que la demo siempre se vea "viva".

export const DEMO_ACCOUNTS = {
  admin: { email: "admin@farmaia.demo", password: "demo1234" },
  paciente: { email: "paciente@farmaia.demo", password: "demo1234" },
};

const daysAgo = (d, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const daysAhead = (d) => daysAgo(-d, 16);

export function buildSeed() {
  const auth_users = [
    { id: "demo-admin", email: DEMO_ACCOUNTS.admin.email, password: DEMO_ACCOUNTS.admin.password },
    { id: "demo-pac-1", email: DEMO_ACCOUNTS.paciente.email, password: DEMO_ACCOUNTS.paciente.password },
  ];

  const nombres = [
    ["Administrador FarmaIA", "1000000001"],
    ["María Fernanda Rojas", "52345678"],
    ["Carlos Andrés Gómez", "80123456"],
    ["Luz Marina Pérez", "41234567"],
    ["Jorge Iván Castro", "79876543"],
    ["Ana Lucía Torres", "1020304050"],
    ["Pedro Pablo Ramírez", "19283746"],
    ["Rosa Elena Díaz", "35123987"],
    ["Camilo Herrera", "1098765432"],
    ["Sofía Valentina Mora", "1011223344"],
  ];

  // usuario 1 = admin (perfil 1); 2..10 = pacientes (perfil 3)
  const usuario = nombres.map(([nombre, documento], i) => ({
    id: i + 1,
    nombre,
    documento,
    auth_id: i === 0 ? "demo-admin" : i === 1 ? "demo-pac-1" : null,
    perfil_id: i === 0 ? 1 : 3,
  }));

  const regimen = [
    { id: 1, tipo: "Contributivo" },
    { id: 2, tipo: "Subsidiado" },
    { id: 3, tipo: "Especial" },
  ];

  const eps = [
    { id: 1, nombre: "Sanitas" },
    { id: 2, nombre: "Nueva EPS" },
    { id: 3, nombre: "Sura" },
    { id: 4, nombre: "Compensar" },
    { id: 5, nombre: "Salud Total" },
  ];

  const municipios = [
    { id: 1, nombre: "Bogotá" },
    { id: 2, nombre: "Soacha" },
    { id: 3, nombre: "Chía" },
    { id: 4, nombre: "Zipaquirá" },
    { id: 5, nombre: "Cajicá" },
  ];

  const enfermedades_cronicas = [
    { id: 1, nombre: "Hipertensión arterial", clasificacion: "Cardiovascular" },
    { id: 2, nombre: "Diabetes mellitus tipo 2", clasificacion: "Metabólica" },
    { id: 3, nombre: "EPOC", clasificacion: "Respiratoria" },
    { id: 4, nombre: "Asma", clasificacion: "Respiratoria" },
    { id: 5, nombre: "Hipotiroidismo", clasificacion: "Endocrina" },
    { id: 6, nombre: "Artritis reumatoide", clasificacion: "Autoinmune" },
    { id: 7, nombre: "Insuficiencia renal crónica", clasificacion: "Renal" },
  ];

  const medicamentos = [
    { id: 1, nombre: "Losartán 50 mg" },
    { id: 2, nombre: "Metformina 850 mg" },
    { id: 3, nombre: "Atorvastatina 20 mg" },
    { id: 4, nombre: "Salbutamol inhalador 100 mcg" },
    { id: 5, nombre: "Levotiroxina 100 mcg" },
    { id: 6, nombre: "Enalapril 10 mg" },
    { id: 7, nombre: "Insulina glargina 100 UI/ml" },
    { id: 8, nombre: "Amlodipino 5 mg" },
    { id: 9, nombre: "Omeprazol 20 mg" },
    { id: 10, nombre: "Budesonida inhalador 200 mcg" },
  ];

  // Pacientes: usuarios 2..8 tienen perfil clínico; 9 y 10 quedan "sin perfil"
  // para que el administrador pueda crearlo desde el panel.
  const pacientes = [
    { id: 1, usuario_id: 2, regimen_id: 1, eps_id: 1, municipio_id: 1, nivel_vulnerabilidad: "MEDIO" },
    { id: 2, usuario_id: 3, regimen_id: 2, eps_id: 2, municipio_id: 2, nivel_vulnerabilidad: "ALTO" },
    { id: 3, usuario_id: 4, regimen_id: 2, eps_id: 2, municipio_id: 2, nivel_vulnerabilidad: "ALTO" },
    { id: 4, usuario_id: 5, regimen_id: 1, eps_id: 3, municipio_id: 3, nivel_vulnerabilidad: "BAJO" },
    { id: 5, usuario_id: 6, regimen_id: 1, eps_id: 4, municipio_id: 1, nivel_vulnerabilidad: "BAJO" },
    { id: 6, usuario_id: 7, regimen_id: 2, eps_id: 5, municipio_id: 4, nivel_vulnerabilidad: "ALTO" },
    { id: 7, usuario_id: 8, regimen_id: 3, eps_id: 1, municipio_id: 5, nivel_vulnerabilidad: "MEDIO" },
  ];

  const paciente_enfermedad = [
    [1, 1], [1, 2], [2, 2], [2, 7], [3, 3], [3, 1], [4, 1], [5, 5], [5, 4], [6, 2], [6, 1], [7, 6],
  ].map(([paciente_id, enfermedad_id], i) => ({ id: i + 1, paciente_id, enfermedad_id }));

  // Direcciones aproximadas en Bogotá y municipios cercanos (lat, lng)
  const lugares = [
    ["Calle 45 #23-10, Teusaquillo, Bogotá", 4.6393, -74.0823],
    ["Carrera 7 #72-41, Chapinero, Bogotá", 4.6567, -74.0561],
    ["Av. Boyacá #80-94, Engativá, Bogotá", 4.6989, -74.1086],
    ["Calle 13 #68-98, Fontibón, Bogotá", 4.6486, -74.1147],
    ["Carrera 30 #45-03, Ciudad Universitaria, Bogotá", 4.6353, -74.0833],
    ["Calle 127 #15-30, Usaquén, Bogotá", 4.7109, -74.0414],
    ["Autopista Sur #38-20, Soacha", 4.5793, -74.2169],
    ["Carrera 9 #12-45, Chía", 4.8587, -74.0586],
    ["Calle 4 #6-21, Zipaquirá", 5.0225, -74.0047],
    ["Carrera 5 #3-50, Cajicá", 4.9186, -74.0276],
  ];

  // [paciente_id, estado, prioridad, diasAtras, lugar, [[med, cant], ...]]
  const plan = [
    [1, "pendiente", 2, 1, 0, [[1, 1], [2, 2]]],
    [1, "en_ruta", 1, 3, 0, [[3, 1]]],
    [1, "entregado", 2, 20, 0, [[1, 1], [2, 1], [3, 1]]],
    [1, "entregado", 2, 55, 0, [[2, 2]]],
    [1, "fallido", 3, 80, 0, [[1, 1]]],
    [1, "entregado", 2, 110, 0, [[3, 1], [1, 1]]],
    [2, "pendiente", 1, 0, 6, [[7, 1], [2, 1]]],
    [2, "en_ruta", 1, 2, 2, [[8, 2]]],
    [2, "entregado", 2, 30, 6, [[7, 1]]],
    [3, "pendiente", 1, 1, 6, [[4, 1], [10, 1]]],
    [3, "entregado", 2, 40, 6, [[6, 1]]],
    [4, "pendiente", 3, 2, 7, [[1, 1]]],
    [4, "entregado", 3, 35, 7, [[8, 1], [1, 1]]],
    [5, "en_ruta", 2, 1, 5, [[5, 1]]],
    [5, "entregado", 2, 62, 5, [[5, 1], [4, 1]]],
    [6, "pendiente", 1, 0, 8, [[2, 2], [6, 1]]],
    [6, "entregado", 1, 45, 8, [[7, 1]]],
    [6, "fallido", 2, 70, 8, [[2, 1]]],
    [7, "pendiente", 2, 3, 9, [[9, 1]]],
    [7, "entregado", 2, 90, 9, [[9, 1], [3, 1]]],
    [3, "entregado", 3, 130, 6, [[4, 1]]],
    [5, "entregado", 2, 140, 3, [[5, 1]]],
  ];

  const pedidos = [];
  const pedido_detalle = [];
  plan.forEach(([paciente_id, estado, prioridad, dias, lugar, meds], i) => {
    const id = i + 1;
    const [direccion_entrega, latitud, longitud] = lugares[lugar];
    const fecha_pedido = daysAgo(dias, 8 + (i % 8));
    pedidos.push({
      id,
      paciente_id,
      estado,
      prioridad,
      direccion_entrega,
      // Pequeña dispersión para que los puntos no se superpongan en el mapa
      latitud: latitud + ((i % 5) - 2) * 0.0035,
      longitud: longitud + ((i % 3) - 1) * 0.004,
      fecha_pedido,
      fecha_entrega_estimada: estado === "entregado" || estado === "fallido"
        ? daysAgo(Math.max(dias - 2, 0), 15)
        : daysAhead(1 + (i % 3)),
      fecha_entrega_real: estado === "entregado" ? daysAgo(Math.max(dias - 2, 0), 14) : null,
    });
    meds.forEach(([medicamento_id, cantidad]) => {
      pedido_detalle.push({ id: pedido_detalle.length + 1, pedido_id: id, medicamento_id, cantidad });
    });
  });

  return {
    auth_users,
    usuario,
    regimen,
    eps,
    municipios,
    enfermedades_cronicas,
    medicamentos,
    pacientes,
    paciente_enfermedad,
    pedidos,
    pedido_detalle,
  };
}
