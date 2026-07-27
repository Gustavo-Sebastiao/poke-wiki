"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

// Tipo auxiliar
type ActionResponse = {
  success: boolean;
  message?: string;
};

/**
 * Cria um novo usuário no Auth do Supabase.
 * O trigger que criamos no BD vai inserir na tabela profiles automaticamente,
 * mas precisaremos garantir a role se for admin (mas por padrão criará como user, e você promove depois).
 */
export async function createUserAction(
  email: string,
  password: string,
  name: string
): Promise<ActionResponse> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma o email
      user_metadata: { full_name: name },
    });

    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao criar usuário" };
  }
}

/**
 * Atualiza senha e/ou nome de um usuário existente.
 */
export async function updateUserAction(
  userId: string,
  password?: string,
  name?: string
): Promise<ActionResponse> {
  try {
    const updates: any = {};
    if (password && password.length >= 6) updates.password = password;
    if (name) updates.user_metadata = { full_name: name };

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updates
    );

    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao atualizar usuário" };
  }
}

/**
 * Exclui um usuário do Supabase Auth
 * A constraint "on delete cascade" na tabela profiles vai apagar o perfil associado.
 */
export async function deleteUserAction(userId: string): Promise<ActionResponse> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao excluir usuário" };
  }
}
