import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { createNotification } from '@/utils/server-notifications';

export async function POST(req: NextRequest) {
    try {
        console.log("Processing payment request");
        const authSession = await auth();
        const userId = authSession.userId;
        if (!userId) {
            console.log("Authentication failed: No user ID");
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { paymentId } = body;
        console.log("Payment ID received:", paymentId);

        if (!paymentId) {
            console.log("No payment ID provided");
            return NextResponse.json(
                { error: 'Payment ID is required' },
                { status: 400 }
            );
        }

        const payment = await db.payment.findUnique({
            where: { id: parseInt(paymentId) },
            include: {
                appointment: {
                    include: {
                        doctor: true,
                        patient: true
                    }
                }
            }
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        const amountDue = payment.total_amount - payment.discount - payment.amount_paid;
        if (amountDue <= 0) {
            return NextResponse.json(
                { error: 'Payment is already completed' },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'ron',
                        product_data: {
                            name: `Medical Services Payment #${payment.id}`,
                            description: `Payment for appointment with Dr. ${payment.appointment.doctor.name} on ${new Date(payment.appointment.appointment_date).toLocaleDateString()}`,
                        },
                        unit_amount: Math.round(amountDue * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/record/appointments/${payment.appointment_id}?cat=payments`,
            metadata: {
                paymentId: payment.id.toString(),
                appointmentId: payment.appointment_id.toString(),
            },
        });

        try {
            await createNotification({
                title: "Plată inițiată",
                message: `O plată în valoare de ${amountDue} RON a fost inițiată pentru serviciile medicale.`,
                type: "payment",
                userId: payment.appointment.patient.id, // Asigură-te că acest câmp există
                link: `/record/appointments/${payment.appointment_id}?cat=payments`,
                data: {
                    paymentId: payment.id,
                    appointmentId: payment.appointment_id,
                    amount: amountDue
                }
            });
        } catch (notificationError) {
            // Doar logăm eroarea, nu întrerupem fluxul principal
            console.error("Failed to create notification:", notificationError);
        }

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe session creation error:', error);

        let errorMessage = 'Failed to create checkout session';
        if (error instanceof Error) {
            errorMessage = `Error: ${error.message}`;
            console.error(`Stack trace: ${error.stack}`);
        }
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}