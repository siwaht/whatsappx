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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

export function RoleManager() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const queryClient = useQueryClient();

    const { data: roles, isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await axios.get('/api/roles');
            return res.data;
        }
    });

    const { data: permissions, isLoading: permsLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const res = await axios.get('/api/permissions');
            return res.data;
        }
    });

    const createRoleMutation = useMutation({
        mutationFn: async (data: any) => {
            return axios.post('/api/roles', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setIsDialogOpen(false);
            setNewRoleName("");
            setNewRoleDesc("");
            setSelectedPermissions([]);
            toast.success("Role created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create role");
        }
    });

    const handleCreateRole = () => {
        createRoleMutation.mutate({
            name: newRoleName,
            description: newRoleDesc,
            permissions: selectedPermissions
        });
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    if (rolesLoading || permsLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    // Group permissions by resource
    const groupedPermissions = permissions?.reduce((acc: any, perm: any) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Define a new role and assign permissions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input id="name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Moderator" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input id="desc" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="Role description" />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="border rounded-md p-4 space-y-4">
                                    {Object.entries(groupedPermissions || {}).map(([resource, perms]: [string, any]) => (
                                        <div key={resource}>
                                            <h4 className="font-semibold capitalize mb-2">{resource}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {perms.map((perm: any) => (
                                                    <div key={perm.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`perm-${perm.id}`}
                                                            checked={selectedPermissions.includes(perm.id)}
                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                        />
                                                        <label
                                                            htmlFor={`perm-${perm.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {perm.action}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending || !newRoleName}>
                                {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border glass-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.map((role: any) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {role.rolePermissions?.length > 0 ? (
                                            role.rolePermissions.slice(0, 3).map((rp: any) => (
                                                <Badge key={rp.permission.id} variant="outline" className="text-xs">
                                                    {rp.permission.resource}:{rp.permission.action}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-xs">No permissions</span>
                                        )}
                                        {role.rolePermissions?.length > 3 && (
                                            <Badge variant="outline" className="text-xs">+{role.rolePermissions.length - 3} more</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(role.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
