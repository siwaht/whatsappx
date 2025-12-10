"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Database, Play, Key, Globe, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

interface Connection {
    id: string;
    platform: string;
    key: string;
    name?: string;
}

interface Action {
    title: string;
    key: string;
    method: string;
    description?: string;
}

export const KnowledgeBaseManager = () => {
    const [picaKey, setPicaKey] = useState("");
    const [connections, setConnections] = useState<Connection[]>([]);
    const [crawlerConnections, setCrawlerConnections] = useState<Connection[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<string>("");
    const [actions, setActions] = useState<Action[]>([]);
    const [selectedAction, setSelectedAction] = useState<string>("");
    const [params, setParams] = useState("{}");
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingActions, setLoadingActions] = useState(false);

    // Firecrawl specific state
    const [selectedCrawler, setSelectedCrawler] = useState<string>("");
    const [selectedVectorDB, setSelectedVectorDB] = useState<string>("");
    const [crawlUrl, setCrawlUrl] = useState<string>("");
    const [chunkSize, setChunkSize] = useState<number>(1000);
    const [chunkOverlap, setChunkOverlap] = useState<number>(200);

    // Text Upload specific state
    const [textInput, setTextInput] = useState<string>("");
    const [selectedTextTargetDB, setSelectedTextTargetDB] = useState<string>("");

    const { toast } = useToast();

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const headers = picaKey ? { 'x-pica-secret': picaKey } : {};
            const res = await axios.get('/api/pica/connections', { headers });

            // Separate Firecrawl connections from others (Databases, Tools, etc.)
            const crawlerConns = res.data.filter((c: Connection) => c.platform === 'firecrawl');
            setCrawlerConnections(crawlerConns);

            // Treat all other connections as generic "Database/Tool" connections
            // This allows any platform supported by PicaOS (MongoDB, Supabase, ElevenLabs, etc.) to be used
            const otherConns = res.data.filter((c: Connection) => c.platform !== 'firecrawl');
            setConnections(otherConns);

            if (otherConns.length === 0 && crawlerConns.length === 0) {
                toast({
                    title: "No Connections Found",
                    description: "Make sure you have connected a database or tool in PicaOS.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error fetching connections",
                description: error.response?.data?.error || error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedConnection) {
            const connection = connections.find(c => c.key === selectedConnection);
            if (connection) {
                fetchActions(connection.platform);
            }
        }
    }, [selectedConnection]);

    const fetchActions = async (platform: string) => {
        setLoadingActions(true);
        try {
            const headers = picaKey ? { 'x-pica-secret': picaKey } : {};
            const res = await axios.get(`/api/pica/actions?platform=${platform}`, { headers });
            setActions(res.data);
        } catch (error: any) {
            toast({
                title: "Error fetching actions",
                description: error.response?.data?.error || error.message,
                variant: "destructive"
            });
        } finally {
            setLoadingActions(false);
        }
    };

    const handleExecute = async () => {
        if (!selectedConnection || !selectedAction) return;

        setLoading(true);
        try {
            let parsedParams = {};
            try {
                parsedParams = JSON.parse(params);
            } catch (e) {
                toast({
                    title: "Invalid JSON",
                    description: "Please check your parameters JSON format.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const headers = picaKey ? { 'x-pica-secret': picaKey } : {};
            const res = await axios.post('/api/pica/execute', {
                connectionKey: selectedConnection,
                actionKey: selectedAction,
                params: parsedParams
            }, { headers });

            setResult(JSON.stringify(res.data, null, 2));
            toast({
                title: "Action Executed",
                description: "Operation completed successfully.",
            });
        } catch (error: any) {
            setResult(JSON.stringify(error.response?.data || error.message, null, 2));
            toast({
                title: "Execution Failed",
                description: error.response?.data?.error || error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCrawl = async () => {
        if (!selectedCrawler || !selectedVectorDB || !crawlUrl) {
            toast({
                title: "Missing Information",
                description: "Please select a crawler, a vector database, and enter a URL.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const headers = picaKey ? { 'x-pica-secret': picaKey } : {};
            // Assuming 'crawl' is the action key for Firecrawl and it takes 'url' and 'destination'
            // We might need to adjust this based on the actual PicaOS Firecrawl integration
            const res = await axios.post('/api/pica/execute', {
                connectionKey: selectedCrawler,
                actionKey: 'crawl', // This might need to be verified
                params: {
                    url: crawlUrl,
                    destination_connection_key: selectedVectorDB,
                    chunk_size: chunkSize,
                    chunk_overlap: chunkOverlap
                }
            }, { headers });

            setResult(JSON.stringify(res.data, null, 2));
            toast({
                title: "Crawl Started",
                description: "The crawling job has been submitted.",
            });
        } catch (error: any) {
            setResult(JSON.stringify(error.response?.data || error.message, null, 2));
            toast({
                title: "Crawl Failed",
                description: error.response?.data?.error || error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTextUpload = async () => {
        if (!selectedTextTargetDB || !textInput) {
            toast({
                title: "Missing Information",
                description: "Please select a target database and enter some text.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const headers = picaKey ? { 'x-pica-secret': picaKey } : {};
            // Using the target connection itself to execute the upload/insert action
            // We assume the action is 'insert' or 'upload' and it handles chunking if params are provided
            // Or we might need a specific 'text_splitter' tool if PicaOS separates them.
            // For now, assuming direct insert with chunking params supported by the connection's platform adapter.

            const res = await axios.post('/api/pica/execute', {
                connectionKey: selectedTextTargetDB,
                actionKey: 'insert_text', // Assuming a generic 'insert_text' or similar action exists or we map it
                params: {
                    text: textInput,
                    chunk_size: chunkSize,
                    chunk_overlap: chunkOverlap
                }
            }, { headers });

            setResult(JSON.stringify(res.data, null, 2));
            toast({
                title: "Text Uploaded",
                description: "Text has been processed and uploaded.",
            });
        } catch (error: any) {
            setResult(JSON.stringify(error.response?.data || error.message, null, 2));
            toast({
                title: "Upload Failed",
                description: error.response?.data?.error || error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                    <CardDescription>
                        Enter your PicaOS Secret Key if it's not set in the environment variables.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1">
                        <Label htmlFor="pica-key">Pica Secret Key</Label>
                        <Input
                            id="pica-key"
                            type="password"
                            placeholder="sk_..."
                            value={picaKey}
                            onChange={(e) => setPicaKey(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={fetchConnections} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                            Fetch Connections
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="operations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="operations">Database Operations</TabsTrigger>
                    <TabsTrigger value="firecrawl">Firecrawl Import</TabsTrigger>
                    <TabsTrigger value="text">Text Import</TabsTrigger>
                </TabsList>

                <TabsContent value="operations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operation</CardTitle>
                                <CardDescription>Select a connection and action to perform.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Connection</Label>
                                    <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a vector DB..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {connections.map((c) => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    {c.name || c.platform} ({c.platform})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <Select value={selectedAction} onValueChange={setSelectedAction} disabled={!selectedConnection || loadingActions}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={loadingActions ? "Loading actions..." : "Select an action..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {actions.map((a) => (
                                                <SelectItem key={a.key} value={a.key}>
                                                    {a.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Parameters (JSON)</Label>
                                    <Textarea
                                        className="font-mono text-sm h-[200px]"
                                        placeholder='{ "collection": "my_collection", "document": { ... } }'
                                        value={params}
                                        onChange={(e) => setParams(e.target.value)}
                                    />
                                </div>

                                <Button className="w-full" onClick={handleExecute} disabled={loading || !selectedAction}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Execute
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Result</CardTitle>
                                <CardDescription>Output from the operation.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[300px]">
                                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm h-full overflow-auto whitespace-pre-wrap">
                                    {result || "// Result will appear here..."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="firecrawl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Firecrawl Import</CardTitle>
                                <CardDescription>Crawl a website and import data into your Vector DB.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Firecrawl Connection</Label>
                                    <Select value={selectedCrawler} onValueChange={setSelectedCrawler}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Firecrawl connection..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {crawlerConnections.map((c) => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    {c.name || c.platform}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {crawlerConnections.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            No Firecrawl connections found. Please add one in PicaOS.
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center py-2">
                                    <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Vector DB</Label>
                                    <Select value={selectedVectorDB} onValueChange={setSelectedVectorDB}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select target Vector DB..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {connections.map((c) => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    {c.name || c.platform} ({c.platform})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="https://example.com"
                                            value={crawlUrl}
                                            onChange={(e) => setCrawlUrl(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Chunk Size</Label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={chunkSize}
                                            onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Chunk Overlap</Label>
                                        <Input
                                            type="number"
                                            placeholder="200"
                                            value={chunkOverlap}
                                            onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleCrawl} disabled={loading || !selectedCrawler || !selectedVectorDB || !crawlUrl}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Crawl & Upload
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Result</CardTitle>
                                <CardDescription>Output from the crawl operation.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[300px]">
                                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm h-full overflow-auto whitespace-pre-wrap">
                                    {result || "// Result will appear here..."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="text">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Text Import</CardTitle>
                                <CardDescription>Upload raw text to your Vector DB.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Target Database</Label>
                                    <Select value={selectedTextTargetDB} onValueChange={setSelectedTextTargetDB}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select target DB..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {connections.map((c) => (
                                                <SelectItem key={c.key} value={c.key}>
                                                    {c.name || c.platform} ({c.platform})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        className="font-mono text-sm h-[200px]"
                                        placeholder="Paste your text content here..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Chunk Size</Label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={chunkSize}
                                            onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Chunk Overlap</Label>
                                        <Input
                                            type="number"
                                            placeholder="200"
                                            value={chunkOverlap}
                                            onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Button className="w-full" onClick={handleTextUpload} disabled={loading || !selectedTextTargetDB || !textInput}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Upload Text
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>Result</CardTitle>
                                <CardDescription>Output from the upload operation.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 min-h-[300px]">
                                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm h-full overflow-auto whitespace-pre-wrap">
                                    {result || "// Result will appear here..."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
