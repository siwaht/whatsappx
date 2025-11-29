import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface ConversationListProps {
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
}

// Mock data
const conversations = [
    {
        id: "1",
        name: "Alice Johnson",
        lastMessage: "Hey, how are you?",
        timestamp: "10:30 AM",
        unreadCount: 2,
        avatar: "",
    },
    {
        id: "2",
        name: "Bob Smith",
        lastMessage: "Can we meet tomorrow?",
        timestamp: "Yesterday",
        unreadCount: 0,
        avatar: "",
    },
    {
        id: "3",
        name: "Team Project",
        lastMessage: "Meeting at 3 PM",
        timestamp: "Yesterday",
        unreadCount: 5,
        avatar: "",
        isGroup: true,
    },
];

export const ConversationList = ({
    selectedConversationId,
    onSelectConversation,
}: ConversationListProps) => {
    return (
        <div className="flex h-full flex-col">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search chats..." className="pl-8" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                    <button
                        key={conversation.id}
                        className={cn(
                            "flex w-full items-center gap-3 p-4 text-left hover:bg-accent transition-colors",
                            selectedConversationId === conversation.id && "bg-accent"
                        )}
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <Avatar>
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>
                                {conversation.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{conversation.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {conversation.timestamp}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                                {conversation.lastMessage}
                            </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {conversation.unreadCount}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
