import db from "@/lib/db";
import { createNotification } from "@/utils/server-notifications";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// POST - Create a new bill
export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { patient_id, service_id, quantity, unit_cost, total_cost, service_date } = data;

        // First we need to create a payment, because PatientBills requires a reference to Payment
        const payment = await db.payment.create({
            data: {
                patient_id,
                appointment_id: data.appointment_id, // Assuming it's provided
                bill_date: new Date(),
                payment_date: new Date(),
                discount: 0, // Default value or from request
                total_amount: total_cost,
                amount_paid: 0, // Initially 0 because it's unpaid
                status: "UNPAID",
                payment_method: "CASH" // Or from request
            }
        });

        // Then we create the bill that references this payment
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

        // Create notification for the bill
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

// GET - Get bills for a patient or all bills
export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get("patientId");
        const status = searchParams.get("status");

        // For PatientBills, we need to filter through payment
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

// PATCH - Update the status of a bill (actually updating the Payment)
export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { id, status, amount_paid } = data;

        // Find the bill
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

        // Create notifications based on status change
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