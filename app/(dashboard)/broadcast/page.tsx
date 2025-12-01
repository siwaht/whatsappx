"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInstancesStore } from "@/lib/store/instances";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function BroadcastPage() {
    const { instances } = useInstancesStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        instanceName: "",
        name: "",
        message: "",
        recipients: "", // Comma separated numbers for now, later can be groups
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create broadcast");
            }

            toast.success("Broadcast created successfully");
            setFormData({ instanceName: "", name: "", message: "", recipients: "" });
        } catch (error) {
            toast.error("Failed to create broadcast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Broadcast Messages</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Broadcast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Instance</Label>
                                <Select
                                    value={formData.instanceName}
                                    onValueChange={(value) => setFormData({ ...formData, instanceName: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an instance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instances.map((instance) => (
                                            <SelectItem key={instance.instanceName} value={instance.instanceName}>
                                                {instance.instanceName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Broadcast Name</Label>
                                <Input
                                    placeholder="e.g., Summer Sale Announcement"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Recipients (Comma separated numbers)</Label>
                                <Textarea
                                    placeholder="1234567890, 0987654321"
                                    value={formData.recipients}
                                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter phone numbers separated by commas.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="min-h-[150px]"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Broadcast...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Broadcast
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Broadcasts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No broadcasts found.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
