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

interface InstanceCardProps {
    instance: {
        instanceName: string;
        status: string;
        profileName?: string;
        profilePicture?: string;
    };
}

export const InstanceCard = ({ instance }: InstanceCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    {instance.instanceName}
                </CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Restart
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 py-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {/* Placeholder for profile picture */}
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
                    <Button className="w-full">
                        <QrCode className="mr-2 h-4 w-4" />
                        Connect
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full">
                        <Power className="mr-2 h-4 w-4" />
                        Disconnect
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
