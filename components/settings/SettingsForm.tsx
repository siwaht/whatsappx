"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useInstancesStore } from "@/lib/store/instances";
import { useState } from "react";

export const SettingsForm = () => {
    const { selectedInstance, instances } = useInstancesStore();
    const [loading, setLoading] = useState(false);
    const [rejectCall, setRejectCall] = useState(false);
    const [alwaysOnline, setAlwaysOnline] = useState(false);
    const [readMessages, setReadMessages] = useState(false);
    const [instance, setInstance] = useState(selectedInstance || "");
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!instance) {
            toast({
                title: "Error",
                description: "Please select an instance",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceName: instance,
                    rejectCall,
                    alwaysOnline,
                    readMessages,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save settings');
            }

            toast({
                title: "Success",
                description: "Settings saved successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Instance Settings</CardTitle>
                        <CardDescription>
                            Manage settings for your WhatsApp instance.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="instance">Select Instance</Label>
                            <Select value={instance} onValueChange={setInstance} required>
                                <SelectTrigger id="instance">
                                    <SelectValue placeholder="Choose an instance" />
                                </SelectTrigger>
                                <SelectContent>
                                    {instances.map((inst) => (
                                        <SelectItem key={inst.instanceName} value={inst.instanceName}>
                                            {inst.instanceName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="reject-call" className="flex flex-col space-y-1">
                                <span>Reject Calls</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Automatically reject incoming audio and video calls.
                                </span>
                            </Label>
                            <Switch
                                id="reject-call"
                                checked={rejectCall}
                                onCheckedChange={setRejectCall}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="always-online" className="flex flex-col space-y-1">
                                <span>Always Online</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Keep the instance status as "Online" even when idle.
                                </span>
                            </Label>
                            <Switch
                                id="always-online"
                                checked={alwaysOnline}
                                onCheckedChange={setAlwaysOnline}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="read-messages" className="flex flex-col space-y-1">
                                <span>Mark Messages as Read</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Automatically mark incoming messages as read.
                                </span>
                            </Label>
                            <Switch
                                id="read-messages"
                                checked={readMessages}
                                onCheckedChange={setReadMessages}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Settings"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
};
