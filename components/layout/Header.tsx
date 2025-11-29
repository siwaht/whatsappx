import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const Header = () => {
    return (
        <div className="flex items-center p-4">
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
            </Button>
            <div className="flex w-full justify-end">
                {/* UserButton or similar */}
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
        </div>
    );
};
