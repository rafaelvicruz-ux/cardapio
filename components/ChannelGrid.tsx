'use client';
import { Channel } from '@/lib/types';

interface Props {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

export default function ChannelGrid({ channels, onSelectChannel }: Props) {
  if (channels.length === 0) {
    return (
      <div className="text-center py-16 text-gray-300">
        <p className="text-xl">🎬 Nenhum canal ainda. Crie o primeiro acima!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {channels.map((channel) => (
        <div key={channel.id} onClick={() => onSelectChannel(channel)} className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            {channel.cover_image ? (
              <img src={channel.cover_image} alt={channel.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📺</span>
            )}
          </div>
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{channel.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{channel.description || 'Sem descrição'}</p>
            <div className="text-purple-600 font-semibold text-sm">📹 Posts</div>
          </div>
        </div>
      ))}
    </div>
  );
}