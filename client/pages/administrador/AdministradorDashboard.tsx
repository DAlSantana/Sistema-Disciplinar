import { useNavigate } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";
import * as Router from "react-router-dom";
import SidebarAdministrador from "@/components/SidebarAdministrador";
import CartaoMetrica from "@/components/CartaoMetrica";
import UltimosLogins from "@/components/UltimosLogins";
import AtividadesRecentes from "@/components/AtividadesRecentes";
import AcoesRapidas from "@/components/AcoesRapidas";
import { authHeaders } from "@/lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export default function AdministradorDashboard() {
  const navigate = Router.useNavigate();

  const handleSair = () => {
    navigate("/");
  };

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [usuariosPorPerfil, setUsuariosPorPerfil] = useState<Array<{ perfil: string; total: number }>>([]);
  const [loginsSerie, setLoginsSerie] = useState<Array<{ dia: string; total: number }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/users", { headers: await authHeaders() });
        if (res.status === 401) { if (mounted) { setTotalUsuarios(0); setUsuariosPorPerfil([]); } return; }
        if (!res.ok) throw new Error(String(res.status));
        const rows = (await res.json()) as any[];
        if (mounted) {
          setTotalUsuarios(Array.isArray(rows) ? rows.length : 0);
          const byPerfil = new Map<string, number>();
          (rows || []).forEach((r: any) => {
            const p = (r.perfil || "não definido") as string;
            byPerfil.set(p, (byPerfil.get(p) || 0) + 1);
          });
          setUsuariosPorPerfil(Array.from(byPerfil.entries()).map(([perfil, total]) => ({ perfil, total })));
        }
      } catch {
        if (mounted) { setTotalUsuarios(0); setUsuariosPorPerfil([]); }
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/admin/logins", { headers: await authHeaders() });
        if (!res.ok) throw new Error(String(res.status));
        const rows = (await res.json()) as Array<{ lastSignInAt: string | null } & any>;
        // Bucket por dia (últimos 14 dias)
        const days = 14;
        const buckets = new Map<string, number>();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          buckets.set(key, 0);
        }
        (rows || []).forEach((r) => {
          const iso = r.lastSignInAt; if (!iso) return;
          const key = new Date(iso).toISOString().slice(0, 10);
          if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
        });
        const serie = Array.from(buckets.entries()).map(([k, v]) => ({ dia: k.slice(5), total: v }));
        if (mounted) setLoginsSerie(serie);
      } catch {
        if (mounted) setLoginsSerie([]);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const chartUsuariosData = useMemo(() => usuariosPorPerfil.map((x) => ({ name: x.perfil, total: x.total })), [usuariosPorPerfil]);

  return (
    <div className="min-h-screen bg-sis-bg-light">
      <div className="flex">
        <SidebarAdministrador onSair={handleSair} />

        {/* Conteúdo principal */}
        <div className="flex-1 p-4 md:p-6 max-[360px]:p-3">
          {/* Título principal */}
          <div className="mb-6">
            <h1 className="font-open-sans text-[30px] font-bold leading-[36px] text-sis-dark-text">
              Dashboard do Administrador
            </h1>
          </div>

          {/* Grid de cartões */}
          <div className="space-y-6">
            {/* Primeira linha - Métricas principais */}
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
              <CartaoMetrica
                titulo="Total de Usuários"
                valor={String(totalUsuarios)}
                descricao="Contagem atual no banco"
                corValor="text-sis-blue"
                icon={
                  <svg
                    className="h-6 w-6"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15 21V19C15 18.2044 14.6837 17.4415 14.1211 16.8789C13.6289 16.3867 12.9835 16.0829 12.2969 16.0146L12 16L6 16C5.20435 16 4.44152 16.3163 3.87891 16.8789C3.3163 17.4415 3 18.2044 3 19L3 21C3 21.5523 2.55228 22 2 22C1.44772 22 1 21.5523 1 21L1 19C1 17.6739 1.52716 16.4025 2.46484 15.4648C3.40253 14.5272 4.67392 14 6 14L12 14L12.248 14.0059C13.4838 14.0672 14.6561 14.5858 15.5352 15.4648C16.4728 16.4025 17 17.6739 17 19V21C17 21.5523 16.5523 22 16 22C15.4477 22 15 21.5523 15 21Z" fill="currentColor"/>
                    <path d="M17.9961 7.00008C17.9961 6.33559 17.7757 5.6897 17.3691 5.16415C17.0132 4.70415 16.5321 4.35885 15.9863 4.16805L15.749 4.09579L15.6514 4.06551C15.1761 3.88941 14.9023 3.37825 15.0322 2.87704C15.1622 2.37596 15.6495 2.06289 16.1504 2.13973L16.251 2.16024L16.4502 2.2159C17.4406 2.51689 18.3146 3.11916 18.9502 3.94051C19.628 4.81649 19.9961 5.89248 19.9961 7.00008C19.9961 8.10769 19.628 9.18367 18.9502 10.0597C18.2723 10.9356 17.3232 11.562 16.251 11.8399C15.7164 11.9785 15.1709 11.6576 15.0322 11.1231C14.8936 10.5886 15.2145 10.043 15.749 9.90438C16.3923 9.7376 16.9624 9.36162 17.3691 8.83602C17.7758 8.31046 17.9961 7.66459 17.9961 7.00008Z" fill="currentColor"/>
                    <path d="M21 21.0001V19.0011L20.9893 18.7531C20.9411 18.1769 20.7275 17.6249 20.3711 17.1652C20.0147 16.7054 19.5334 16.3604 18.9873 16.1701L18.75 16.0978L18.6523 16.0675C18.1769 15.8919 17.9028 15.3813 18.0322 14.88C18.1617 14.3789 18.6485 14.0645 19.1494 14.1408L19.25 14.1622L19.4492 14.2179C20.4401 14.518 21.3158 15.1186 21.9521 15.9396C22.6308 16.8151 22.9991 17.8914 23 18.9992V21.0001C22.9999 21.5524 22.5522 22.0001 22 22.0001C21.4478 22.0001 21.0001 21.5524 21 21.0001Z" fill="currentColor"/>
                    <path d="M12 7C12 5.34315 10.6569 4 9 4C7.34315 4 6 5.34315 6 7C6 8.65685 7.34315 10 9 10C10.6569 10 12 8.65685 12 7ZM14 7C14 9.76142 11.7614 12 9 12C6.23858 12 4 9.76142 4 7C4 4.23858 6.23858 2 9 2C11.7614 2 14 4.23858 14 7Z" fill="currentColor"/>
                  </svg>
                }
              />

              <UltimosLogins />
            </div>

            {/* Segunda linha - Gráficos */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-lg border bg-white p-5 shadow-sm h-full">
                <h3 className="mb-2 font-roboto text-base font-semibold text-sis-dark-text sm:text-lg">Usuários por Perfil</h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartUsuariosData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="total" fill="#0F74C7" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5 shadow-sm h-full">
                <h3 className="mb-2 font-roboto text-base font-semibold text-sis-dark-text sm:text-lg">Logins nos últimos 14 dias</h3>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loginsSerie}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#0F74C7" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Terceira linha - Atividades e Ações */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AtividadesRecentes />
              <AcoesRapidas />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
