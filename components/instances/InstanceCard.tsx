"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { MoreVertical, Power, RefreshCw, Trash, QrCode, Bot } from "lucide-react";
import { useInstancesStore } from "@/lib/store/instances";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ConnectInstanceModal } from "./ConnectInstanceModal";

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
    const [showConnectModal, setShowConnectModal] = useState(false);
    const { toast } = useToast();

    const handleConnect = () => {
        setShowConnectModal(true);
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

    const handleLinkAgent = async (agentId: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/instances/${instance.instanceName}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiAgentId: agentId }),
            });

            if (!response.ok) throw new Error('Failed to link AI agent');

            toast({
                title: "Success",
                description: "AI Agent linked successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to link AI agent",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="glass-card border-0 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {instance.instanceName}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-black/5 dark:hover:bg-white/10" disabled={loading}>
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-white/20">
                            <DropdownMenuItem onClick={handleRestart} className="cursor-pointer">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restart
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLinkAgent(1)} className="cursor-pointer">
                                <Bot className="mr-2 h-4 w-4" />
                                Link Default Agent (ID: 1)
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-100/50" onClick={handleDelete}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="flex items-center space-x-4 py-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-inner">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-600 to-gray-400">
                                {instance.instanceName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium leading-none">
                                {instance.profileName || "Unknown Profile"}
                            </p>
                            <Badge
                                variant={instance.status === "open" ? "default" : "destructive"}
                                className={cn(
                                    "capitalize shadow-sm",
                                    instance.status === "open" ? "bg-emerald-500 hover:bg-emerald-600" : ""
                                )}
                            >
                                {instance.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="relative z-10">
                    {instance.status !== "open" ? (
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02]" onClick={handleConnect} disabled={loading}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Connect
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={handleDisconnect} disabled={loading}>
                            <Power className="mr-2 h-4 w-4" />
                            {loading ? "Disconnecting..." : "Disconnect"}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <ConnectInstanceModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                instanceName={instance.instanceName}
            />
        </>
    );
};
