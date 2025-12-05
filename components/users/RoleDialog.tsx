import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function RoleDialog({ open, onClose, role }: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Role Dialog</DialogTitle>
                </DialogHeader>
                <div>Placeholder for Role Dialog</div>
            </DialogContent>
        </Dialog>
    );
}
