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
import { Loader2, Plus, Trash2, Edit, Plug, Webhook, CheckCircle2, XCircle, Play, Eye, EyeOff, Terminal, Globe } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface KeyValuePair {
    key: string;
    value: string;
    isVisible?: boolean;
}

interface SchemaParam {
    name: string;
    type: string;
    description: string;
    required: boolean;
}

export function ToolManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<any>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("WEBHOOK");

    // Webhook specific
    const [webhookUrl, setWebhookUrl] = useState("");
    const [headers, setHeaders] = useState<KeyValuePair[]>([]);

    // MCP specific
    const [mcpConnectionType, setMcpConnectionType] = useState<'HTTP' | 'STDIO'>('HTTP');
    const [mcpServerUrl, setMcpServerUrl] = useState("");
    const [mcpCommand, setMcpCommand] = useState("");
    const [mcpArgs, setMcpArgs] = useState(""); // Stored as newline separated string for UI
    const [mcpEnv, setMcpEnv] = useState<KeyValuePair[]>([]);

    // MCP Auth (HTTP only)
    const [mcpAuthType, setMcpAuthType] = useState<'NONE' | 'BEARER' | 'API_KEY'>('NONE');
    const [mcpApiKey, setMcpApiKey] = useState("");

    // Schema Builder
    const [schemaParams, setSchemaParams] = useState<SchemaParam[]>([]);

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
        setHeaders([]);

        setMcpConnectionType("HTTP");
        setMcpServerUrl("");
        setMcpCommand("");
        setMcpArgs("");
        setMcpEnv([]);
        setMcpAuthType("NONE");
        setMcpApiKey("");

        setSchemaParams([]);
        setTestResult(null);
    };

    const handleEdit = (tool: any) => {
        setEditingTool(tool);
        setName(tool.name);
        setDescription(tool.description || "");
        setType(tool.type);
        setTestResult(null);

        // Parse Config
        const config = tool.config || {};

        // Parse Schema
        if (config.schema && config.schema.properties) {
            const parsed: SchemaParam[] = Object.keys(config.schema.properties).map(key => ({
                name: key,
                type: config.schema.properties[key].type,
                description: config.schema.properties[key].description || "",
                required: (config.schema.required || []).includes(key)
            }));
            setSchemaParams(parsed);
        } else {
            setSchemaParams([]);
        }

        if (tool.type === 'WEBHOOK') {
            setWebhookUrl(config.url || "");
            const configHeaders = config.headers || {};
            const headerPairs = Object.entries(configHeaders).map(([key, value]) => ({
                key,
                value: value as string,
                isVisible: false
            }));
            setHeaders(headerPairs);
        } else if (tool.type === 'MCP') {
            if (config.command) {
                setMcpConnectionType("STDIO");
                setMcpCommand(config.command);
                setMcpArgs((config.args || []).join('\n'));

                const envObj = config.env || {};
                const envPairs = Object.entries(envObj).map(([key, value]) => ({
                    key,
                    value: value as string,
                    isVisible: false
                }));
                setMcpEnv(envPairs);
            } else {
                setMcpConnectionType("HTTP");
                setMcpServerUrl(config.serverUrl || "");

                // Parse Auth from headers
                const authHeaders = config.headers || {};
                if (authHeaders['Authorization']) {
                    setMcpAuthType('BEARER');
                    setMcpApiKey(authHeaders['Authorization'].replace('Bearer ', ''));
                } else if (authHeaders['x-api-key']) {
                    setMcpAuthType('API_KEY');
                    setMcpApiKey(authHeaders['x-api-key']);
                } else {
                    setMcpAuthType('NONE');
                    setMcpApiKey("");
                }
            }
        }

        setIsDialogOpen(true);
    };

    // Generic Key-Value Builder
    const KeyValueBuilder = ({
        items,
        setItems,
        label,
        keyPlaceholder = "Key",
        valuePlaceholder = "Value",
        isSecret = true
    }: {
        items: KeyValuePair[],
        setItems: (items: KeyValuePair[]) => void,
        label: string,
        keyPlaceholder?: string,
        valuePlaceholder?: string,
        isSecret?: boolean
    }) => {
        const addItem = () => setItems([...items, { key: '', value: '', isVisible: false }]);
        const removeItem = (index: number) => {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        };
        const updateItem = (index: number, field: 'key' | 'value', newValue: string) => {
            const newItems = [...items];
            newItems[index][field] = newValue;
            setItems(newItems);
        };
        const toggleVisibility = (index: number) => {
            const newItems = [...items];
            newItems[index].isVisible = !newItems[index].isVisible;
            setItems(newItems);
        };

        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <Input
                                placeholder={keyPlaceholder}
                                value={item.key}
                                onChange={(e) => updateItem(index, 'key', e.target.value)}
                                className="flex-1"
                            />
                            <div className="flex-1 relative">
                                <Input
                                    type={isSecret && !item.isVisible ? "password" : "text"}
                                    placeholder={valuePlaceholder}
                                    value={item.value}
                                    onChange={(e) => updateItem(index, 'value', e.target.value)}
                                    className="pr-8"
                                />
                                {isSecret && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                                        onClick={() => toggleVisibility(index)}
                                    >
                                        {item.isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        className="w-full border-dashed"
                    >
                        <Plus className="h-3 w-3 mr-2" />
                        Add {label.slice(0, -1)}
                    </Button>
                </div>
            </div>
        );
    };

    const SchemaBuilder = () => {
        const addParam = () => setSchemaParams([...schemaParams, { name: '', type: 'string', description: '', required: false }]);
        const removeParam = (index: number) => {
            const newParams = [...schemaParams];
            newParams.splice(index, 1);
            setSchemaParams(newParams);
        };
        const updateParam = (index: number, field: keyof SchemaParam, value: any) => {
            const newParams = [...schemaParams];
            // @ts-ignore
            newParams[index][field] = value;
            setSchemaParams(newParams);
        };

        return (
            <div className="space-y-2 border rounded-md p-4 bg-muted/50">
                <Label className="flex items-center gap-2">
                    Input Parameters (JSON Schema)
                    <Badge variant="outline" className="text-[10px]">Optional</Badge>
                </Label>
                <p className="text-xs text-muted-foreground mb-4">
                    Define the parameters this tool accepts. Useful for AI Agents to understand structured inputs.
                </p>
                <div className="space-y-4">
                    {schemaParams.map((param, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-start bg-background p-2 rounded border">
                            <div className="col-span-3">
                                <Input
                                    placeholder="Name (e.g. email)"
                                    value={param.name}
                                    onChange={(e) => updateParam(index, 'name', e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="col-span-3">
                                <Select value={param.type} onValueChange={(val) => updateParam(index, 'type', val)}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="string">String</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                        <SelectItem value="object">Object</SelectItem>
                                        <SelectItem value="array">Array</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-4">
                                <Input
                                    placeholder="Description..."
                                    value={param.description}
                                    onChange={(e) => updateParam(index, 'description', e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="col-span-1 flex items-center justify-center h-8">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={param.required}
                                        onChange={(e) => updateParam(index, 'required', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                        title="Required?"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeParam(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addParam} className="w-full border-dashed">
                        <Plus className="h-3 w-3 mr-2" /> Add Parameter
                    </Button>
                </div>
            </div>
        );
    };

    const MCPAuthSelector = () => {
        if (mcpConnectionType === 'STDIO') return null;

        return (
            <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                <Label>Authentication</Label>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <Select value={mcpAuthType} onValueChange={(val: any) => setMcpAuthType(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">None</SelectItem>
                                <SelectItem value="BEARER">Bearer Token</SelectItem>
                                <SelectItem value="API_KEY">X-API-Key</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder={mcpAuthType === 'NONE' ? "No auth required" : "Enter Key/Token"}
                                value={mcpApiKey}
                                onChange={(e) => setMcpApiKey(e.target.value)}
                                disabled={mcpAuthType === 'NONE'}
                                className="pr-10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getConfig = () => {
        // Schema Generation
        const schema = {
            type: "object",
            properties: {} as any,
            required: [] as string[]
        };

        schemaParams.forEach(p => {
            if (p.name) {
                schema.properties[p.name] = {
                    type: p.type,
                    description: p.description
                };
                if (p.required) {
                    schema.required.push(p.name);
                }
            }
        });

        // Webhook Config
        if (type === 'WEBHOOK') {
            const headersObj: Record<string, string> = {};
            headers.forEach(h => { if (h.key.trim()) headersObj[h.key.trim()] = h.value; });
            return { url: webhookUrl, headers: headersObj, schema };
        }

        // MCP Config
        if (type === 'MCP') {
            if (mcpConnectionType === 'STDIO') {
                const envObj: Record<string, string> = {};
                mcpEnv.forEach(e => { if (e.key.trim()) envObj[e.key.trim()] = e.value; });

                return {
                    connectionType: 'STDIO',
                    command: mcpCommand,
                    args: mcpArgs.split('\n').filter(a => a.trim() !== ''),
                    env: envObj,
                    schema
                };
            } else {
                const headersObj: Record<string, string> = {};
                if (mcpAuthType === 'BEARER' && mcpApiKey) {
                    headersObj['Authorization'] = `Bearer ${mcpApiKey}`;
                } else if (mcpAuthType === 'API_KEY' && mcpApiKey) {
                    headersObj['x-api-key'] = mcpApiKey;
                }

                return {
                    connectionType: 'HTTP',
                    serverUrl: mcpServerUrl,
                    headers: headersObj,
                    schema
                };
            }
        }

        return {};
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
                    <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTool ? 'Edit Tool' : 'Create New Tool'}</DialogTitle>
                            <DialogDescription>
                                Configure a Webhook or MCP connection.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                            <SelectItem value="WEBHOOK">Webhook (HTTP)</SelectItem>
                                            <SelectItem value="MCP">MCP Client</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                                    {type === 'WEBHOOK' ? <Globe className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
                                    Configuration
                                </h4>

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
                                        <KeyValueBuilder
                                            items={headers}
                                            setItems={setHeaders}
                                            label="Headers"
                                            keyPlaceholder="Header Name (e.g. Authorization)"
                                        />
                                    </div>
                                )}

                                {type === 'MCP' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <div className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mcpConnectionType === 'HTTP' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`} onClick={() => setMcpConnectionType('HTTP')}>
                                                HTTP (SSE)
                                            </div>
                                            <div className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mcpConnectionType === 'STDIO' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`} onClick={() => setMcpConnectionType('STDIO')}>
                                                Stdio (Local)
                                            </div>
                                        </div>

                                        {mcpConnectionType === 'HTTP' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mcpServerUrl">MCP Server URL</Label>
                                                    <Input
                                                        id="mcpServerUrl"
                                                        value={mcpServerUrl}
                                                        onChange={(e) => setMcpServerUrl(e.target.value)}
                                                        placeholder="http://localhost:3000/sse"
                                                    />
                                                </div>
                                                <MCPAuthSelector />
                                            </>
                                        )}

                                        {mcpConnectionType === 'STDIO' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mcpCommand">Command</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Terminal className="h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="mcpCommand"
                                                            value={mcpCommand}
                                                            onChange={(e) => setMcpCommand(e.target.value)}
                                                            placeholder="npx, python, node..."
                                                            className="font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mcpArgs">Arguments (One per line)</Label>
                                                    <Textarea
                                                        id="mcpArgs"
                                                        value={mcpArgs}
                                                        onChange={(e) => setMcpArgs(e.target.value)}
                                                        placeholder="-y&#10;@modelcontextprotocol/server-filesystem&#10;/path/to/directory"
                                                        className="font-mono min-h-[100px]"
                                                    />
                                                </div>
                                                <KeyValueBuilder
                                                    items={mcpEnv}
                                                    setItems={setMcpEnv}
                                                    label="Environment Variables"
                                                    keyPlaceholder="VAR_NAME"
                                                    valuePlaceholder="Value"
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <SchemaBuilder />
                            </div>

                        </div>
                        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTest}
                                    disabled={isTesting || (type === 'WEBHOOK' && !webhookUrl) || (type === 'MCP' && (mcpConnectionType === 'HTTP' ? !mcpServerUrl : !mcpCommand))}
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
                                    {tool.type === 'WEBHOOK' ? <Globe className="h-4 w-4 text-blue-500" /> : <Plug className="h-4 w-4 text-green-500" />}
                                    {tool.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </TableCell>
                                <TableCell>{tool.description}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground max-w-[300px] truncate">
                                    {tool.type === 'WEBHOOK' ? tool.config.url : (tool.config.command ? `${tool.config.command} ${(tool.config.args || []).join(' ')}` : tool.config.serverUrl)}
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
