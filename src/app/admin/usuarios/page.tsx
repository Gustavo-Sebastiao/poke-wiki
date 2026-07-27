"use client";

import { useEffect, useState } from "react";
import { getProfiles, updateUserRole, Profile } from "@/lib/userService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, ShieldAlert, User as UserIcon, Plus, Trash2, Edit } from "lucide-react";
import { createUserAction, updateUserAction, deleteUserAction } from "@/app/actions/userActions";

export default function GerenciarUsuariosPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Estados dos Formulários
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!authLoading && (role !== 'superadmin')) {
      router.push("/admin");
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    if (role === 'superadmin') {
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Erro ao carregar perfis", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const actionText = currentRole === 'admin' ? 'rebaixar para Usuário' : 'promover a Admin';
    
    if (confirm(`Tem certeza que deseja ${actionText} esta conta?`)) {
      try {
        await updateUserRole(id, newRole);
        setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
      } catch (error) {
        console.error("Erro ao atualizar cargo", error);
        alert("Erro ao alterar as permissões.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta PERMANENTEMENTE? Esta ação não pode ser desfeita.")) {
      try {
        const res = await deleteUserAction(id);
        if (res.success) {
          setProfiles(profiles.filter(p => p.id !== id));
        } else {
          alert(res.message);
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao excluir usuário.");
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const res = await createUserAction(formEmail, formPassword, formName);
    
    if (res.success) {
      setIsCreateModalOpen(false);
      resetForm();
      fetchData(); // Recarrega os dados
    } else {
      setFormError(res.message || "Erro desconhecido");
    }
    setFormLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setFormLoading(true);
    setFormError("");

    const res = await updateUserAction(selectedProfile.id, formPassword, formName);
    
    if (res.success) {
      setIsEditModalOpen(false);
      resetForm();
      fetchData();
    } else {
      setFormError(res.message || "Erro desconhecido");
    }
    setFormLoading(false);
  };

  const openEditModal = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormEmail(profile.email);
    setFormName(""); // O nome não está na tabela profiles por padrão no momento, ficaria em branco
    setFormPassword(""); // Não mostramos a senha atual
    setFormError("");
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormEmail("");
    setFormName("");
    setFormPassword("");
    setFormError("");
    setSelectedProfile(null);
  };

  if (authLoading || role !== 'superadmin') {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-soft">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Painel
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Gerenciar Administradores</h1>
          <p className="text-slate-500 mt-2">Crie novas contas, altere permissões e gerencie acessos.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:-translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Administrador
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando usuários...</div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-medium text-slate-500">Email da Conta</th>
                  <th className="px-6 py-4 font-medium text-slate-500">Cargo Atual</th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        {profile.email}
                        {profile.id === user?.id && (
                          <span className="text-xs bg-[#59F7E2]/20 text-slate-700 px-2 py-1 rounded-full font-bold ml-2">Você</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        profile.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                        profile.role === 'admin' ? 'bg-[#59F7E2]/30 text-slate-800' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {profile.role === 'superadmin' ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {profile.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {profile.role !== 'superadmin' && (
                          <button 
                            onClick={() => handlePromote(profile.id, profile.role)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap ${
                              profile.role === 'admin' 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-[#59F7E2] text-slate-800 hover:bg-[#4de1cd]'
                            }`}
                          >
                            {profile.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
                        )}
                        <button 
                          onClick={() => openEditModal(profile)}
                          title="Editar Nome/Senha"
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {profile.id !== user?.id && (
                          <button 
                            onClick={() => handleDelete(profile.id)}
                            title="Excluir Conta"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criar Usuário */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar Novo Administrador</h2>
            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{formError}</div>}
            
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Nome (Opcional)</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Senha</label>
                <input type="password" required minLength={6} value={formPassword} onChange={e => setFormPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-3 bg-[#59F7E2] text-slate-800 font-bold rounded-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {formLoading ? "Criando..." : "Criar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuário */}
      {isEditModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Editar Conta</h2>
            <p className="text-slate-500 text-sm mb-6">{selectedProfile.email}</p>
            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{formError}</div>}
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Novo Nome</label>
                <input type="text" placeholder="Deixe em branco para manter" value={formName} onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Nova Senha</label>
                <input type="password" minLength={6} placeholder="Deixe em branco para não alterar" value={formPassword} onChange={e => setFormPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {formLoading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
