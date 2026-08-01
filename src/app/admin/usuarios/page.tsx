"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/userService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, ShieldAlert, User as UserIcon, Plus, Trash2, Edit } from "lucide-react";
import {
  createUserAction,
  deleteUserAction,
  getProfilesAction,
  updateUserAction,
  updateUserRoleAction,
} from "@/app/actions/userActions";
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

export default function GerenciarUsuariosPage() {
  const { user, role, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].adminUsers;
  const tCommon = translations[language].adminPokemon;
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
    if (role === 'superadmin' && session?.access_token) {
      const loadProfiles = async () => {
        try {
          setLoading(true);
          const result = await getProfilesAction(session.access_token);
          if (!result.success) throw new Error(result.message);
          setProfiles(result.data ?? []);
        } catch (error) {
          console.error("Erro ao carregar perfis", error);
        } finally {
          setLoading(false);
        }
      };
      loadProfiles();
    }
  }, [role, session?.access_token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getProfilesAction(session?.access_token ?? '');
      if (!result.success) throw new Error(result.message);
      setProfiles(result.data ?? []);
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
        const result = await updateUserRoleAction(session?.access_token ?? '', id, newRole);
        if (!result.success) throw new Error(result.message);
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
        const res = await deleteUserAction(session?.access_token ?? '', id);
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

    const res = await createUserAction(
      session?.access_token ?? '',
      formEmail,
      formPassword,
      formName,
    );
    
    if (res.success) {
      setIsCreateModalOpen(false);
      resetForm();
      fetchData(); // Recarrega os dados
    } else {
      setFormError(res.message || t.errorUnknown);
    }
    setFormLoading(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setFormLoading(true);
    setFormError("");

    const res = await updateUserAction(
      session?.access_token ?? '',
      selectedProfile.id,
      formPassword,
      formName,
    );
    
    if (res.success) {
      setIsEditModalOpen(false);
      resetForm();
      fetchData();
    } else {
      setFormError(res.message || t.errorUnknown);
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
            {tCommon.back}
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{t.title}</h1>
          <p className="text-slate-500 mt-2">{t.subtitle}</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:-translate-y-1 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.newAdmin}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">{t.loading}</div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">{t.noUsers}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-medium text-slate-500">{t.email}</th>
                  <th className="px-6 py-4 font-medium text-slate-500">{t.role}</th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-right">{t.actions}</th>
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
                          <span className="text-xs bg-[#59F7E2]/20 text-slate-700 px-2 py-1 rounded-full font-bold ml-2">{t.you}</span>
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
                            {profile.role === 'admin' ? t.removeAdmin : t.makeAdmin}
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
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.createTitle}</h2>
            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{formError}</div>}
            
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <input type="email" required value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{t.nameOptional}</label>
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
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t.cancel}</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-3 bg-[#59F7E2] text-slate-800 font-bold rounded-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {formLoading ? t.creating : t.createAccount}
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.editTitle}</h2>
            <p className="text-slate-500 text-sm mb-6">{selectedProfile.email}</p>
            {formError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{formError}</div>}
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">{t.newName}</label>
                <input type="text" placeholder={t.newNamePlaceholder} value={formName} onChange={e => setFormName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{t.newPassword}</label>
                <input type="password" minLength={6} placeholder={t.newPasswordPlaceholder} value={formPassword} onChange={e => setFormPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#59F7E2]" />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t.cancel}</button>
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:-translate-y-1 transition-all disabled:opacity-50">
                  {formLoading ? t.saving : t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
