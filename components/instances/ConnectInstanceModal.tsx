"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Loader2, RefreshCw } from "lucide-react";

interface ConnectInstanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    instanceName: string;
}

export const ConnectInstanceModal = ({
    isOpen,
    onClose,
    instanceName,
}: ConnectInstanceModalProps) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchQRCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/instances/${instanceName}/connect`);
            if (!response.ok) {
                throw new Error("Failed to fetch QR code");
            }
            const data = await response.json();
            // Evolution API returns base64 or code depending on version, handling both
            if (data.base64) {
                setQrCode(data.base64);
            } else if (data.code) {
                setQrCode(data.code);
            } else if (data.qrcode) {
                setQrCode(data.qrcode);
            } else {
                // If it's just a connection string or we need to render it
                setQrCode(JSON.stringify(data));
            }
        } catch (err) {
            setError("Failed to load QR Code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && instanceName) {
            fetchQRCode();
        }
    }, [isOpen, instanceName]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect {instanceName}</DialogTitle>
                    <DialogDescription>
                        Scan the QR code with your WhatsApp to connect.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center space-y-2 text-destructive">
                            <p>{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchQRCode}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    ) : qrCode ? (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            {/* If it's a base64 image string */}
                            {qrCode.startsWith('data:image') ? (
                                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            ) : (
                                <QRCode value={qrCode} size={256} />
                            )}
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
};
