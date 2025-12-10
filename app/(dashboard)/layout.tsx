import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="h-full relative">
                {/* Desktop Sidebar */}
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900 border-r border-sidebar-border">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-background/80 backdrop-blur-md border-b border-border/50">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                    <span className="ml-4 font-bold text-lg">WhatsAppX</span>
                </div>

                <main className="md:pl-72 pt-16 md:pt-0">
                    <Header />
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
