// Cliente "Supabase" simulado para el modo demo.
// Implementa solo el subconjunto de la API que usa FarmaIA y guarda todo en localStorage,
// así la demo funciona sin backend (por ejemplo en GitHub Pages).

import { buildSeed } from "./seed";

const DB_KEY = "farmaia-demo-db-v1";
const SESSION_KEY = "farmaia-demo-session-v1";
const LATENCY_MS = 120;

// Relaciones usadas en los select embebidos: tabla -> nombre embebido -> definición
// one: la FK vive en la tabla actual; many: la FK vive en la tabla destino.
const RELATIONS = {
  pedidos: {
    pacientes: { table: "pacientes", kind: "one", fk: "paciente_id" },
    pedido_detalle: { table: "pedido_detalle", kind: "many", fk: "pedido_id" },
  },
  pacientes: {
    usuario: { table: "usuario", kind: "one", fk: "usuario_id" },
    usuario_id: { table: "usuario", kind: "one", fk: "usuario_id" },
    regimen_id: { table: "regimen", kind: "one", fk: "regimen_id" },
    eps_id: { table: "eps", kind: "one", fk: "eps_id" },
    municipio_id: { table: "municipios", kind: "one", fk: "municipio_id" },
    paciente_enfermedad: { table: "paciente_enfermedad", kind: "many", fk: "paciente_id" },
  },
  paciente_enfermedad: {
    enfermedades_cronicas: { table: "enfermedades_cronicas", kind: "one", fk: "enfermedad_id" },
  },
  pedido_detalle: {
    medicamentos: { table: "medicamentos", kind: "one", fk: "medicamento_id" },
  },
};

const clone = (v) => JSON.parse(JSON.stringify(v));
const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));

// ---------- Persistencia ----------

let db = null;

function loadDb() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      db = JSON.parse(raw);
      return db;
    }
  } catch {
    /* localStorage no disponible o corrupto: se vuelve a sembrar */
  }
  db = buildSeed();
  saveDb();
  return db;
}

function saveDb() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* modo privado / cuota llena: la demo sigue funcionando en memoria */
  }
}

export function resetDemoData() {
  db = null;
  try {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

// ---------- Parser de select ----------

function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(str = "*") {
  return splitTopLevel(str).map((item) => {
    const open = item.indexOf("(");
    if (open === -1) return { type: "col", name: item };
    const head = item.slice(0, open).trim();
    const inner = item.slice(open + 1, item.lastIndexOf(")"));
    const [alias, name] = head.includes(":") ? head.split(":").map((s) => s.trim()) : [head, head];
    return { type: "embed", alias, name, children: parseSelect(inner) };
  });
}

function project(row, table, nodes) {
  const data = loadDb();
  const out = {};
  for (const node of nodes) {
    if (node.type === "col") {
      if (node.name === "*") Object.assign(out, row);
      else out[node.name] = row[node.name];
      continue;
    }
    const rel = RELATIONS[table]?.[node.name];
    if (!rel) throw new Error(`Relación desconocida: ${table} -> ${node.name}`);
    if (rel.kind === "one") {
      const target = data[rel.table].find((r) => r.id === row[rel.fk]);
      out[node.alias] = target ? project(target, rel.table, node.children) : null;
    } else {
      out[node.alias] = data[rel.table]
        .filter((r) => r[rel.fk] === row.id)
        .map((r) => project(r, rel.table, node.children));
    }
  }
  return out;
}

// ---------- Reglas de integridad (lo que haría la BD real) ----------

function validateInsert(table, row, data) {
  if (table === "pacientes") {
    if (!row.usuario_id) return "usuario_id es obligatorio";
    if (data.pacientes.some((p) => p.usuario_id === row.usuario_id)) {
      return "duplicate key value violates unique constraint (usuario_id)";
    }
  }
  if (table === "usuario" && row.documento && data.usuario.some((u) => u.documento === String(row.documento))) {
    return "duplicate key value violates unique constraint (documento)";
  }
  if (table === "pedidos" && !data.pacientes.some((p) => p.id === row.paciente_id)) {
    return "paciente_id no existe";
  }
  if (table === "pedido_detalle" && !data.pedidos.some((p) => p.id === row.pedido_id)) {
    return "pedido_id no existe";
  }
  return null;
}

function applyInsertDefaults(table, row, data) {
  const next = { ...row };
  if (table === "pedidos") {
    next.fecha_pedido = new Date(next.fecha_pedido ?? Date.now()).toISOString();
    next.estado ??= "pendiente";
    next.prioridad ??= 2;
    next.latitud ??= null;
    next.longitud ??= null;
    next.fecha_entrega_estimada ??= null;
    next.fecha_entrega_real ??= null;
  }
  if (table === "usuario") next.documento = next.documento != null ? String(next.documento) : null;
  if (table === "paciente_enfermedad") {
    next.id ??= (data[table].reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
  }
  return next;
}

// ---------- Query builder ----------

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.op = "select";
    this.selectStr = "*";
    this.countMode = null;
    this.head = false;
    this.filters = [];
    this.orders = [];
    this.limitN = null;
    this.expectOne = false;
    this.payload = null;
    this.returning = false;
  }

  select(str = "*", opts = {}) {
    this.selectStr = str;
    if (this.op === "select") {
      this.countMode = opts.count || null;
      this.head = !!opts.head;
    } else {
      this.returning = true; // insert(...).select()
    }
    return this;
  }
  insert(rows) {
    this.op = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(values) {
    this.op = "update";
    this.payload = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(col, val) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  neq(col, val) {
    this.filters.push((r) => r[col] !== val);
    return this;
  }
  in(col, vals) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  not(col, operator, val) {
    if (operator === "is") this.filters.push((r) => (r[col] ?? null) !== val);
    else if (operator === "eq") this.filters.push((r) => r[col] !== val);
    return this;
  }
  order(col, { ascending = true } = {}) {
    this.orders.push({ col, ascending });
    return this;
  }
  limit(n) {
    this.limitN = n;
    return this;
  }
  single() {
    this.expectOne = true;
    return this;
  }

  matches(row) {
    return this.filters.every((f) => f(row));
  }

  run() {
    const data = loadDb();
    const table = data[this.table];
    if (!table) return { data: null, error: { message: `Tabla desconocida: ${this.table}` } };

    if (this.op === "insert") return this.runInsert(data);
    if (this.op === "update") return this.runUpdate(data);
    if (this.op === "delete") return this.runDelete(data);

    let rows = table.filter((r) => this.matches(r));
    const count = rows.length;
    for (const { col, ascending } of [...this.orders].reverse()) {
      rows = [...rows].sort((a, b) => {
        const av = a[col] ?? "";
        const bv = b[col] ?? "";
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    if (this.head) return { data: null, count, error: null };

    const nodes = parseSelect(this.selectStr);
    const projected = rows.map((r) => project(r, this.table, nodes));
    return this.finish(projected, this.countMode ? count : undefined);
  }

  runInsert(data) {
    const inserted = [];
    for (const raw of this.payload) {
      const err = validateInsert(this.table, raw, data);
      if (err) return { data: null, error: { message: err, code: "23505" } };
      const row = applyInsertDefaults(this.table, raw, data);
      row.id ??= (data[this.table].reduce((m, r) => Math.max(m, r.id || 0), 0) || 0) + 1;
      data[this.table].push(row);
      inserted.push(row);

      // En la demo, quien se registra queda con perfil clínico para poder usar la app de inmediato.
      if (this.table === "usuario" && row.perfil_id === 3) {
        data.pacientes.push({
          id: data.pacientes.reduce((m, r) => Math.max(m, r.id), 0) + 1,
          usuario_id: row.id,
          regimen_id: 1,
          eps_id: 1,
          municipio_id: 1,
          nivel_vulnerabilidad: "BAJO",
        });
      }
    }
    saveDb();
    if (!this.returning) return { data: null, error: null };
    const nodes = parseSelect(this.selectStr);
    return this.finish(inserted.map((r) => project(r, this.table, nodes)));
  }

  runUpdate(data) {
    const targets = data[this.table].filter((r) => this.matches(r));
    targets.forEach((r) => Object.assign(r, this.payload));
    saveDb();
    if (!this.returning) return { data: null, error: null };
    const nodes = parseSelect(this.selectStr);
    return this.finish(targets.map((r) => project(r, this.table, nodes)));
  }

  runDelete(data) {
    data[this.table] = data[this.table].filter((r) => !this.matches(r));
    saveDb();
    return { data: null, error: null };
  }

  finish(rows, count) {
    if (this.expectOne) {
      if (rows.length !== 1) {
        return {
          data: null,
          error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" },
        };
      }
      return { data: clone(rows[0]), error: null };
    }
    return { data: clone(rows), error: null, ...(count !== undefined ? { count } : {}) };
  }

  then(resolve, reject) {
    return wait().then(() => this.run()).then(resolve, reject);
  }
}

// ---------- Auth ----------

const listeners = new Set();

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function emit(event, session) {
  listeners.forEach((cb) => cb(event, session));
}

const toSession = (u) => ({ user: { id: u.id, email: u.email, user_metadata: {} } });

const auth = {
  async getSession() {
    await wait();
    const session = readSession();
    return { data: { session }, error: null };
  },
  async signInWithPassword({ email, password }) {
    await wait();
    const u = loadDb().auth_users.find(
      (x) => x.email.toLowerCase() === String(email).trim().toLowerCase() && x.password === password
    );
    if (!u) return { data: { user: null, session: null }, error: { message: "Credenciales inválidas" } };
    const session = toSession(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Igual que Supabase: el evento se emite de forma asíncrona tras resolver el login.
    setTimeout(() => emit("SIGNED_IN", session), 0);
    return { data: { user: session.user, session }, error: null };
  },
  async signUp({ email, password }) {
    await wait();
    const data = loadDb();
    if (!email || !password || password.length < 6) {
      return { data: { user: null }, error: { message: "La contraseña debe tener al menos 6 caracteres" } };
    }
    if (data.auth_users.some((x) => x.email.toLowerCase() === String(email).trim().toLowerCase())) {
      return { data: { user: null }, error: { message: "Este correo ya está registrado" } };
    }
    const u = { id: `demo-${Date.now()}`, email: String(email).trim(), password };
    data.auth_users.push(u);
    saveDb();
    return { data: { user: { id: u.id, email: u.email }, session: null }, error: null };
  },
  async signOut() {
    await wait();
    localStorage.removeItem(SESSION_KEY);
    emit("SIGNED_OUT", null);
    return { error: null };
  },
  onAuthStateChange(cb) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
};

const mockSupabase = {
  from: (table) => new QueryBuilder(table),
  auth,
};

export default mockSupabase;
