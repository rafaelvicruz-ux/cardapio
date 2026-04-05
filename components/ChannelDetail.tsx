'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Channel, Post } from '@/lib/types';
import PostGrid from './PostGrid';

interface Props {
  channel: Channel;
  onBack: () => void;
  user: any;
}

export default function ChannelDetail({ channel, onBack, user }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [channel]);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('channel_id', channel.id)
      .order('created_at', { ascending: false });

    if (!error) setPosts(data || []);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile || !title) return;
    setLoading(true);
    
    try {
      const fileName = `${Date.now()}-${mediaFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('posts-media')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          channel_id: channel.id,
          title,
          description,
          media_type: mediaType,
          media_url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      setTitle('');
      setDescription('');
      setMediaFile(null);
      loadPosts();
    } catch (err) {
      console.error('Erro ao criar post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-black/50 backdrop-blur-md border-b border-white/10 p-6">
        <button onClick={onBack} className="text-white mb-4 font-semibold hover:text-gray-300">
          ← Voltar para meus canais
        </button>
        <h2 className="text-3xl font-bold text-white">{channel.name}</h2>
        <p className="text-gray-300 mt-2">{channel.description}</p>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">➕ Criar novo post</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value as 'image' | 'video')} className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700">
                <option value="imagem">Imagem</option>
                <option value="video">Vídeo</option>
              </select>
              <input type="file" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} accept={mediaType === 'imagem' ? 'image/*' : 'video/*'} className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" required />
            </div>
            <input type="text" placeholder="Título do post" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" required />
            <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700" />
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
              {loading ? 'Publicando...' : 'Publicar post'}
            </button>
          </form>
        </div>
        <PostGrid posts={posts} onPostDeleted={loadPosts} />
      </div>
    </div>
  );
}