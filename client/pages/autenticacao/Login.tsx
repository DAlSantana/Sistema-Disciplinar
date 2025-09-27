import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/utils";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  function handleRedirectByRole(role?: string) {
    const r = role?.toLowerCase?.();
    const path = r === "administrador" ? "/administrador" : r === "gestor" ? "/gestor" : r === "juridico" ? "/juridico" : "/";
    try {
      console.info("handleRedirectByRole", { role, normalized: r, path });
      toast({ title: "Login bem-sucedido", description: `Redirecionando para ${path}` });
      // use replace to avoid back-navigation to login
      navigate(path, { replace: true });
    } catch (e) {
      console.error("redirect error:", e);
    }
  }

  const enviarLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario,
        password: senha,
      });

      if (error) {
        toast({ title: "Erro no login", description: error.message });
        return;
      }

      if (data?.session) {
        // fetch profile to determine role
        try {
          const userId = data.user?.id;
          const attemptedEmail = usuario;

          // Log auth user state
          const { data: authUserData, error: getUserErr } = await supabase.auth.getUser();
          console.info("auth.getUser result:", { authUserData, getUserErr });

          // Primary: try to fetch profile by id
          const { data: profileById, error: profileByIdError } = await supabase
            .from("profiles")
            .select("id, perfil, nome")
            .eq("id", userId)
            .maybeSingle();

          if (profileByIdError) {
            try {
              console.error("profiles fetch error:", JSON.stringify(profileByIdError));
            } catch (e) {
              console.error("profiles fetch error (unable to stringify):", profileByIdError);
            }
          }

          if (profileById) {
            console.info("profile found by id:", profileById);
            // Atualiza último acesso (melhor esforço; ignora erro se coluna não existir)
            try {
              await supabase.from("profiles").update({ ultimo_acesso: new Date().toISOString() } as any).eq("id", userId);
            } catch {}
            handleRedirectByRole(profileById.perfil);
            return;
          }

          // No profile found for authenticated user
          toast({ title: "Erro no login", description: "Perfil não encontrado. Contate o administrador." });
          return;

          // If not found by id, try searching by name/email fragment
          try {
            const nameFragment = attemptedEmail?.split("@")[0] ?? "";
            if (nameFragment) {
              const { data: profileByName, error: profileByNameError } = await supabase
                .from("profiles")
                .select("id, perfil, nome")
                .ilike("nome", `%${nameFragment}%`)
                .limit(1);

              if (profileByNameError) {
                console.error("profiles search by name error:", profileByNameError);
              }

              if (profileByName && profileByName.length > 0) {
                console.info("profile found by name/email fragment:", profileByName[0]);
                handleRedirectByRole(profileByName[0].perfil);
                return;
              }
            }
          } catch (e) {
            console.error("search by name fallback threw:", e);
          }

          // Fallback to role in auth metadata
          if (authUserData?.user) {
            const roleFromMetadata = (authUserData.user as any)?.user_metadata?.perfil || (authUserData.user as any)?.user_metadata?.role;
            if (roleFromMetadata) {
              console.info("role found in auth user metadata:", roleFromMetadata);
              handleRedirectByRole(roleFromMetadata as string);
              return;
            }
          }

          // Final fallback: default to funcionario
          console.info("No profile or metadata role found — defaulting to 'funcionario'");
          handleRedirectByRole("funcionario");
          return;
        } catch (err) {
          console.error("error determining profile:", err);
          toast({ title: "Login bem-sucedido" });
          navigate("/");
        }
      } else {
        toast({ title: "Login", description: "Verifique suas credenciais." });
      }
    } catch (err: any) {
      toast({ title: "Erro no login", description: errorMessage(err) });
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-8 xl:w-auto xl:min-w-[584px] xl:px-0 xl:pl-[136px] xl:pr-[68px]">
        <div className="w-full max-w-md xl:max-w-[448px]">
          <div className="rounded-[10px] border border-white bg-white shadow-[0_0_2px_0_rgba(23,26,31,0.12),0_0_1px_0_rgba(23,26,31,0.07)] p-6 sm:p-8 xl:p-10">
            {/* Logo e Título */}
            <div className="mb-6 flex items-center sm:mb-8">
              <img
                className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12"
                src="https://cdn.builder.io/api/v1/image/assets%2Fd37e8caa844a480690999b86d10efac5%2F21c13cf313cb4f499007dc360015bfce?format=webp&width=96"
                alt="Logo SisDisciplinar"
              />
              <h1 className="ml-2 font-open-sans text-2xl font-bold italic text-sis-blue sm:ml-3 sm:text-3xl xl:text-[38px] xl:leading-[38px]">SisDisciplinar</h1>
            </div>

            {/* Cabeçalho Principal */}
            <div className="mb-6 text-center sm:mb-8">
              <h2 className="mb-2 font-open-sans text-xl font-bold text-sis-dark-text sm:mb-3 sm:text-2xl xl:text-[30px] xl:leading-9">Acesse sua conta</h2>
              <p className="font-roboto text-sm text-sis-secondary-text sm:text-base xl:leading-6">Bem-vindo de volta ao SisDisciplinar!</p>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={enviarLogin} className="space-y-6">
              <div className="space-y-3.5">
                <label className="block font-roboto text-xs font-medium text-sis-dark-text xl:leading-5">Nome de Usuário</label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full rounded-md border border-sis-border bg-white px-3 py-2 font-roboto text-sm text-sis-secondary-text placeholder:text-sis-secondary-text focus:border-sis-blue focus:outline-none focus:ring-1 focus:ring-sis-blue xl:h-[37px] xl:px-3 xl:py-2"
                  placeholder="seu.email@email.com"
                />
              </div>

              <div className="space-y-3.5">
                <label className="block font-roboto text-xs font-medium text-sis-dark-text xl:leading-5">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-md border border-sis-border bg-white px-3 py-2 font-roboto text-sm text-sis-secondary-text placeholder:text-sis-secondary-text focus:border-sis-blue focus:outline-none focus:ring-1 focus:ring-sis-blue xl:h-[37px] xl:px-3 xl:py-2"
                  placeholder="•••••••"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/autenticacao/esqueci-senha")}
                  className="font-roboto text-sm font-medium text-sis-secondary-text hover:text-sis-blue focus:outline-none focus:text-sis-blue xl:leading-[22px]"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <button type="submit" className="w-full rounded-md bg-sis-blue py-2.5 font-roboto text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-sis-blue focus:ring-offset-2 xl:h-[40px] xl:py-2.5">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lado Direito - Ilustração */}
      <div className="hidden lg:flex lg:h-full lg:flex-1 xl:w-[720px] xl:flex-none">
        <div className="flex h-screen w-full flex-col items-center justify-center bg-sis-bg-light">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/18fb8f921705a3e5fe1c084d8ea7a2d9adc3172b?width=1440"
            alt="Ilustração justiça"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
