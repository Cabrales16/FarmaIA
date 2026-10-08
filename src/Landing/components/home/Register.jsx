import { useForm } from "react-hook-form";
import supabase, { isDemo } from "../../../api/supabase";
import toast from "react-hot-toast";

const Register = ({ login, setLogin }) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (datas) => {

    const { email, password, ...profileData } = datas;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return toast.error(error.message || "Vuelve a intentarlo");
    }

    if (data?.user) {
      const dataUser = {
        ...profileData,
        auth_id: data.user.id,
        perfil_id: 3,
      };

      const { error: usuarioError } = await supabase
        .from("usuario")
        .insert(dataUser);

      if (usuarioError) {
        console.error(usuarioError);
        return toast.error("Error al guardar datos de usuario");
      }
    }

    if (isDemo) {
      toast.success("Registro exitoso. Ya puedes iniciar sesión.");
      setLogin(true);
      return;
    }
    toast.success("Registro exitoso, revisa tu correo");
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col justify-center">
      <div className="text-2xl font-bold text-center mb-1">Registrarme</div>
      <div className="text-base text-gray-500 text-center mb-4">
        Crea tu cuenta en el sistema
      </div>

      <div className="flex gap-2 justify-center items-center bg-gray-200 p-1 rounded-4xl mb-6">
        <div
          onClick={() => setLogin(true)}
          className={`w-1/2 text-center cursor-pointer px-4 py-2 rounded-4xl font-semibold text-sm transition-all ${
            login
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:bg-white"
          }`}
        >
          Iniciar Sesión
        </div>
        <div
          className={`w-1/2 text-center px-4 py-2 rounded-4xl font-semibold text-sm transition-all ${
            !login
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:bg-white cursor-pointer"
          }`}
        >
          Registrarme
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          {...register("nombre", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Documento"
          {...register("documento", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          {...register("fecha_nacimiento", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Dirección"
          {...register("direccion", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Teléfono"
          {...register("telefono", { required: true })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Registrarme
        </button>
      </form>
    </div>
  );
};

export default Register;