"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { processPayment } from "@/app/actions/payment";

interface PayButtonProps {
    paymentId: string;
}

// PayButton component provides a dialog for selecting and processing a payment method (cash or card)
// Handles payment logic, error handling, and UI feedback for both methods
export const PayButton = ({ paymentId }: PayButtonProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Handles payment processing for the selected method
    const handlePayment = async (method: "CASH" | "CARD") => {
        try {
            setLoading(true);

            if (method === "CASH") {
                // Process cash payment via server action
                const result = await processPayment(paymentId, "CASH");

                if (result.success) {
                    toast.success("Cash payment registered successfully!");
                    router.refresh();
                    setOpen(false);
                } else {
                    toast.error(result.message || "Failed to process payment");
                }
            } else if (method === "CARD") {
                try {
                    setLoading(true);
                    // Initiate Stripe checkout session via API
                    const response = await fetch('/api/stripe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ paymentId }),
                    });

                    const data = await response.json();
                    console.log("Stripe API response:", data);

                    if (response.ok && data.url) {
                        // Redirect to Stripe checkout page
                        window.location.href = data.url;
                    } else {
                        // Show error from server
                        toast.error(data.error || "Failed to create checkout session");
                        console.error("Stripe checkout error details:", data);
                    }
                } catch (error) {
                    console.error("Stripe checkout client error:", error);
                    toast.error("An error occurred while initiating card payment");
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("An error occurred while processing your payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Pay button opens the payment method dialog */}
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-green-600/10 hover:bg-green-600/20 text-green-600 px-1.5 py-1 text-xs md:text-sm"
            >
                Pay
            </Button>

            {/* Dialog for selecting payment method */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Payment Method</DialogTitle>
                        <DialogDescription>
                            Choose how you would like to pay for this bill.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="flex flex-col space-y-4">
                            {/* Cash payment option */}
                            <Button
                                variant="outline"
                                className="justify-start py-6"
                                onClick={() => handlePayment("CASH")}
                                disabled={loading}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Cash</span>
                                    <span className="text-sm text-gray-500">Pay the amount directly to your doctor</span>
                                </div>
                            </Button>

                            {/* Card payment option */}
                            <Button
                                variant="outline"
                                className="justify-start py-6"
                                onClick={() => handlePayment("CARD")}
                                disabled={loading}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">Card</span>
                                    <span className="text-sm text-gray-500">Pay online using credit/debit card via Stripe</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};