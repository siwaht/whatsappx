"use client";

import { create } from "zustand";
import axios from "axios";

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  fetchUser: async () => {
    try {
      const response = await axios.get("/api/auth/session");
      if (response.data.success) {
        set({ user: response.data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ user: null });
      window.location.href = "/login";
    }
  },
}));

