"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Power, RefreshCw, Trash, QrCode } from "lucide-react";
import { useInstancesStore } from "@/lib/store/instances";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface InstanceCardProps {
    instance: {
        instanceName: string;
        status: string;
        profileName?: string;
        profilePicture?: string;
    };
}

export const InstanceCard = ({ instance }: InstanceCardProps) => {
    const { removeInstance, updateInstance } = useInstancesStore();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/instances/${instance.instanceName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'connect' }),
            });

            if (!response.ok) throw new Error('Failed to connect instance');

            const data = await response.json();
            updateInstance(instance.instanceName, { status: 'connecting' });

            toast({
                title: "Instance connecting",
                description: "Scan the QR code in the Evolution API",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to connect instance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/instances/${instance.instanceName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' }),
            });

            if (!response.ok) throw new Error('Failed to disconnect instance');

            updateInstance(instance.instanceName, { status: 'close' });

            toast({
                title: "Success",
                description: "Instance disconnected successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to disconnect instance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/instances/${instance.instanceName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restart' }),
            });

            if (!response.ok) throw new Error('Failed to restart instance');

            toast({
                title: "Success",
                description: "Instance restarted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to restart instance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${instance.instanceName}?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/instances/${instance.instanceName}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete instance');

            removeInstance(instance.instanceName);

            toast({
                title: "Success",
                description: "Instance deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete instance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    {instance.instanceName}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleRestart}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Restart
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500">
                            {instance.instanceName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {instance.profileName || "Unknown Profile"}
                        </p>
                        <Badge
                            variant={instance.status === "open" ? "default" : "destructive"}
                        >
                            {instance.status}
                        </Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                {instance.status === "close" ? (
                    <Button className="w-full" onClick={handleConnect} disabled={loading}>
                        <QrCode className="mr-2 h-4 w-4" />
                        {loading ? "Connecting..." : "Connect"}
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full" onClick={handleDisconnect} disabled={loading}>
                        <Power className="mr-2 h-4 w-4" />
                        {loading ? "Disconnecting..." : "Disconnect"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
