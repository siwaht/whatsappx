import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
    message: {
        id: string;
        content: string;
        sender: "me" | "other";
        timestamp: Date;
        status: "sent" | "delivered" | "read";
    };
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isMe = message.sender === "me";

    return (
        <div
            className={cn(
                "flex w-full mb-4",
                isMe ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2 text-sm",
                    isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                )}
            >
                <p>{message.content}</p>
                <div
                    className={cn(
                        "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                        isMe ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                >
                    {format(message.timestamp, "HH:mm")}
                    {isMe && (
                        <span>
                            {message.status === "read" && "✓✓"}
                            {message.status === "delivered" && "✓✓"}
                            {message.status === "sent" && "✓"}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
