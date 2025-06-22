"use server";

import db from "@/lib/db";
import { createNotification } from "@/utils/server-notifications";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function processPayment(paymentId: string, method: "CASH" | "CARD") {
  try {
    const paymentIdNum = parseInt(paymentId);
    
    // Verifică dacă plata există
    const payment = await db.payment.findUnique({
      where: { id: paymentIdNum }
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found"
      };
    }

    // Calculează suma datorată
    const amountDue = payment.total_amount - payment.discount - payment.amount_paid;
    
    if (amountDue <= 0) {
      return {
        success: false,
        message: "This bill is already paid in full"
      };
    }

    // Actualizează plata în baza de date
    const updatedPayment = await db.payment.update({
      where: { id: paymentIdNum },
      data: {
        payment_method: method as PaymentMethod,
        amount_paid: payment.total_amount - payment.discount, // Plătește întreaga sumă
        status: PaymentStatus.PAID,
      }
    });

    // Revalidează calea pentru a actualiza UI-ul
    revalidatePath(`/record/appointments/${payment.appointment_id}`);
    
    return {
      success: true,
      data: updatedPayment
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      message: "Failed to process payment. Please try again."
    };
  }
}

export async function markPaymentCompleted(
  paymentId: string, 
  stripeSessionId: string, 
  paymentMethod: 'CASH' | 'CARD'
) {
  try {
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
      return { success: false, message: 'Payment not found' };
    }

    const amountDue = payment.total_amount - payment.discount - payment.amount_paid;
    
    const updatedPayment = await db.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: 'PAID',
        amount_paid: payment.total_amount - payment.discount,
        payment_method: paymentMethod,
        stripe_session_id: stripeSessionId
      }
    });
    
    // Creează notificarea pentru pacient
    await createNotification({
      title: "Plată finalizată",
      message: `Plata în valoare de ${amountDue.toFixed(2)} RON pentru programarea din ${new Date(payment.appointment.appointment_date).toLocaleDateString()} a fost procesată cu succes.`,
      type: "payment",
      userId: payment.appointment.patient.id,
      link: `/record/appointments/${payment.appointment_id}?cat=payments`,
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointment_id,
        amount: amountDue
      }
    });
    
    // Creează notificarea pentru doctor
    await createNotification({
      title: "Plată nouă primită",
      message: `Pacientul ${payment.appointment.patient.first_name} ${payment.appointment.patient.last_name} a efectuat o plată de ${amountDue.toFixed(2)} RON pentru programarea din ${new Date(payment.appointment.appointment_date).toLocaleDateString()}.`,
      type: "payment",
      userId: payment.appointment.doctor.id,
      link: `/record/appointments/${payment.appointment_id}?cat=payments`,
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointment_id,
        amount: amountDue
      }
    });

    revalidatePath(`/record/appointments/${payment.appointment_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error marking payment as completed:', error);
    return { success: false, message: 'An error occurred while updating the payment' };
  }
}