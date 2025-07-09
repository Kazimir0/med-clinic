"use client";

import { AppointmentStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";

// AppointmentAction component allows users to change the status of an appointment (Pending, Approve, Completed, Cancel)
// Handles UI state, validation, and triggers the backend action for status updates.
interface ActionProps {
  id: string | number;
  status: string;
}
export const AppointmentAction = ({ id, status }: ActionProps) => {
  // State for loading indicator, selected action, and cancellation reason
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  // Handles the status change action, including validation and API call
  const handleAction = async () => {
    try {
      setIsLoading(true);
      // Use provided reason or generate a default message
      const newReason =
        reason ||
        `Appointment has ben ${selected.toLowerCase()} on ${new Date()}`;

      // Call the appointmentAction API with the new status and reason
      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg); // Show success message
        router.refresh(); // Refresh data/UI
      } else if (resp.error) {
        toast.error(resp.msg); // Show error message
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Action buttons for each possible status */}
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          disabled={status === "PENDING" || isLoading || status === "COMPLETED"}
          className="bg-yellow-200 text-black"
          onClick={() => setSelected("PENDING")}
        >
          Pending
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "SCHEDULED" || isLoading || status === "COMPLETED"
          }
          className="bg-blue-200 text-black"
          onClick={() => setSelected("SCHEDULED")}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "COMPLETED" || isLoading || status === "COMPLETED"
          }
          className="bg-emerald-200 text-black"
          onClick={() => setSelected("COMPLETED")}
        >
          Completed
        </Button>
        <Button
          variant="outline"
          disabled={
            status === "CANCELLED" || isLoading || status === "COMPLETED"
          }
          className="bg-red-200 text-black"
          onClick={() => setSelected("CANCELLED")}
        >
          Cancel
        </Button>
      </div>
      {/* Show reason textarea if cancelling */}
      {selected === "CANCELLED" && (
        <>
          <Textarea
            disabled={isLoading}
            className="mt-4"
            placeholder="Enter reason...."
            onChange={(e) => setReason(e.target.value)}
          ></Textarea>
        </>
      )}

      {/* Confirmation dialog for any action */}
      {selected && (
        <div className="flex items-center justify-between mt-6 bg-red-100 p-4 rounded">
          <p className="">Are you sure you want to perform this action?</p>
          <Button disabled={isLoading} type="button" onClick={handleAction}>
            Yes
          </Button>
        </div>
      )}
    </div>
  );
};