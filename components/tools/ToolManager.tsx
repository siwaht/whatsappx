"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit, Plug, Webhook, CheckCircle2, XCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function ToolManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<any>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("WEBHOOK");

    // Structured inputs
    const [webhookUrl, setWebhookUrl] = useState("");
    const [webhookHeaders, setWebhookHeaders] = useState("{}");
    const [mcpServerUrl, setMcpServerUrl] = useState("");

    // Testing state
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    const queryClient = useQueryClient();

    const { data: tools, isLoading } = useQuery({
        queryKey: ['tools'],
        queryFn: async () => {
            const res = await axios.get('/api/tools');
            return res.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingTool) {
                return axios.patch(`/api/tools/${editingTool.id}`, data);
            } else {
                return axios.post('/api/tools', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            setIsDialogOpen(false);
            resetForm();
            toast.success(editingTool ? "Tool updated" : "Tool created");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to save tool");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return axios.delete(`/api/tools/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            toast.success("Tool deleted");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to delete tool");
        }
    });

    const resetForm = () => {
        setEditingTool(null);
        setName("");
        setDescription("");
        setType("WEBHOOK");
        setWebhookUrl("");
        setWebhookHeaders("{}");
        setMcpServerUrl("");
        setTestResult(null);
    };

    const handleEdit = (tool: any) => {
        setEditingTool(tool);
        setName(tool.name);
        setDescription(tool.description || "");
        setType(tool.type);
        setTestResult(null);

        if (tool.type === 'WEBHOOK') {
            setWebhookUrl(tool.config.url || "");
            setWebhookHeaders(JSON.stringify(tool.config.headers || {}, null, 2));
        } else if (tool.type === 'MCP') {
            setMcpServerUrl(tool.config.serverUrl || "");
        }

        setIsDialogOpen(true);
    };

    const getConfig = () => {
        if (type === 'WEBHOOK') {
            try {
                const headers = JSON.parse(webhookHeaders);
                return { url: webhookUrl, headers };
            } catch (e) {
                throw new Error("Invalid Headers JSON");
            }
        } else {
            return { serverUrl: mcpServerUrl };
        }
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const config = getConfig();
            const response = await axios.post('/api/tools/test', { type, config });

            if (response.data.success) {
                setTestResult('success');
                toast.success(response.data.message);
            }
        } catch (error: any) {
            setTestResult('error');
            toast.error(error.response?.data?.error || error.message || "Test failed");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = () => {
        try {
            const config = getConfig();
            mutation.mutate({
                name,
                description,
                type,
                config
            });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tool
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingTool ? 'Edit Tool' : 'Create New Tool'}</DialogTitle>
                            <DialogDescription>
                                Configure a Webhook or MCP connection.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Tool" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={(val) => { setType(val); setTestResult(null); }}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WEBHOOK">Webhook</SelectItem>
                                        <SelectItem value="MCP">MCP Client</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                            </div>

                            <div className="border-t pt-4 mt-2">
                                <h4 className="text-sm font-medium mb-3">Configuration</h4>

                                {type === 'WEBHOOK' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="webhookUrl">Webhook URL</Label>
                                            <Input
                                                id="webhookUrl"
                                                value={webhookUrl}
                                                onChange={(e) => setWebhookUrl(e.target.value)}
                                                placeholder="https://api.example.com/webhook"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="webhookHeaders">Headers (JSON)</Label>
                                            <Textarea
                                                id="webhookHeaders"
                                                value={webhookHeaders}
                                                onChange={(e) => setWebhookHeaders(e.target.value)}
                                                className="font-mono text-sm h-24"
                                                placeholder='{ "Authorization": "Bearer token" }'
                                            />
                                        </div>
                                    </div>
                                )}

                                {type === 'MCP' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mcpServerUrl">MCP Server URL</Label>
                                            <Input
                                                id="mcpServerUrl"
                                                value={mcpServerUrl}
                                                onChange={(e) => setMcpServerUrl(e.target.value)}
                                                placeholder="http://localhost:3000/sse"
                                            />
                                            <p className="text-[0.8rem] text-muted-foreground">
                                                The URL of the MCP server's SSE endpoint.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTest}
                                    disabled={isTesting || (type === 'WEBHOOK' && !webhookUrl) || (type === 'MCP' && !mcpServerUrl)}
                                >
                                    {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Test Connection
                                </Button>
                                {testResult === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                {testResult === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                            </div>
                            <Button onClick={handleSubmit} disabled={mutation.isPending || !name}>
                                {mutation.isPending ? "Saving..." : "Save Tool"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border glass-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Config Summary</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tools?.map((tool: any) => (
                            <TableRow key={tool.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    {tool.type === 'WEBHOOK' ? <Webhook className="h-4 w-4 text-blue-500" /> : <Plug className="h-4 w-4 text-green-500" />}
                                    {tool.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </TableCell>
                                <TableCell>{tool.description}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {tool.type === 'WEBHOOK' ? tool.config.url : tool.config.serverUrl}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => {
                                            if (confirm('Delete this tool?')) deleteMutation.mutate(tool.id);
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tools?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No tools found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

