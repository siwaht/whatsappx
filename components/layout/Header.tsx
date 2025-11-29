import { MobileSidebar } from "@/components/layout/MobileSidebar";

export const Header = () => {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar />
            <div className="flex w-full justify-end">
                {/* UserButton or similar */}
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
        </div>
    );
};
