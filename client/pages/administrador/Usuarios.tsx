import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SidebarAdministrador from "@/components/SidebarAdministrador";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, type PerfilUsuario } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function UsuariosAdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  type Usuario = { id: string; nome: string; email: string; perfil: PerfilUsuario; ativo: boolean; criadoEm?: string; ultimoAcesso?: string | null };
  const [busca, setBusca] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [novo, setNovo] = useState<{ nome: string; email: string; password: string; perfil: PerfilUsuario; ativo: boolean }>({ nome: "", email: "", password: "", perfil: "funcionario", ativo: true });

  const [abrirEditar, setAbrirEditar] = useState(false);
  const [alvoEdicao, setAlvoEdicao] = useState<Usuario | null>(null);
  const [edicao, setEdicao] = useState<{ nome: string; email: string; perfil: PerfilUsuario; ativo: boolean }>({ nome: "", email: "", perfil: "funcionario", ativo: true });

  const carregarUsuarios = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      setUsuarios([]);
      return;
    }
    const body = await res.json();
    const rows: any[] = Array.isArray(body) ? body : [];
    setUsuarios(
      rows.map((p) => ({
        id: p.id,
        nome: p.nome ?? "",
        email: p.email ?? ((p.nome ? p.nome.toLowerCase().replace(/\s+/g, ".") : "user") + "@empresa.com"),
        perfil: (p.perfil ?? "funcionario") as PerfilUsuario,
        ativo: p.ativo ?? true,
        criadoEm: new Date().toISOString(),
        ultimoAcesso: null,
      }))
    );
  };

  useEffect(() => {
    let mounted = true;
    carregarUsuarios().catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        carregarUsuarios().catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => [u.nome, u.email, u.id, u.perfil].join(" ").toLowerCase().includes(q));
  }, [busca, usuarios]);

  const alternarAtivo = async (id: string, ativo: boolean) => {
    const old = usuarios;
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ativo } : u)));
    try {
      await updateProfile(id, { ativo });
      toast({ title: ativo ? "Usuário ativado" : "Usuário desativado" });
    } catch (e: any) {
      setUsuarios(old);
      toast({ title: "Erro ao atualizar status", description: e?.message || String(e) });
    }
  };

  const criarUsuario = async () => {
    if (!novo.nome || !novo.email || !novo.password || novo.password.length < 6) {
      toast({ title: "Preencha nome, e-mail e senha (mín. 6)" });
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novo.nome, email: novo.email, password: novo.password, perfil: novo.perfil, ativo: novo.ativo }),
      });

      let payload: any = null;
      let fallbackText: string | null = null;
      try {
        payload = await res.clone().json();
      } catch {}
      if (!payload) {
        try {
          fallbackText = await res.text();
        } catch {}
      }

      if (!res.ok) {
        const msg = (payload && (payload.error || payload.message)) || fallbackText || `${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = payload ?? {};
      await carregarUsuarios();
      setAbrirNovo(false);
      setNovo({ nome: "", email: "", password: "", perfil: "funcionario", ativo: true });
      toast({ title: "Usuário criado", description: `${data.nome} (${data.perfil})` });
    } catch (e: any) {
      toast({ title: "Erro ao criar usuário", description: e?.message || String(e) });
    }
  };

  const handleSair = () => navigate("/");

  const abrirModalEdicao = (u: Usuario) => {
    setAlvoEdicao(u);
    setEdicao({ nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo });
    setAbrirEditar(true);
  };

  const salvarEdicao = async () => {
    if (!alvoEdicao) return;
    const id = alvoEdicao.id;
    const patch = { nome: edicao.nome, perfil: edicao.perfil, ativo: edicao.ativo };
    const old = usuarios;
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    try {
      await updateProfile(id, patch);
      setAbrirEditar(false);
      toast({ title: "Usuário atualizado", description: edicao.nome });
    } catch (e: any) {
      setUsuarios(old);
      toast({ title: "Erro ao salvar", description: e?.message || String(e) });
    }
  };

  return (
    <div className="flex h-screen bg-sis-bg-light">
      <SidebarAdministrador onSair={handleSair} />
      <div className="flex flex-1 flex-col">
                <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="mb-2 font-open-sans text-3xl font-bold text-sis-dark-text">Gerenciamento de Usuários</h1>
              <p className="font-roboto text-sm text-sis-secondary-text">Administre perfis, status de acesso e cadastre novos usu��rios.</p>
            </div>

            <Card className="border-sis-border bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Buscar e Cadastrar</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-2"><Input placeholder="Buscar por nome, e-mail, ID ou perfil" value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
                <Dialog open={abrirNovo} onOpenChange={setAbrirNovo}>
                  <DialogTrigger asChild>
                    <Button className="bg-sis-blue text-white hover:bg-blue-700">+ Novo Usuário</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <Label>Nome</Label>
                        <Input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
                      </div>
                      <div>
                        <Label>E-mail</Label>
                        <Input type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Senha (mín. 6)</Label>
                        <Input type="password" value={novo.password} onChange={(e) => setNovo({ ...novo, password: e.target.value })} />
                      </div>
                      <div>
                        <Label>Perfil</Label>
                        <Select value={novo.perfil} onValueChange={(v: PerfilUsuario) => setNovo({ ...novo, perfil: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="administrador">Administrador</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="juridico">Jurídico</SelectItem>
                            <SelectItem value="funcionario">Funcionário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ativo</Label>
                        <Switch checked={novo.ativo} onCheckedChange={(v) => setNovo({ ...novo, ativo: v })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAbrirNovo(false)}>Cancelar</Button>
                      <Button onClick={criarUsuario} className="bg-sis-blue text-white hover:bg-blue-700">Criar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <div className="rounded-md border border-sis-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">{u.nome}</TableCell>
                      <TableCell className="truncate max-w-[250px]">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{u.perfil}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${u.ativo ? "text-green-600" : "text-red-600"}`}>{u.ativo ? "Ativo" : "Inativo"}</span>
                          <Switch checked={u.ativo} onCheckedChange={(v) => alternarAtivo(u.id, v)} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(u)}>Editar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Modal de Edição */}
            <Dialog open={abrirEditar} onOpenChange={setAbrirEditar}>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Nome</Label>
                    <Input value={edicao.nome} onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })} />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input type="email" value={edicao.email} onChange={(e) => setEdicao({ ...edicao, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Perfil</Label>
                    <Select value={edicao.perfil} onValueChange={(v: PerfilUsuario) => setEdicao({ ...edicao, perfil: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="juridico">Jurídico</SelectItem>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch checked={edicao.ativo} onCheckedChange={(v) => setEdicao({ ...edicao, ativo: v })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAbrirEditar(false)}>Cancelar</Button>
                  <Button onClick={salvarEdicao} className="bg-sis-blue text-white hover:bg-blue-700">Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
