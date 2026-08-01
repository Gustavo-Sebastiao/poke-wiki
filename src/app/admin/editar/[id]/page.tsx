"use client";

import { useState, useEffect } from 'react';
import { getPokemonAction, updatePokemonAction } from '@/app/actions/pokemonActions';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import TagSelector, { POKEMON_TAGS } from '@/components/TagSelector';
import { fetchPokemonFromPokeAPIAction } from '@/app/actions/dataActions';

export default function EditarPokemonPage() {
  const router = useRouter();
  const params = useParams();
  const pokemonId = params.id as string;
  const { role, session, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isFetchingAPI, setIsFetchingAPI] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: [] as string[],
    description: '',
    weaknesses: [] as string[],
    image_url: ''
  });

  useEffect(() => {
    if (!authLoading && role !== 'admin' && role !== 'superadmin') {
      router.push('/login');
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    if (session?.access_token && pokemonId && (role === 'admin' || role === 'superadmin')) {
      const loadData = async () => {
        try {
          const result = await getPokemonAction(session.access_token, pokemonId);
          if (!result.success || !result.data) throw new Error(result.message);
          const pokemon = result.data;
          setFormData({
            name: pokemon.name,
            type: pokemon.type ? pokemon.type.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
            description: pokemon.description,
            weaknesses: pokemon.weaknesses || [],
            image_url: pokemon.image_url || ''
          });
        } catch {
          setError('Não foi possível carregar os dados do Pokémon.');
        } finally {
          setFetching(false);
        }
      };
      loadData();
    }
  }, [session?.access_token, role, pokemonId]);

  if (authLoading || (role !== 'admin' && role !== 'superadmin') || fetching) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const pokemonData = {
        ...formData,
        type: formData.type.join(', '),
        weaknesses: formData.weaknesses,
      };
      
      const result = await updatePokemonAction(session?.access_token ?? '', pokemonId, pokemonData);
      if (!result.success) throw new Error(result.message);
      router.push('/admin');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar pokémon.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = async () => {
    if (!formData.name) {
      setError('Digite o nome do Pokémon antes de buscar.');
      return;
    }
    
    setIsFetchingAPI(true);
    setError('');
    
    try {
      const data = await fetchPokemonFromPokeAPIAction(formData.name);
      setFormData(prev => ({
        ...prev,
        name: data.name,
        type: data.type.slice(0, 2),
        description: data.description || prev.description,
        weaknesses: data.weaknesses,
        image_url: data.image_url || prev.image_url
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao buscar na PokéAPI.');
    } finally {
      setIsFetchingAPI(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-soft">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Painel
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Editar Pokémon</h1>
        <p className="text-slate-500 mt-2">Atualize as informações do Pokémon.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-soft">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-600">Nome</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                name="name"
                required
                className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
                value={formData.name}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={isFetchingAPI || !formData.name}
                className="px-4 py-3 bg-indigo-50 text-indigo-500 rounded-2xl hover:bg-indigo-100 hover:text-indigo-600 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Auto-preencher dados da PokéAPI"
              >
                {isFetchingAPI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>
            
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Tipo (Máx. 2)</label>
            <TagSelector 
              options={POKEMON_TAGS}
              selectedTags={formData.type}
              onChange={(tags) => setFormData({ ...formData, type: tags })}
              limit={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="image_url" className="text-sm font-medium text-slate-600">URL da Imagem</label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              placeholder="https://exemplo.com/imagem.png"
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={formData.image_url}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Fraquezas</label>
            <TagSelector 
              options={POKEMON_TAGS}
              selectedTags={formData.weaknesses}
              onChange={(tags) => setFormData({ ...formData, weaknesses: tags })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-600">Descrição</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800 resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save className="w-5 h-5" />
                Atualizar Pokémon
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
