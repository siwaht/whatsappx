import { create } from 'zustand';
import type { EvolutionInstance } from '../types';

interface InstancesState {
  instances: EvolutionInstance[];
  selectedInstance: string | null;
  loading: boolean;
  error: string | null;
  setInstances: (instances: EvolutionInstance[]) => void;
  setSelectedInstance: (instanceName: string | null) => void;
  addInstance: (instance: EvolutionInstance) => void;
  updateInstance: (instanceName: string, updates: Partial<EvolutionInstance>) => void;
  removeInstance: (instanceName: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInstancesStore = create<InstancesState>((set) => ({
  instances: [],
  selectedInstance: null,
  loading: false,
  error: null,
  setInstances: (instances) => set({ instances }),
  setSelectedInstance: (instanceName) => set({ selectedInstance: instanceName }),
  addInstance: (instance) =>
    set((state) => ({
      instances: [...state.instances, instance],
    })),
  updateInstance: (instanceName, updates) =>
    set((state) => ({
      instances: state.instances.map((inst) =>
        inst.instanceName === instanceName ? { ...inst, ...updates } : inst
      ),
    })),
  removeInstance: (instanceName) =>
    set((state) => ({
      instances: state.instances.filter((inst) => inst.instanceName !== instanceName),
      selectedInstance: state.selectedInstance === instanceName ? null : state.selectedInstance,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
