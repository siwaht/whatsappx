"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Eye, EyeOff, Database, Server, Key } from "lucide-react";
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

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key: string, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call to save settings
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Detailed implementation would POST to an API route to save these values securely
        // For now, we'll just show a success toast

        toast({
            title: "Settings Saved",
            description: "API configurations have been updated successfully.",
        });
        setLoading(false);
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
