"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center animate-in-fade">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-destructive">
                    Something went wrong!
                </h2>
                <p className="text-muted-foreground">
                    An unexpected error occurred. Please try again.
                </p>
            </div>
            <Button onClick={() => reset()} variant="outline">
                Try again
            </Button>
        </div>
    );
}
