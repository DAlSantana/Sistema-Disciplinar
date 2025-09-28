import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SidebarJuridico from "@/components/SidebarJuridico";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProcesses } from "@/lib/api";

type Classificacao = "Leve" | "Média" | "Grave" | "Gravíssima";
type StatusAtual = "Sindicância" | "Aguardando Assinatura" | "Finalizado";
function getStatusClasses(s: StatusAtual) {
  switch (s) {
    case "Sindicância":
      return "bg-status-blue-bg border-status-blue-border text-status-blue-text";
    case "Aguardando Assinatura":
      return "bg-status-purple-bg border-status-purple-border text-status-purple-text";
    case "Finalizado":
      return "bg-status-green-bg border-status-green-border text-status-green-text";
    default:
      return "bg-status-blue-bg border-status-blue-border text-status-blue-text";
  }
}

export default function ProcessosAguardandoAnalise() {
  const navegar = useNavigate();
  const [busca, setBusca] = useState("");
  const [processos, setProcessos] = useState<{ id: string; funcionario: string; tipoDesvio: string; classificacao: Classificacao; dataAbertura: string; status: StatusAtual; }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setCarregando(true);
    setErro(null);
    fetchProcesses()
      .then((data) => {
        if (!mounted) return;
        setProcessos((data as any) || []);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setErro(typeof e?.message === "string" ? e.message : "Falha ao carregar processos");
      })
      .finally(() => {
        if (!mounted) return;
        setCarregando(false);
      });
    return () => { mounted = false; };
  }, []);

  const itens = useMemo(() => {
    // Mostrar processos que precisam de atuação jurídica: "Sindicância"
    const aguardando = processos.filter((c) => c.status === "Sindicância");
    if (!busca.trim()) return aguardando;
    const q = busca.toLowerCase();
    return aguardando.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.funcionario.toLowerCase().includes(q) ||
        c.tipoDesvio.toLowerCase().includes(q) ||
        (c.classificacao as string).toLowerCase().includes(q),
    );
  }, [busca, processos]);

  const aoSair = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-sis-bg-light" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:58:5">
      <SidebarJuridico onSair={aoSair} />
      <div className="flex flex-1 flex-col" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:60:7">
        <div className="flex-1 overflow-auto p-4 md:p-6" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:61:17">
          <div className="mx-auto max-w-7xl space-y-6" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:62:11">
            <div className="flex items-end justify-between gap-4" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:63:13">
              <div>
                <h1 className="mb-2 font-open-sans text-3xl font-bold text-sis-dark-text" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:64:15">
                  Processos Aguardando Análise Jurídica
                </h1>
                <p className="font-roboto text-sis-secondary-text" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:68:17">
                  Lista de processos encaminhados para sindicância e parecer jurídico.
                </p>
              </div>
              <div className="w-full max-w-sm" data-loc="client/pages/juridico/ProcessosAguardandoAnalise.tsx:72:15">
                <Input
                  placeholder="Buscar por ID, funcionário, desvio..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  data-loc="client/components/ui/input.tsx:7:7"
                />
              </div>
            </div>

            <Card className="border-sis-border bg-white" data-loc="client/components/ui/card.tsx:8:3">
              <CardHeader data-loc="client/components/ui/card.tsx:23:3">
                <CardTitle className="text-xl">Sindicância</CardTitle>
              </CardHeader>
              <CardContent>
                {erro && (
                  <div className="mb-3 text-sm text-red-600">{erro}</div>
                )}
                <div className="rounded-md border border-sis-border" data-loc="client/components/ui/card.tsx:62:3">
                  <Table data-loc="client/components/ui/table.tsx:8:3">
                    <TableHeader data-loc="client/components/ui/table.tsx:22:3">
                      <TableRow>
                        <TableHead className="w-[14%]">ID do Processo</TableHead>
                        <TableHead className="w-[20%]">Funcionário</TableHead>
                        <TableHead className="w-[18%]">Tipo de Desvio</TableHead>
                        <TableHead className="w-[14%]">Classificação</TableHead>
                        <TableHead className="w-[16%]">Data de Encaminhamento</TableHead>
                        <TableHead className="w-[10%]">Status</TableHead>
                        <TableHead className="w-[8%]">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-loc="client/components/ui/table.tsx:30:3">
                      {carregando ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sis-secondary-text">Carregando...</TableCell>
                        </TableRow>
                      ) : itens.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-sis-secondary-text">Nenhum processo encontrado.</TableCell>
                        </TableRow>
                      ) : (
                        itens.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              <button
                                className="underline text-blue-600 hover:text-blue-800"
                                onClick={() => navegar(`/juridico/processos/${c.id}`)}
                              >
                                {c.id}
                              </button>
                            </TableCell>
                            <TableCell className="truncate">{c.funcionario || "—"}</TableCell>
                            <TableCell className="truncate">{c.tipoDesvio || "—"}</TableCell>
                            <TableCell>{c.classificacao}</TableCell>
                            <TableCell className="text-sis-secondary-text">{c.dataAbertura || "—"}</TableCell>
                            <TableCell>
                              <Badge className={`border ${getStatusClasses(c.status)}`}>{c.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => navegar(`/juridico/processos/${c.id}`)}>
                                Analisar Processo
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
