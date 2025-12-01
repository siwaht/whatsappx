import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { UserMenu } from "@/components/layout/UserMenu";

export const Header = () => {
    return (
        <header className="sticky top-0 z-50 flex items-center border-b border-border/40 bg-background/95 p-4 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                <UserMenu />
            </div>
        </header>
    );
};
