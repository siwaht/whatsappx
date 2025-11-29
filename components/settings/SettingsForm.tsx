import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const SettingsForm = () => {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Instance Settings</CardTitle>
                    <CardDescription>
                        Manage global settings for your WhatsApp instance.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="reject-call" className="flex flex-col space-y-1">
                            <span>Reject Calls</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Automatically reject incoming audio and video calls.
                            </span>
                        </Label>
                        <Switch id="reject-call" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="always-online" className="flex flex-col space-y-1">
                            <span>Always Online</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Keep the instance status as "Online" even when idle.
                            </span>
                        </Label>
                        <Switch id="always-online" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="read-messages" className="flex flex-col space-y-1">
                            <span>Mark Messages as Read</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Automatically mark incoming messages as read.
                            </span>
                        </Label>
                        <Switch id="read-messages" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="proxy">Proxy Configuration</Label>
                        <Input id="proxy" placeholder="http://user:pass@host:port" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Settings</Button>
                </CardFooter>
            </Card>
        </div>
    );
};
