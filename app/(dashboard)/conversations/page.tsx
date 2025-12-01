"use client";

import { useEffect, useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useInstancesStore } from "@/lib/store/instances";
import { Loader2 } from "lucide-react";

export default function ConversationsPage() {
    const { instances } = useInstancesStore();
    const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Auto-select first instance if available
    useEffect(() => {
        if (instances.length > 0 && !selectedInstance) {
            setSelectedInstance(instances[0].instanceName);
        }
    }, [instances, selectedInstance]);

    // Fetch chats when instance changes
    useEffect(() => {
        if (selectedInstance) {
            fetchChats(selectedInstance);
        }
    }, [selectedInstance]);

    // Fetch messages when chat is selected
    useEffect(() => {
        if (selectedInstance && selectedChat) {
            fetchMessages(selectedInstance, selectedChat.id);
        }
    }, [selectedInstance, selectedChat]);

    const fetchChats = async (instanceName: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/chat/${instanceName}/chats`);
            if (response.ok) {
                const data = await response.json();
                setChats(data);
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (instanceName: string, remoteJid: string) => {
        try {
            const response = await fetch(`/api/chat/${instanceName}/messages?remoteJid=${remoteJid}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.reverse()); // Usually messages come newest first
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!selectedInstance || !selectedChat) return;

        setSending(true);
        try {
            const response = await fetch(`/api/chat/${selectedInstance}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: selectedChat.id.replace('@s.whatsapp.net', ''),
                    text,
                }),
            });

            if (response.ok) {
                const newMessage = await response.json();
                // Optimistically add message
                setMessages(prev => [...prev, {
                    key: { fromMe: true, id: Date.now().toString() },
                    message: { conversation: text },
                    messageTimestamp: Date.now() / 1000
                }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    if (instances.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">No Instances Connected</h2>
                    <p className="text-muted-foreground">Please connect a WhatsApp instance to start chatting.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            <ChatSidebar
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                loading={loading}
            />
            <ChatWindow
                chat={selectedChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={sending}
            />
        </div>
    );
}
