"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedUser, requireRole, type Role } from "@/lib/server/authorization";
import { getProfiles, type Profile, updateUserRole } from "@/lib/userService";
import { revalidatePath } from "next/cache";

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  message?: string;
};

export async function getCurrentRoleAction(accessToken: string): Promise<ActionResponse<Role>> {
  try {
    const { role } = await getAuthenticatedUser(accessToken);
    return { success: true, data: role };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function getProfilesAction(accessToken: string): Promise<ActionResponse<Profile[]>> {
  try {
    await requireRole(accessToken, ["superadmin"]);
    return { success: true, data: await getProfiles() };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateUserRoleAction(
  accessToken: string,
  userId: string,
  role: Exclude<Role, "superadmin">,
): Promise<ActionResponse> {
  try {
    await requireRole(accessToken, ["superadmin"]);
    if (role !== "user" && role !== "admin") {
      throw new Error("Cargo inválido.");
    }
    await updateUserRole(userId, role);
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function createUserAction(
  accessToken: string,
  email: string,
  password: string,
  name: string
): Promise<ActionResponse> {
  try {
    await requireRole(accessToken, ["superadmin"]);
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateUserAction(
  accessToken: string,
  userId: string,
  password?: string,
  name?: string
): Promise<ActionResponse> {
  try {
    await requireRole(accessToken, ["superadmin"]);
    const updates: { password?: string; user_metadata?: { full_name: string } } = {};
    if (password && password.length >= 6) updates.password = password;
    if (name) updates.user_metadata = { full_name: name };

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updates
    );

    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteUserAction(accessToken: string, userId: string): Promise<ActionResponse> {
  try {
    const currentUser = await requireRole(accessToken, ["superadmin"]);
    if (currentUser.id === userId) {
      throw new Error("Você não pode excluir a própria conta.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (error) throw error;

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro interno.";
}
