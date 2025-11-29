"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useInstancesStore } from "@/lib/store/instances";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export const CreateInstanceModal = () => {
    const [open, setOpen] = useState(false);
    const [instanceName, setInstanceName] = useState("");
    const [loading, setLoading] = useState(false);
    const { addInstance } = useInstancesStore();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!instanceName.trim()) {
            toast({
                title: "Error",
                description: "Instance name is required",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/instances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceName: instanceName.trim() }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create instance');
            }

            const instance = await response.json();
            addInstance(instance);

            toast({
                title: "Success",
                description: "Instance created successfully",
            });

            setInstanceName("");
            setOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create instance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Instance
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Instance</DialogTitle>
                        <DialogDescription>
                            Enter a name for your new WhatsApp instance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="My Business"
                                className="col-span-3"
                                value={instanceName}
                                onChange={(e) => setInstanceName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
