"use client";

import { useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";

export const ChatLayout = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <div className="w-80 border-r bg-background">
                <ConversationList
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={setSelectedConversationId}
                />
            </div>
            <div className="flex-1">
                {selectedConversationId ? (
                    <ChatWindow conversationId={selectedConversationId} />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};
