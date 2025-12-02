'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSearchParams } from 'next/navigation';

export default function ConversationsPage() {
    const searchParams = useSearchParams();
    const instanceName = searchParams.get('instance') || 'main';
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const queryClient = useQueryClient();

    // Fetch conversations
    const { data: conversations, isLoading: loadingChats } = useQuery({
        queryKey: ['conversations', instanceName],
        queryFn: async () => {
            const res = await axios.get(`/api/conversations?instance=${instanceName}`);
            return res.data.map((c: any) => ({
                id: c.remoteJid,
                conversationId: c.id,
                name: c.contact?.name || c.contact?.pushName || c.remoteJid.split('@')[0],
                profilePictureUrl: c.contact?.profilePicUrl,
                unreadCount: c.unreadCount,
                lastMessage: { message: { conversation: c.lastMessage } },
                conversationTimestamp: c.lastMessageAt ? new Date(c.lastMessageAt).getTime() / 1000 : Date.now() / 1000,
            }));
        },
        refetchInterval: 5000,
    });

    // Fetch messages for selected chat
    const { data: messages, isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', selectedChat?.id],
        queryFn: async () => {
            if (!selectedChat?.id) return [];
            const conv = conversations?.find((c: any) => c.id === selectedChat.id);
            if (!conv?.conversationId) return [];

            const res = await axios.get(`/api/messages?conversationId=${conv.conversationId}`);
            return res.data.map((m: any) => ({
                key: { id: m.keyId, fromMe: m.fromMe, remoteJid: m.remoteJid },
                message: { conversation: m.content },
                messageTimestamp: new Date(m.timestamp).getTime() / 1000,
            }));
        },
        enabled: !!selectedChat?.id && !!conversations,
        refetchInterval: 3000,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async (text: string) => {
            const conv = conversations?.find((c: any) => c.id === selectedChat.id);
            if (!conv) throw new Error("Conversation not found");

            await axios.post('/api/messages', {
                instanceName,
                remoteJid: selectedChat.id,
                content: text,
                conversationId: conv.conversationId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', selectedChat?.id] });
            queryClient.invalidateQueries({ queryKey: ['conversations', instanceName] });
        }
    });

    const handleSendMessage = (text: string) => {
        sendMessageMutation.mutate(text);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <ChatSidebar
                chats={conversations || []}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                loading={loadingChats}
            />
            <ChatWindow
                chat={selectedChat}
                messages={messages || []}
                onSendMessage={handleSendMessage}
                loading={loadingMessages}
            />
        </div>
    );
}
