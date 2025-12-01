"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical, Search } from "lucide-react";
import { MessageInput } from "./MessageInput";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatWindowProps {
    chat: any;
    messages: any[];
    onSendMessage: (text: string) => void;
    loading: boolean;
    currentUserId?: string; // To identify 'fromMe'
}

export const ChatWindow = ({ chat, messages, onSendMessage, loading, currentUserId }: ChatWindowProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <span className="text-4xl">👋</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Select a chat to start messaging
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Choose a conversation from the sidebar or start a new one to connect with your contacts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative">
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                        <AvatarImage src={chat.profilePictureUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {chat.name?.substring(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">{chat.name || chat.id.split('@')[0]}</h3>
                        <p className="text-xs text-muted-foreground">
                            {chat.presence === 'available' ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg, index) => {
                    const isMe = msg.key?.fromMe;
                    return (
                        <div
                            key={msg.key?.id || index}
                            className={cn(
                                "flex w-full",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[65%] rounded-2xl px-4 py-2 shadow-sm relative group",
                                    isMe
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
                                )}
                            >
                                <p className="text-sm leading-relaxed">
                                    {msg.message?.conversation ||
                                        msg.message?.extendedTextMessage?.text ||
                                        "Media message"}
                                </p>
                                <span className={cn(
                                    "text-[10px] absolute bottom-1 right-3 opacity-70",
                                    isMe ? "text-blue-100" : "text-gray-500"
                                )}>
                                    {format(new Date(msg.messageTimestamp * 1000), 'HH:mm')}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <MessageInput onSendMessage={onSendMessage} loading={loading} />
        </div>
    );
};
