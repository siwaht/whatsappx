"use client";

import { CreateInstanceModal } from "@/components/instances/CreateInstanceModal";
import { InstanceCard } from "@/components/instances/InstanceCard";
import { useInstancesStore } from "@/lib/store/instances";
import { useEffect } from "react";

export default function InstancesPage() {
    const { instances, loading, error, setInstances, setLoading, setError } = useInstancesStore();

    useEffect(() => {
        const fetchInstances = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/instances');

                if (!response.ok) {
                    throw new Error('Failed to fetch instances');
                }

                const data = await response.json();
                setInstances(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch instances');
            } finally {
                setLoading(false);
            }
        };

        fetchInstances();
    }, [setInstances, setLoading, setError]);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Instances</h2>
                <div className="flex items-center space-x-2">
                    <CreateInstanceModal />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {instances.map((instance) => (
                        <InstanceCard key={instance.instanceName} instance={instance} />
                    ))}
                    {instances.length === 0 && !loading && (
                        <div className="col-span-full text-center text-muted-foreground py-12">
                            No instances found. Create your first instance to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
