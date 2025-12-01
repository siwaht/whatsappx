"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Settings, Power, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AIAgent {
    id: number;
    name: string;
    model: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AIAgentCardProps {
    agent: AIAgent;
}

export const AIAgentCard = ({ agent }: AIAgentCardProps) => {
    return (
        <Card className="group relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Bot className="h-5 w-5" />
                    </div>
                    {agent.name}
                </CardTitle>
                <Badge variant={agent.isActive ? "default" : "secondary"} className={agent.isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                    {agent.isActive ? "Active" : "Inactive"}
                </Badge>
            </CardHeader>

            <CardContent>
                <div className="grid gap-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center justify-between">
                        <span>Model</span>
                        <span className="font-medium text-foreground">{agent.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Created</span>
                        <span>{formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                </Button>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <Power className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
