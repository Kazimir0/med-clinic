"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa";
import { toast } from "sonner";
import { deleteDataById } from "@/app/actions/general";

interface ActionDialogProps {
    // Define any props you need for the ActionDialog component
    type: "doctor" | "staff" | "delete";
    id: string; // ID of the user or record to delete
    data?: any; // Optional data for the dialog, can be used for additional information
    deleteType: "doctor" | "staff" | "patient"; // Specify the type of user to delete
}

export const ActionDialog = ({
    type,
    id,
    data,
    deleteType,
}: ActionDialogProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (type === "delete") {
        const handleDelete = async () => {
            try {
                setLoading(true);
                // Perform the delete operation based on the deleteType
                const res = await deleteDataById(id, deleteType);

                if (res.success) {
                    toast.success("Record deleted successfully.");
                    router.refresh(); // Refresh the page to reflect changes
                } else {
                    toast.error("Failed to delete record. Please try again.");
                }

            } catch (error) {
                console.error("Error deleting record:", error);
                toast.error("Failed to delete record. Please try again.");
            } finally {
                setLoading(false); // Reset loading state
            }
        };
        return (
            <Dialog>
                <DialogTrigger asChild>
                    {/* Trigger button for delete confirmation dialog */}
                    <Button
                        variant={"outline"}
                        className="flex items-center justify-center rounded-full text-red-500"
                    >
                        <Trash2 size={16} className="text-red-500" />
                        {deleteType === "patient" && "Delete Patient"}
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <div className="flex flex-col items-center justify-center py-6">
                        {/* Icon for delete confirmation */}
                        <DialogTitle>
                            <div className="bg-red-200 p-4 rounded-full mb-2">
                                <FaQuestion size={50} className="text-red-500" />
                            </div>
                        </DialogTitle>

                        {/* Title and confirmation message */}
                        <span className="text-xl text-black">Delete Confirmation</span>
                        <p className="text-sm">
                            Are you sure you want to delete this record?
                        </p>

                        <div className="flex justify-center mt-6 items-center gap-x-3">
                            <DialogClose asChild>
                                {/* Button for canceling deletion */}
                                <Button variant={"outline"} className="px-4 py-2">
                                    Cancel
                                </Button>
                            </DialogClose>

                            {/* Button for confirming deletion for doctors */}
                            <Button
                                disabled={loading}
                                variant={"outline"}
                                className="px-4 py-2 text-sm font-medium bg-destructive text-white hover:bg-destructive hover:text-white"
                                onClick={handleDelete}
                            >
                                Yes. Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }
    return null;
};
