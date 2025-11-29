import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
    conversationId: string;
}

// Mock data
const messages = [
    {
        id: "1",
        content: "Hey, how are you?",
        sender: "other" as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: "read" as const,
    },
    {
        id: "2",
        content: "I'm doing great, thanks! How about you?",
        sender: "me" as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: "read" as const,
    },
    {
        id: "3",
        content: "Pretty good. Just working on this new project.",
        sender: "other" as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: "read" as const,
    },
];

export const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const handleSendMessage = (content: string) => {
        // TODO: Implement message sending logic
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-medium">Alice Johnson</h3>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Video className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            {/* Input */}
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};
