"use client";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

interface EditPaymentMethodProps {
  method: {
    id: number;
    name: string;
    description: string;
  };
}

// EditPaymentMethod displays details of a payment method in a dialog.
// Editing is disabled to ensure system compatibility.
export const EditPaymentMethod = ({ method }: EditPaymentMethodProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Dialog for viewing payment method details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Method Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Display payment method name */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Name</h3>
              <p className="text-sm">{method.name}</p>
            </div>
            
            {/* Display payment method description */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm">{method.description}</p>
            </div>
            
            {/* Info box explaining why editing is disabled */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-amber-800">
                Payment methods are configured statically in the system and cannot be edited.
                This ensures compatibility with the payment processing system.
              </p>
            </div>
            {/* Close button for dialog */}
            <Button 
              onClick={() => setOpen(false)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};