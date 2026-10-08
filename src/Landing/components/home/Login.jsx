import { useForm } from "react-hook-form";
import supabase, { isDemo } from "../../../api/supabase";
import { DEMO_ACCOUNTS } from "../../../mock/seed";
import toast from "react-hot-toast";
import useAuth from "../../../context/UseAuth";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const Login = ({ login, setLogin }) => {
  const { register, handleSubmit, setValue } = useForm();
  const { setIsAuth, isAuth, setUserId, setRol } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (datas) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(datas);

    if (error) {
      setLoading(false);
      return toast.error(error.message || "Credenciales inválidas");
    }

    if (data && data.user) {
      setIsAuth(true);
      setUserId(data.user.id);

      let rol = data.user.user_metadata?.rol;

      if (!rol) {
        const { data: profile, error: profileError } = await supabase
          .from("usuario")
          .select("perfil_id")
          .eq("auth_id", data.user.id)
          .single();

        if (!profileError && profile?.perfil_id) {
          rol = profile.perfil_id;
        }
      }

      setRol(rol || "user");
    }

    setLoading(false);
    toast.success("Bienvenido");
  };

  if (isAuth) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col justify-center">
      <div className="text-2xl font-bold text-center mb-1">Iniciar Sesión</div>
      <div className="text-base text-gray-500 text-center mb-4">
        Acceda al sistema según su perfil
      </div>

      <div className="flex gap-2 justify-center items-center bg-gray-200 p-1 rounded-4xl mb-6">
        <div
          className={`w-1/2 text-center px-4 py-2 rounded-4xl font-semibold text-sm transition-all ${
            login
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:bg-white cursor-pointer"
          }`}
        >
          Iniciar Sesión
        </div>
        <div
          onClick={() => setLogin(false)}
          className={`w-1/2 text-center cursor-pointer px-4 py-2 rounded-4xl font-semibold text-sm transition-all ${
            !login
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:bg-white"
          }`}
        >
          Registrarme
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register("email", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          {...register("password", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>

      {isDemo && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="mb-2 font-semibold">🧪 Demo: entra con una cuenta de prueba</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {[
              ["Administrador", DEMO_ACCOUNTS.admin],
              ["Paciente", DEMO_ACCOUNTS.paciente],
            ].map(([label, acc]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setValue("email", acc.email);
                  setValue("password", acc.password);
                  handleSubmit(onSubmit)();
                }}
                className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-1.5 font-medium hover:bg-amber-100"
              >
                Entrar como {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-amber-800">
            {DEMO_ACCOUNTS.admin.email} · {DEMO_ACCOUNTS.paciente.email} — clave: {DEMO_ACCOUNTS.admin.password}
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;