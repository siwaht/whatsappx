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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: string[];
}

interface Role {
  id: number;
  name: string;
  description: string | null;
}

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

export function UserDialog({ open, onClose, user }: UserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    isActive: true,
    roleIds: [] as number[],
  });

  useEffect(() => {
    if (open) {
      fetchRoles();
      if (user) {
        setFormData({
          email: user.email,
          username: user.username,
          password: "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          isActive: user.isActive,
          roleIds: [], // Will be set after fetching user details
        });
        fetchUserDetails();
      } else {
        setFormData({
          email: "",
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          isActive: true,
          roleIds: [],
        });
      }
    }
  }, [open, user]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/api/roles");
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchUserDetails = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/users/${user.id}`);
      if (response.data.success) {
        const userData = response.data.data;
        setFormData((prev) => ({
          ...prev,
          roleIds: userData.roles.map((r: Role) => r.id),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update user
        await axios.put(`/api/users/${user.id}`, {
          ...formData,
          password: formData.password || undefined,
        });
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create user
        if (!formData.password) {
          toast({
            title: "Error",
            description: "Password is required for new users",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        await axios.post("/api/users", formData);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information and permissions"
              : "Create a new user account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {user ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!user}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="space-y-2 border rounded-md p-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.roleIds.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="font-normal cursor-pointer"
                    >
                      {role.name}
                      {role.description && (
                        <span className="text-gray-500 text-sm ml-2">
                          - {role.description}
                        </span>
                      )}
                    </Label>
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
              {loading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



