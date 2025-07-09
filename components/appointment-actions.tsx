import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { EllipsisVertical, User } from "lucide-react";
import Link from "next/link";
import { AppointmentActionDialog } from "./appointment-action-dialog";

interface ActionsProps {
  userId: string;
  status: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
}

// AppointmentActionOptions provides a popover menu for appointment-related actions (view, approve, cancel)
// It checks user role and appointment status to determine which actions are available.
export const AppointmentActionOptions = async ({
  userId,
  patientId,
  doctorId,
  status,
  appointmentId,
}: ActionsProps) => {
  // Get current authenticated user and check if user is an admin
  const user = await auth();
  const isAdmin = await checkRole("ADMIN");

  return (
    <Popover>
      {/* PopoverTrigger is the ellipsis button to open the actions menu */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1"
        >
          <EllipsisVertical size={16} className="text-sm text-gray-500" />
        </Button>
      </PopoverTrigger>

      {/* PopoverContent displays the available actions */}
      <PopoverContent className="w-56 p-3">
        <div className="space-y-3 flex flex-col items-start">
          <span className="text-gray-400 text-xs">Perform Actions</span>
          {/* View Full Details action, always available */}
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href={`appointments/${appointmentId}`}>
              <User size={16} /> View Full Details
            </Link>
          </Button>

          {/* Approve action, only if not already scheduled */}
          {status !== "SCHEDULED" && (
            <AppointmentActionDialog
              type="approve"
              id={appointmentId}
              // Only admin or doctor can approve
              disabled={isAdmin || user.userId === doctorId}
            />
          )}
          {/* Cancel action, only if appointment is pending and user is admin, doctor, or patient */}
          <AppointmentActionDialog
            type="cancel"
            id={appointmentId}
            disabled={
              status === "PENDING" &&
              (isAdmin || user.userId === doctorId || user.userId === patientId)
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};