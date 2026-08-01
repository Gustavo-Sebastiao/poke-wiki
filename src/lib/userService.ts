import 'server-only';

import { supabaseAdmin } from './supabaseAdmin';

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  created_at: string;
}

// Buscar todos os perfis (apenas se tiver permissão, RLS deve estar desabilitado ou permitir para superadmin)
export async function getProfiles() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro ao buscar perfis:', error);
    throw new Error(error.message);
  }
  
  return data as Profile[];
}

// Atualizar o cargo de um usuário
export async function updateUserRole(id: string, role: 'user' | 'admin' | 'superadmin') {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar cargo:', error);
    throw new Error(error.message);
  }
  
  return data;
}
