"use client";

import { useEffect, useState } from "react";
import { CreateAIAgentModal } from "@/components/ai-agents/CreateAIAgentModal";
import { AIAgentCard } from "@/components/ai-agents/AIAgentCard";
import { Sparkles } from "lucide-react";

export default function AIAgentsPage() {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch('/api/ai/agents');
            if (response.ok) {
                const data = await response.json();
                setAgents(data);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAgentCreated = (newAgent: any) => {
        setAgents([newAgent, ...agents]);
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-blue-500" />
                        AI Agents
                    </h2>
                    <p className="text-muted-foreground">
                        Create and manage intelligent agents for your WhatsApp instances.
                    </p>
                </div>
                <CreateAIAgentModal onAgentCreated={handleAgentCreated} />
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[200px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {agents.map((agent) => (
                        <AIAgentCard key={agent.id} agent={agent} />
                    ))}
                    {agents.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                                <Sparkles className="h-8 w-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold">No AI Agents yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                Create your first AI agent to start automating your conversations with intelligent responses.
                            </p>
                            <CreateAIAgentModal onAgentCreated={handleAgentCreated} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
