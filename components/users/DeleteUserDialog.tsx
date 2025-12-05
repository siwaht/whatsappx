import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DeleteUserDialog({ open, onClose, user }: any) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                </DialogHeader>
                <div>Placeholder for Delete User Dialog</div>
            </DialogContent>
        </Dialog>
    );
}
