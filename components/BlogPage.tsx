'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Channel } from '@/lib/types';
import ChannelGrid from './ChannelGrid';
import ChannelDetail from './ChannelDetail';
import ModalCreateChannel from './ModalCreateChannel';

export default function BlogPage({ user }: { user: any }) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChannels();
    }, [user]);

    const loadChannels = async () => {
        try {
            const { data, error } = await supabase
                .from('channels')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            setChannels(data || []);
        } catch (err) {
            console.error('Erro ao carregar canais:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen">
            {!selectedChannel ? (
                <>
                    <div className="bg-black/50 backdrop-blur-md border-b border-white/10 p-6">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-white">📺 Blog de Canais</h1>
                            <div className="flex gap-4 items-center">
                                <span className="text-gray-300">{user.email}</span>
                                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"> Sair </button>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto p-6">
                        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 mb-8"> ➕ Criar novo canal </button>
                        <ChannelGrid channels={channels} onSelectChannel={setSelectedChannel} />
                    </div>
                    {showModal && (
                        <ModalCreateChannel onClose={() => setShowModal(false)} onChannelCreated={() => { setShowModal(false); loadChannels(); }} user={user} />
                    )}
                </>
            ) : (
                <ChannelDetail channel={selectedChannel} onBack={() => setSelectedChannel(null)} user={user} />
            )}
        </div>
    );
}