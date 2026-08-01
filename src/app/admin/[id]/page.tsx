"use client";

import { useState, useEffect } from 'react';
import { getPokemonAction, updatePokemonAction } from '@/app/actions/pokemonActions';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { role, session, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    weaknesses: '',
    image_url: ''
  });

  useEffect(() => {
    async function loadPokemon() {
      try {
        const result = await getPokemonAction(session!.access_token, id);
        if (!result.success || !result.data) throw new Error(result.message);
        const data = result.data;
        setFormData({
          name: data.name || '',
          type: data.type || '',
          description: data.description || '',
          weaknesses: data.weaknesses ? data.weaknesses.join(', ') : '',
          image_url: data.image_url || ''
        });
      } catch (error) {
        setError('Não foi possível carregar os dados deste Pokémon.');
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    if (id && session?.access_token && (role === 'admin' || role === 'superadmin')) {
      loadPokemon();
    }
  }, [id, session, role]);

  useEffect(() => {
    if (!authLoading && role !== 'admin' && role !== 'superadmin') {
      router.push('/login');
    }
  }, [authLoading, role, router]);

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
        weaknesses: formData.weaknesses.split(',').map(w => w.trim()).filter(w => w),
      };
      
      const result = await updatePokemonAction(session?.access_token ?? '', id, pokemonData);
      if (!result.success) throw new Error(result.message);
      router.push('/');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar pokémon.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (role !== 'admin' && role !== 'superadmin') || initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#59F7E2] mb-4" />
        <p className="text-slate-500">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-soft">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Home
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Editar Pokémon</h1>
        <p className="text-slate-500 mt-2">Atualize as informações do seu Pokémon.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-soft">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-600">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="type" className="text-sm font-medium text-slate-600">Tipo</label>
              <input
                type="text"
                id="type"
                name="type"
                required
                placeholder="Ex: Fogo, Água"
                className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
                value={formData.type}
                onChange={handleChange}
              />
            </div>
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
            <label htmlFor="weaknesses" className="text-sm font-medium text-slate-600">Fraquezas (separadas por vírgula)</label>
            <input
              type="text"
              id="weaknesses"
              name="weaknesses"
              placeholder="Ex: Água, Terra, Pedra"
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={formData.weaknesses}
              onChange={handleChange}
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
            {loading ? 'Atualizando...' : (
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
