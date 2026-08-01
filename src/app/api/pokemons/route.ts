import { NextResponse } from 'next/server';
import { getPokemons, createPokemon } from '@/lib/pokemonService';
import { requireRole } from '@/lib/server/authorization';

// Rota GET: /api/pokemons
// Permite buscar todos os pokemons ou filtrar por tipo (?type=fogo)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const pokemons = await getPokemons(type || undefined);
    return NextResponse.json(pokemons, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Rota POST: /api/pokemons
// Cria um novo pokemon (Requer payload JSON no corpo)
export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;
    await requireRole(accessToken, ['admin', 'superadmin']);

    const body = await request.json();
    
    // Validação básica
    if (!body.name || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Nome, descrição e tipo são obrigatórios.' },
        { status: 400 }
      );
    }

    const newPokemon = await createPokemon(body);
    return NextResponse.json(newPokemon, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno.';
    const status = message.includes('autorizado') || message.includes('Sessão')
      ? 401
      : message.includes('Permissão') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
