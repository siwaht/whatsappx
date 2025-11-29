import { CreateInstanceModal } from "@/components/instances/CreateInstanceModal";
import { InstanceCard } from "@/components/instances/InstanceCard";

export default function InstancesPage() {
    // Mock data for now
    const instances = [
        {
            instanceName: "Main Support",
            status: "open",
            profileName: "Support Team",
        },
        {
            instanceName: "Marketing Bot",
            status: "close",
            profileName: "Marketing",
        },
        {
            instanceName: "Dev Test",
            status: "connecting",
            profileName: "Developer",
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Instances</h2>
                <div className="flex items-center space-x-2">
                    <CreateInstanceModal />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {instances.map((instance) => (
                    <InstanceCard key={instance.instanceName} instance={instance} />
                ))}
            </div>
        </div>
    );
}
