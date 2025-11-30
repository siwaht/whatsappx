"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Array<{
    id: number;
    resource: string;
    action: string;
  }>;
}

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

export function RoleDialog({ open, onClose, role }: RoleDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  });

  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open]);

  useEffect(() => {
    if (open && permissions.length > 0) {
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || "",
          permissionIds: role.permissions.map((p) => {
            // Find permission ID by resource and action
            const perm = permissions.find(
              (ap) => ap.resource === p.resource && ap.action === p.action
            );
            return perm?.id || 0;
          }).filter(Boolean),
        });
      } else {
        setFormData({
          name: "",
          description: "",
          permissionIds: [],
        });
      }
    }
  }, [open, role, permissions]);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get("/api/permissions");
      if (response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role) {
        // Update role
        await axios.put(`/api/roles/${role.id}`, {
          name: formData.name,
          description: formData.description,
          permissionIds: formData.permissionIds,
        });
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create role
        await axios.post("/api/roles", {
          name: formData.name,
          description: formData.description,
          permissionIds: formData.permissionIds,
        });
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Update role information and permissions"
              : "Create a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={!!role}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-4 border rounded-md p-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <div className="font-medium text-sm text-gray-700">
                      {resource.charAt(0).toUpperCase() + resource.slice(1)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={formData.permissionIds.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <Label
                            htmlFor={`perm-${perm.id}`}
                            className="font-normal cursor-pointer text-sm"
                          >
                            {perm.action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : role ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

