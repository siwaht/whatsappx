import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Users } from "lucide-react";

// Mock data
const groups = [
    {
        id: "1",
        subject: "Dev Team",
        participants: 12,
        creation: "2023-10-01",
        pictureUrl: "",
    },
    {
        id: "2",
        subject: "Family",
        participants: 5,
        creation: "2023-01-15",
        pictureUrl: "",
    },
    {
        id: "3",
        subject: "Announcements",
        participants: 150,
        creation: "2023-05-20",
        pictureUrl: "",
    },
];

export const GroupList = () => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Icon</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map((group) => (
                        <TableRow key={group.id}>
                            <TableCell>
                                <Avatar>
                                    <AvatarImage src={group.pictureUrl} />
                                    <AvatarFallback>
                                        <Users className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">{group.subject}</TableCell>
                            <TableCell>{group.participants}</TableCell>
                            <TableCell>{group.creation}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Manage Participants</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
