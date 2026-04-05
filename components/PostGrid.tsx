'use client';
import { Post } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface Props {
  posts: Post[];
  onPostDeleted: () => void;
}

export default function PostGrid({ posts, onPostDeleted }: Props) {
  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) onPostDeleted();
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-300">
        <p className="text-lg">📭 Nenhum post ainda. Crie o primeiro acima!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
          {post.media_type === 'image' ? (
            <img src={post.media_url} alt={post.title} className="w-full h-48 object-cover" />
          ) : (
            <video src={post.media_url} controls className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h4>
            <p className="text-gray-600 text-sm mb-3">{post.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500"> 📅 {new Date(post.created_at).toLocaleDateString()} </span>
              <button onClick={() => handleDelete(post.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold">
                🗑️ Deletar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}