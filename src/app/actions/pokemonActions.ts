'use server';

import {
  createPokemon,
  deletePokemon,
  getPokemonById,
  getPokemons,
  type Pokemon,
  updatePokemon,
} from '@/lib/pokemonService';
import { requireRole } from '@/lib/server/authorization';
import { revalidatePath } from 'next/cache';

type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  message?: string;
};

const adminRoles = ['admin', 'superadmin'] as const;

export async function getAdminPokemonsAction(accessToken: string): Promise<ActionResponse<Pokemon[]>> {
  try {
    await requireRole(accessToken, adminRoles);
    return { success: true, data: await getPokemons() };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function getPokemonAction(accessToken: string, id: string): Promise<ActionResponse<Pokemon>> {
  try {
    await requireRole(accessToken, adminRoles);
    return { success: true, data: await getPokemonById(id) };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function createPokemonAction(
  accessToken: string,
  pokemon: Pokemon,
): Promise<ActionResponse<Pokemon>> {
  try {
    await requireRole(accessToken, adminRoles);
    const data = await createPokemon(pokemon);
    revalidatePath('/');
    revalidatePath('/pokedex');
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updatePokemonAction(
  accessToken: string,
  id: string,
  pokemon: Partial<Pokemon>,
): Promise<ActionResponse<Pokemon>> {
  try {
    await requireRole(accessToken, adminRoles);
    const data = await updatePokemon(id, pokemon);
    revalidatePath('/');
    revalidatePath('/pokedex');
    revalidatePath('/admin');
    return { success: true, data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deletePokemonAction(
  accessToken: string,
  id: string,
): Promise<ActionResponse> {
  try {
    await requireRole(accessToken, adminRoles);
    await deletePokemon(id);
    revalidatePath('/');
    revalidatePath('/pokedex');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro interno.';
}
