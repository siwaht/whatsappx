"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useInstancesStore } from "@/lib/store/instances";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { WEBHOOK_EVENTS } from "@/lib/constants/webhooks";

export const WebhookConfig = () => {
    const { instances, selectedInstance } = useInstancesStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // State
    const [enabled, setEnabled] = useState(false);
    const [url, setUrl] = useState("");
    const [events, setEvents] = useState<string[]>([]);

    // Load config when instance changes
    useEffect(() => {
        if (selectedInstance) {
            loadConfig(selectedInstance);
        }
    }, [selectedInstance]);

    const loadConfig = async (instanceName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/webhooks/config?instance=${instanceName}`);
            if (res.ok) {
                const data = await res.json();
                setEnabled(data.enabled || false);
                setUrl(data.url || "");
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error("Failed to load webhook config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedInstance) return;

        setSaving(true);
        try {
            const res = await fetch('/api/webhooks/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceName: selectedInstance,
                    enabled,
                    url,
                    events
                })
            });

            if (!res.ok) throw new Error("Failed to save config");

            toast({
                title: "Success",
                description: "Webhook configuration saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save webhook configuration",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleEvent = (event: string) => {
        setEvents(prev =>
            prev.includes(event)
                ? prev.filter(e => e !== event)
                : [...prev, event]
        );
    };

    if (!selectedInstance) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                Please select an instance to configure webhooks.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                    <CardDescription>
                        Configure how your instance sends events to your application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="webhook-enabled"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                        <Label htmlFor="webhook-enabled">Enable Webhooks</Label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input
                            id="webhook-url"
                            placeholder="https://your-api.com/webhook"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Events to listen</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {WEBHOOK_EVENTS.map((event) => (
                                <div key={event} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={event}
                                        checked={events.includes(event)}
                                        onCheckedChange={() => toggleEvent(event)}
                                    />
                                    <Label htmlFor={event} className="text-sm font-normal">{event}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
