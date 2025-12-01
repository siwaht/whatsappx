"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, MoreVertical, Phone, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
    chats: any[];
    selectedChat: any;
    onSelectChat: (chat: any) => void;
    loading: boolean;
}

export const ChatSidebar = ({ chats, selectedChat, onSelectChat, loading }: ChatSidebarProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChats = chats.filter(chat =>
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.id.includes(searchQuery)
    );

    return (
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <div className="flex gap-2">
                        <MessageSquare className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                        <MoreVertical className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 bg-gray-50 dark:bg-gray-800/50 border-none focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat)}
                                className={cn(
                                    "flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-left relative",
                                    selectedChat?.id === chat.id && "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                )}
                            >
                                <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-900 shadow-sm">
                                    <AvatarImage src={chat.profilePictureUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                        {chat.name?.substring(0, 2).toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold truncate text-sm">
                                            {chat.name || chat.id.split('@')[0]}
                                        </span>
                                        {chat.conversationTimestamp && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(chat.conversationTimestamp * 1000), { addSuffix: false }).replace('about ', '')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                            {chat.lastMessage?.message?.conversation || "Image/Media"}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-green-500 hover:bg-green-600">
                                                {chat.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
