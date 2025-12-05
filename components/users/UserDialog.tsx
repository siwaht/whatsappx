import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function UserDialog({ open, onClose, user }: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Dialog</DialogTitle>
                </DialogHeader>
                <div>Placeholder for User Dialog</div>
            </DialogContent>
        </Dialog>
    );
}
