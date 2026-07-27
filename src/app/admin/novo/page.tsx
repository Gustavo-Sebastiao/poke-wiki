"use client";

import { useState, useEffect } from 'react';
import { createPokemon } from '@/lib/pokemonService';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import TagSelector, { POKEMON_TAGS } from '@/components/TagSelector';

export default function NovoPokemonPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }
  
  const [formData, setFormData] = useState({
    name: '',
    type: [] as string[],
    description: '',
    weaknesses: [] as string[],
    image_url: ''
  });

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
      
      await createPokemon(pokemonData);
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar pokémon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 bg-white px-4 py-2 rounded-2xl shadow-sm hover:shadow-soft">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Painel
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Cadastrar Pokémon</h1>
        <p className="text-slate-500 mt-2">Adicione um novo Pokémon ao banco de dados da Pokewiki.</p>
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
              <label className="text-sm font-medium text-slate-600">Tipo (Máx. 2)</label>
              <TagSelector 
                options={POKEMON_TAGS}
                selectedTags={formData.type}
                onChange={(tags) => setFormData({ ...formData, type: tags })}
                limit={2}
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
                Salvar Pokémon
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
