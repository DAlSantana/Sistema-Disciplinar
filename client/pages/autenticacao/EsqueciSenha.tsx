import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "E-mail inválido", description: "Informe um e-mail válido." });
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/autenticacao/redefinir-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        toast({ title: "Erro ao solicitar redefinição", description: error.message });
        return;
      }
      toast({ title: "E-mail enviado", description: "Se o e-mail existir, você receberá um link para redefinir a senha." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-8 xl:px-10 max-[360px]:px-3 max-[360px]:py-6">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
          <div className="rounded-[10px] border border-white bg-white shadow-[0_0_2px_0_rgba(23,26,31,0.12),0_0_1px_0_rgba(23,26,31,0.07)] p-6 sm:p-8 xl:p-10 max-[360px]:p-4">
            <div className="mb-6 flex items-center sm:mb-8">
              <svg className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" stroke="white" />
                <path d="M18.9023 32.236C19.2911 30.7851 20.7825 29.924 22.2335 30.3128C23.6846 30.7016 24.5456 32.193 24.1568 33.644L22.0981 41.3273C21.8794 42.1435 21.0404 42.6278 20.2242 42.4092L17.9253 41.7931C17.1092 41.5745 16.6248 40.7355 16.8435 39.9194L18.9023 32.236Z" fill="#0F74C7" />
                <path d="M28.5027 28.4036C29.5648 27.3414 31.2873 27.3414 32.3494 28.4036L38.1452 34.1994C38.7428 34.7969 38.7428 35.7657 38.1452 36.3631L36.4624 38.046C35.8649 38.6435 34.8962 38.6435 34.2987 38.046L28.5027 32.2501C27.4405 31.188 27.4405 29.4659 28.5027 28.4036Z" fill="#0F74C7" />
                <path d="M14.8047 23.4971C16.2557 23.1083 17.7471 23.9695 18.1359 25.4204C18.5247 26.8714 17.6637 28.363 16.2127 28.7518L8.03407 30.9432C7.21786 31.1619 6.3789 30.6775 6.16019 29.8614L5.54421 27.5624C5.32551 26.7463 5.80987 25.9073 6.62608 25.6887L14.8047 23.4971Z" fill="#0F74C7" />
                <path d="M30.9977 2.18752C31.8139 2.40623 32.2982 3.24518 32.0796 4.06138L26.495 24.9033C26.1062 26.3543 24.6148 27.2153 23.1636 26.8267C21.7127 26.4379 20.8516 24.9463 21.2403 23.4954L26.8248 2.65341C27.0435 1.8372 27.8825 1.35283 28.6987 1.57152L30.9977 2.18752Z" fill="#0F74C7" />
                <path d="M42.6634 20.0812C42.882 20.8973 42.3976 21.7363 41.5815 21.9551L33.508 24.1182C32.0571 24.507 30.5656 23.6459 30.1769 22.195C29.7881 20.7438 30.6491 19.2524 32.1001 18.8636L40.1735 16.7005C40.9897 16.4818 41.8287 16.9661 42.0473 17.7823L42.6634 20.0812Z" fill="#0F74C7" />
                <path d="M19.6489 15.7031C20.7112 16.7653 20.7112 18.4874 19.6489 19.5497C18.5867 20.6119 16.8646 20.6119 15.8024 19.5497L6.22156 9.96888C5.62406 9.37138 5.62406 8.40263 6.22156 7.80514L7.90439 6.12229C8.50191 5.52479 9.47064 5.52479 10.0682 6.12229L19.6489 15.7031Z" fill="#0F74C7" />
              </svg>
              <h1 className="ml-2 font-open-sans text-2xl font-bold italic text-sis-blue sm:ml-3 sm:text-3xl xl:text-[38px] xl:leading-[38px] max-[360px]:text-xl">SisDisciplinar</h1>
            </div>

            <div className="mb-6 text-center sm:mb-8 max-[360px]:mb-5">
              <h2 className="mb-2 font-open-sans text-xl font-bold text-sis-dark-text sm:mb-3 sm:text-2xl xl:text-[30px] xl:leading-9 max-[360px]:text-lg">Solicitar Redefinição</h2>
              <p className="font-roboto text-sm text-sis-secondary-text sm:text-base xl:leading-6 max-[360px]:text-xs">Informe seu e-mail para receber o link de redefinição.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 max-[360px]:space-y-5">
              <div className="space-y-3.5">
                <label className="block font-roboto text-xs font-medium text-sis-dark-text xl:leading-5">E-mail</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-sis-border bg-white px-3 py-2 font-roboto text-sm text-sis-secondary-text placeholder:text-sis-secondary-text focus:border-sis-blue focus:outline-none focus:ring-1 focus:ring-sis-blue xl:h-[37px] xl:px-3 xl:py-2 max-[360px]:text-xs max-[360px]:py-1.5"
                  placeholder="seu.email@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-sis-blue py-2.5 font-roboto text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-sis-blue focus:ring-offset-2 disabled:opacity-60 xl:h-[40px] xl:py-2.5 max-[360px]:py-2"
              >
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:h-full lg:flex-1">
        <div className="flex h-screen w-full flex-col items-center justify-center bg-sis-bg-light">
          <img src="https://api.builder.io/api/v1/image/assets/TEMP/18fb8f921705a3e5fe1c084d8ea7a2d9adc3172b?width=1440" alt="Ilustração justiça" className="h-full w-full object-cover opacity-90" />
        </div>
      </div>
    </div>
  );
}
