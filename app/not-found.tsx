import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center animate-in-fade">
            <h1 className="text-9xl font-bold text-primary/20">404</h1>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
                <p className="text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for.
                </p>
            </div>
            <Button asChild className="mt-4" variant="default">
                <Link href="/">Go back home</Link>
            </Button>
        </div>
    );
}
