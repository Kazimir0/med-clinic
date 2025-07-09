import db from "@/lib/db";
import { createNotification } from "@/utils/server-notifications";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST: Creates a new bill for a patient and service.
 * - Authenticates the user.
 * - Creates a payment record (required for PatientBills).
 * - Creates a bill referencing the payment and service.
 * - Sends a notification to the patient about the new bill.
 * Returns the created bill with related service and payment info.
 */
export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body for bill and payment details
        const data = await request.json();
        const { patient_id, service_id, quantity, unit_cost, total_cost, service_date } = data;

        // Create a payment record (required for PatientBills)
        const payment = await db.payment.create({
            data: {
                patient_id,
                appointment_id: data.appointment_id, // Must be provided in request
                bill_date: new Date(),
                payment_date: new Date(),
                discount: 0, // Default value
                total_amount: total_cost,
                amount_paid: 0, // Unpaid initially
                status: "UNPAID",
                payment_method: "CASH" // Default or from request
            }
        });

        // Create the bill referencing the payment and service
        const bill = await db.patientBills.create({
            data: {
                bill_id: payment.id,
                service_id,
                service_date: new Date(service_date || Date.now()),
                quantity,
                unit_cost,
                total_cost
            },
            include: {
                service: true,
                payment: {
                    include: {
                        patient: true
                    }
                }
            }
        });

        // Send notification to the patient about the new bill
        try {
            await createNotification({
                title: "New Bill",
                message: `A new bill of ${total_cost} RON has been issued for medical services.`,
                type: "payment",
                userId: patient_id,
                link: `/patient/self?cat=payments`,
                data: {
                    billId: bill.id,
                    amount: total_cost
                }
            });
        } catch (notificationError) {
            console.error("Failed to create bill notification:", notificationError);
        }

        return NextResponse.json(bill);
    } catch (error) {
        console.error("Error creating bill:", error);
        return NextResponse.json(
            { error: "Failed to create bill" },
            { status: 500 }
        );
    }
}

/**
 * GET: Retrieves bills for a patient or all bills.
 * - Authenticates the user.
 * - Supports filtering by patientId and status via query params.
 * - Returns bills with related service and patient info.
 */
export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse query parameters for filtering
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patientId");
        const status = searchParams.get("status");

        // Find bills, filtering by patient and status if provided
        const bills = await db.patientBills.findMany({
            where: {
                payment: {
                    patient_id: patientId || undefined,
                    status: status as any || undefined
                }
            },
            orderBy: {
                created_at: "desc"
            },
            include: {
                service: true,
                payment: {
                    include: {
                        patient: {
                            select: {
                                first_name: true,
                                last_name: true,
                                img: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(bills);
    } catch (error) {
        console.error("Error fetching bills:", error);
        return NextResponse.json(
            { error: "Failed to fetch bills" },
            { status: 500 }
        );
    }
}

/**
 * PATCH: Updates the status or amount paid for a bill (updates the Payment record).
 * - Authenticates the user.
 * - Updates the payment status and/or amount paid.
 * - Sends a notification to the patient if the status changes.
 * Returns the updated bill with related info.
 */
export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body for update details
        const data = await request.json();
        const { id, status, amount_paid } = data;

        // Find the bill and related payment
        const bill = await db.patientBills.findUnique({
            where: { id: parseInt(id) },
            include: {
                payment: {
                    include: {
                        patient: true
                    }
                }
            }
        });

        if (!bill) {
            return NextResponse.json(
                { error: "Bill not found" },
                { status: 404 }
            );
        }

        // Update the payment associated with the bill
        const updatedPayment = await db.payment.update({
            where: { id: bill.bill_id },
            data: {
                status: status as any,
                amount_paid: amount_paid || bill.payment.amount_paid
            }
        });

        // Get the updated bill with the updated payment
        const updatedBill = await db.patientBills.findUnique({
            where: { id: parseInt(id) },
            include: {
                payment: {
                    include: {
                        patient: true
                    }
                },
                service: true
            }
        });

        // Send notification to the patient if the status changed
        if (status && status !== bill.payment.status) {
            let title = "";
            let message = "";
            
            switch (status) {
                case "PAID":
                    title = "Bill paid";
                    message = `The bill of ${bill.total_cost} RON has been marked as paid.`;
                    break;
                case "PART":
                    title = "Bill partially paid";
                    message = `The bill of ${bill.total_cost} RON has been partially paid.`;
                    break;
                case "UNPAID":
                    title = "Bill unpaid";
                    message = `The bill of ${bill.total_cost} RON has been marked as unpaid.`;
                    break;
            }

            if (title && bill.payment.patient_id) {
                try {
                    await createNotification({
                        title,
                        message,
                        type: "payment",
                        userId: bill.payment.patient_id,
                        link: `/patient/self?cat=payments`,
                    });
                } catch (notificationError) {
                    console.error("Failed to create payment notification:", notificationError);
                }
            }
        }

        return NextResponse.json(updatedBill);
    } catch (error) {
        console.error("Error updating bill:", error);
        return NextResponse.json(
            { error: "Failed to update bill" },
            { status: 500 }
        );
    }
}