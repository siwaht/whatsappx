"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile, Mic, Image as ImageIcon } from "lucide-react";

interface MessageInputProps {
    onSendMessage: (text: string) => void;
    loading?: boolean;
}

export const MessageInput = ({ onSendMessage, loading }: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !loading) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <form onSubmit={handleSend} className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                    <Smile className="h-5 w-5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

                <div className="flex-1 relative">
                    <Input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="pr-10 bg-gray-50 dark:bg-gray-800/50 border-none focus-visible:ring-1 rounded-full py-6"
                        disabled={loading}
                    />
                </div>

                {message.trim() ? (
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105"
                        disabled={loading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                )}
            </form>
        </div>
    );
};
