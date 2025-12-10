"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Eye, EyeOff, Database, Server, Key, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ApiManagementPage() {
    const { toast } = useToast();
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    // In a real app, these initial values would come from the server/database
    const [config, setConfig] = useState({
        databaseUrl: "",
        evolutionApiUrl: "",
        evolutionApiKey: "",
        picaSecretKey: "",
    });

    const [connectionStatus, setConnectionStatus] = useState<{
        evolution: 'idle' | 'success' | 'error';
        pica: 'idle' | 'success' | 'error';
    }>({ evolution: 'idle', pica: 'idle' });

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setConfig({
                        databaseUrl: data.databaseUrl || "",
                        evolutionApiUrl: data.evolutionApiUrl || "",
                        evolutionApiKey: data.evolutionApiKey || "",
                        picaSecretKey: data.picaSecretKey || "",
                    });

                    // Optimistically set status if keys exist (optional, or just leave idle)
                    setConnectionStatus({
                        evolution: data.evolutionApiUrl && data.evolutionApiKey ? 'idle' : 'idle',
                        pica: data.picaSecretKey ? 'idle' : 'idle'
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const verifyConnection = async (type: 'evolution' | 'pica') => {
        setLoading(true);
        try {
            const credentials = type === 'evolution'
                ? { url: config.evolutionApiUrl, apiKey: config.evolutionApiKey }
                : { secretKey: config.picaSecretKey };

            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, credentials }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setConnectionStatus(prev => ({ ...prev, [type]: 'success' }));
                toast({
                    title: "Connection Successful",
                    description: data.message,
                });
                return true;
            } else {
                setConnectionStatus(prev => ({ ...prev, [type]: 'error' }));
                throw new Error(data.error || 'Verification failed');
            }
        } catch (error: any) {
            setConnectionStatus(prev => ({ ...prev, [type]: 'error' }));
            toast({
                title: "Connection Failed",
                description: error.message || "Could not verify connection",
                variant: "destructive",
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Verify Evolution if provided
            if (config.evolutionApiUrl && config.evolutionApiKey) {
                const evoValid = await verifyConnection('evolution');
                if (!evoValid) return; // Stop if verification fails
            }

            // Verify Pica if provided
            if (config.picaSecretKey) {
                const picaValid = await verifyConnection('pica');
                if (!picaValid) return; // Stop if verification fails
            }

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!response.ok) throw new Error('Failed to save settings');

            toast({
                title: "Settings Saved",
                description: "API configurations have been updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h3 className="text-lg font-medium">API Management</h3>
                <p className="text-sm text-muted-foreground">
                    Configure external service connections and API keys.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Database Confiugration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" />
                            Database Configuration
                        </CardTitle>
                        <CardDescription>
                            Connection strings for your primary database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="databaseUrl">Connection String</Label>
                            <div className="relative">
                                <Input
                                    id="databaseUrl"
                                    type={showSecrets.db ? "text" : "password"}
                                    placeholder="mongodb+srv://..."
                                    value={config.databaseUrl}
                                    onChange={(e) => handleChange("databaseUrl", e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => toggleSecret("db")}
                                >
                                    {showSecrets.db ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Evolution API Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-green-500" />
                            Evolution API
                            {connectionStatus.evolution === 'success' && (
                                <span className="flex items-center text-sm font-normal text-green-600 ml-2 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Connected
                                </span>
                            )}
                            {connectionStatus.evolution === 'error' && (
                                <span className="flex items-center text-sm font-normal text-red-600 ml-2 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Failed
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Connection details for the WhatsApp Evolution API instance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="evolutionUrl">API URL</Label>
                                <Input
                                    id="evolutionUrl"
                                    placeholder="https://api.example.com"
                                    value={config.evolutionApiUrl}
                                    onChange={(e) => handleChange("evolutionApiUrl", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evolutionKey">API Key</Label>
                                <div className="relative">
                                    <Input
                                        id="evolutionKey"
                                        type={showSecrets.evolution ? "text" : "password"}
                                        placeholder="global-api-key"
                                        value={config.evolutionApiKey}
                                        onChange={(e) => handleChange("evolutionApiKey", e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => toggleSecret("evolution")}
                                    >
                                        {showSecrets.evolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pica Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-purple-500" />
                            Pica Integration
                            {connectionStatus.pica === 'success' && (
                                <span className="flex items-center text-sm font-normal text-green-600 ml-2 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Connected
                                </span>
                            )}
                            {connectionStatus.pica === 'error' && (
                                <span className="flex items-center text-sm font-normal text-red-600 ml-2 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Failed
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Secret keys for PicaOS services (Stripe, AI, etc).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="picaKey">Pica Secret Key</Label>
                            <div className="relative">
                                <Input
                                    id="picaKey"
                                    type={showSecrets.pica ? "text" : "password"}
                                    placeholder="sk_pica_..."
                                    value={config.picaSecretKey}
                                    onChange={(e) => handleChange("picaSecretKey", e.target.value)}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => toggleSecret("pica")}
                                >
                                    {showSecrets.pica ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                This key is used to authenticate requests to PicaOS for Stripe and other tools.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="w-[150px]">
                        {loading ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
