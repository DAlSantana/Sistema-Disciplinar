import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchProcessById, updateProcess } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ProcessoAcompanhamento() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id as string;

  const [processo, setProcesso] = useState<any | null>(null);
  const [medidaAplicada, setMedidaAplicada] = useState<string>("");
  const [diasSuspensao, setDiasSuspensao] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    fetchProcessById(id)
      .then((p) => {
        if (mounted) {
          setProcesso(p as any);
          // prefill medida if exists
          if ((p as any)?.resolucao) setMedidaAplicada((p as any).resolucao);
          if ((p as any)?.dias_de_suspensao) setDiasSuspensao(String((p as any).dias_de_suspensao));
        }
      })
      .catch(() => setProcesso(null));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSair = () => {
    window.location.href = "/";
  };

  const salvarMedida = async () => {
    // if 'Suspensão' selected, diasSuspensao is required
    if (medidaAplicada === "Suspensão") {
      const n = Number(diasSuspensao);
      if (!diasSuspensao || Number.isNaN(n) || n <= 0) {
        toast({ title: "Dias de Suspensão obrigatório", description: "Informe a quantidade de dias para a suspensão." });
        return;
      }
    }

    try {
      const patch: any = {
        resolucao: medidaAplicada || null,
        dias_de_suspensao: medidaAplicada === "Suspensão" ? Number(diasSuspensao) : null,
      };
      await updateProcess(id, patch);
      toast({ title: "Medida salva", description: "A medida aplicada foi atualizada com sucesso." });
      const refreshed = await fetchProcessById(id);
      setProcesso(refreshed as any);
    } catch (e: any) {
      toast({ title: "Erro ao salvar medida", description: e?.message ?? String(e) });
    }
  };

  return (
    <div className="flex h-screen bg-sis-bg-light">
      <Sidebar onSair={handleSair} />
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
            {!processo ? (
              <div className="space-y-4 rounded-md border border-sis-border bg-white p-6">
                <h1 className="font-open-sans text-2xl font-bold text-sis-dark-text">Processo não encontrado</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="mb-2 font-open-sans text-3xl font-bold text-sis-dark-text">Acompanhamento do Processo</h1>
                  <p className="font-roboto text-sis-secondary-text">Informações gerais e etapas do processo selecionado.</p>
                </div>

                <div className="rounded-md border border-sis-border bg-white p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-sis-secondary-text">ID</p>
                      <p className="font-medium text-sis-dark-text">{processo.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sis-secondary-text">Funcionário</p>
                      <p className="font-medium text-sis-dark-text">{processo.funcionario}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sis-secondary-text">Tipo de Desvio</p>
                      <p className="font-medium text-sis-dark-text">{processo.tipoDesvio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sis-secondary-text">Classificação</p>
                      <p className="font-medium text-sis-dark-text">{processo.classificacao}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sis-secondary-text">Data de Abertura</p>
                      <p className="font-medium text-sis-dark-text">{processo.dataAbertura}</p>
                    </div>
                    <div>
                      <p className="text-sm text-sis-secondary-text">Status Atual</p>
                      <p className="font-medium text-sis-dark-text">{processo.status}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="mb-2 text-sm text-sis-secondary-text">Medida Aplicada</p>
                    <div className="max-w-md">
                      <Select value={medidaAplicada} onValueChange={setMedidaAplicada}>
                        <SelectTrigger>
                          <SelectValue placeholder={processo.resolucao || "Selecione a medida aplicada"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Advertência Escrita">Advertência Escrita</SelectItem>
                          <SelectItem value="Suspensão">Suspensão</SelectItem>
                          <SelectItem value="Justa Causa">Justa Causa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {medidaAplicada === "Suspensão" && (
                      <div className="mt-3 max-w-xs">
                        <p className="mb-1 text-sm text-sis-secondary-text">Dias de Suspensão</p>
                        <Input type="number" min={1} value={diasSuspensao} onChange={(e) => setDiasSuspensao(e.target.value)} />
                        <p className="mt-1 text-xs text-sis-secondary-text">Campo obrigatório quando a medida aplicada for Suspensão.</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
                      <Button onClick={salvarMedida} className="bg-sis-blue text-white">Salvar Medida</Button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
