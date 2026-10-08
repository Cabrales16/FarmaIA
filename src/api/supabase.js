import { createClient } from "@supabase/supabase-js";
import mockSupabase from "../mock/mockSupabase";

// Con VITE_DEMO_MODE=true la app usa un backend simulado en el navegador
// (ver src/mock) y no necesita Supabase. Es lo que se publica en GitHub Pages.
export const isDemo = import.meta.env.VITE_DEMO_MODE === "true";

const supabase = isDemo
  ? mockSupabase
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

export default supabase;
