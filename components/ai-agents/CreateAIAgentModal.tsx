"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

interface CreateAIAgentModalProps {
    onAgentCreated: (agent: any) => void;
}

export const CreateAIAgentModal = ({ onAgentCreated }: CreateAIAgentModalProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        systemPrompt: "",
        model: "gpt-4o",
        temperature: 0.7,
        isActive: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ai/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create agent');
            }

            const newAgent = await response.json();
            onAgentCreated(newAgent);

            toast({
                title: "Success",
                description: "AI Agent created successfully",
            });

            setOpen(false);
            setFormData({
                name: "",
                systemPrompt: "",
                model: "gpt-4o",
                temperature: 0.7,
                isActive: true,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create agent",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02]">
                    <Plus className="mr-2 h-4 w-4" />
                    Create AI Agent
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                            Create AI Agent
                        </DialogTitle>
                        <DialogDescription>
                            Configure a new AI agent with a specific personality and capabilities.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Customer Support Bot"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-gray-50 dark:bg-gray-800/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="systemPrompt">System Prompt</Label>
                            <Textarea
                                id="systemPrompt"
                                placeholder="You are a helpful assistant..."
                                value={formData.systemPrompt}
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                required
                                className="min-h-[150px] bg-gray-50 dark:bg-gray-800/50 font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Define the agent's personality, rules, and knowledge base.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="bg-gray-50 dark:bg-gray-800/50"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="temperature">Temperature (0.0 - 1.0)</Label>
                                <Input
                                    id="temperature"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={formData.temperature}
                                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                    className="bg-gray-50 dark:bg-gray-800/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable or disable this agent immediately
                                </p>
                            </div>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Creating..." : "Create Agent"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
