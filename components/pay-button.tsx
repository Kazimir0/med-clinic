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

export const PayButton = ({ paymentId }: PayButtonProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async (method: "CASH" | "CARD") => {
        try {
            setLoading(true);

            if (method === "CASH") {
                // Procesează plată cash
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
                        // Redirecționează către pagina de checkout Stripe
                        window.location.href = data.url;
                    } else {
                        // Afișează eroarea completă primită de la server
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
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center rounded-full bg-green-600/10 hover:bg-green-600/20 text-green-600 px-1.5 py-1 text-xs md:text-sm"
            >
                Pay
            </Button>

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