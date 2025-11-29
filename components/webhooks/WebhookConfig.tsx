import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const WebhookConfig = () => {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                    <CardDescription>
                        Configure how your instance sends events to your application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch id="webhook-enabled" />
                        <Label htmlFor="webhook-enabled">Enable Webhooks</Label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input id="webhook-url" placeholder="https://your-api.com/webhook" />
                    </div>
                    <div className="space-y-2">
                        <Label>Events to listen</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="messages-upsert" />
                                <Label htmlFor="messages-upsert">MESSAGES_UPSERT</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="messages-update" />
                                <Label htmlFor="messages-update">MESSAGES_UPDATE</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="connection-update" />
                                <Label htmlFor="connection-update">CONNECTION_UPDATE</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="qr-code" />
                                <Label htmlFor="qr-code">QRCODE_UPDATED</Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Configuration</Button>
                </CardFooter>
            </Card>
        </div>
    );
};
