import { useEffect, useState } from "react";

// Mini bus de eventos para que las tablas se refresquen cuando un formulario
// hermano crea o modifica datos (antes había que recargar la página).
const listeners = new Set();

export const notifyDataChange = (topic) => listeners.forEach((cb) => cb(topic));

export function useDataRefresh(topic) {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const cb = (t) => t === topic && setVersion((v) => v + 1);
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, [topic]);
  return version;
}
