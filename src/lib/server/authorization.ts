import 'server-only';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type Role = 'user' | 'admin' | 'superadmin';

export async function getAuthenticatedUser(accessToken: string | undefined) {
  if (!accessToken) {
    throw new Error('Não autorizado.');
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error('Sessão inválida ou expirada.');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Perfil de usuário não encontrado.');
  }

  return { user, role: profile.role as Role };
}

export async function requireRole(accessToken: string | undefined, allowedRoles: readonly Role[]) {
  const authenticatedUser = await getAuthenticatedUser(accessToken);

  if (!allowedRoles.includes(authenticatedUser.role)) {
    throw new Error('Permissão insuficiente.');
  }

  return authenticatedUser.user;
}
