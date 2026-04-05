'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  onClose: () => void;
  onChannelCreated: () => void;
  user: any;
}

export default function ModalCreateChannel({ onClose, onChannelCreated, user }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      let coverUrl = null;
      if (coverFile) {
        const fileName = `${Date.now()}-${coverFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('channel-covers')
          .upload(fileName, coverFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('channel-covers')
            .getPublicUrl(fileName);
          coverUrl = data.publicUrl;
        }
      }

      const { error } = await supabase
        .from('channels')
        .insert({ user_id: user.id, name, description, cover_image: coverUrl });

      if (error) throw error;
      onChannelCreated();
    } catch (err) {
      console.error('Erro ao criar canal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Criar novo canal</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input type="text" placeholder="Nome do canal" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500" required />
          <textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500" />
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border rounded-lg" />
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
              {loading ? 'Criando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}