"use server";

import db from "@/lib/db";
import { createNotification } from "@/utils/server-notifications";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Processes a payment for a bill by its ID and payment method.
 * - Checks if the payment exists and if the bill is already paid.
 * - Updates the payment record to mark it as paid in full.
 * - Revalidates the appointment path to update the UI.
 * Returns a status object and the updated payment data.
 */
export async function processPayment(paymentId: string, method: "CASH" | "CARD") {
  try {
    const paymentIdNum = parseInt(paymentId);
    
    // Check if the payment exists
    const payment = await db.payment.findUnique({
      where: { id: paymentIdNum }
    });

    if (!payment) {
      return {
        success: false,
        message: "Payment not found"
      };
    }

    // Calculate the amount due for the bill
    const amountDue = payment.total_amount - payment.discount - payment.amount_paid;
    
    if (amountDue <= 0) {
      return {
        success: false,
        message: "This bill is already paid in full"
      };
    }

    // Update the payment record to mark as paid
    const updatedPayment = await db.payment.update({
      where: { id: paymentIdNum },
      data: {
        payment_method: method as PaymentMethod,
        amount_paid: payment.total_amount - payment.discount, // Pay the full remaining amount
        status: PaymentStatus.PAID,
      }
    });

    // Revalidate the appointment path to update the UI
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

/**
 * Marks a payment as completed (used for Stripe or manual payments).
 * - Updates the payment record as paid and stores the Stripe session ID if provided.
 * - Sends notifications to both patient and doctor about the payment.
 * - Revalidates the appointment path to update the UI.
 * Returns a status object indicating success or failure.
 */
export async function markPaymentCompleted(
  paymentId: string, 
  stripeSessionId: string, 
  paymentMethod: 'CASH' | 'CARD'
) {
  try {
    // Find the payment and include related appointment, doctor, and patient
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

    // Calculate the amount due for notification
    const amountDue = payment.total_amount - payment.discount - payment.amount_paid;
    
    // Update the payment record as paid and store Stripe session ID
    const updatedPayment = await db.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: 'PAID',
        amount_paid: payment.total_amount - payment.discount,
        payment_method: paymentMethod,
        stripe_session_id: stripeSessionId
      }
    });
    
    // Create notification for the patient
    await createNotification({
      title: "Payment Completed",
      message: `A payment of ${amountDue.toFixed(2)} RON for the appointment on ${new Date(payment.appointment.appointment_date).toLocaleDateString()} was successfully processed.`,
      type: "payment",
      userId: payment.appointment.patient.id,
      link: `/record/appointments/${payment.appointment_id}?cat=payments`,
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointment_id,
        amount: amountDue
      }
    });
    
    // Create notification for the doctor
    await createNotification({
      title: "New Payment Received",
      message: `Patient ${payment.appointment.patient.first_name} ${payment.appointment.patient.last_name} made a payment of ${amountDue.toFixed(2)} RON for the appointment on ${new Date(payment.appointment.appointment_date).toLocaleDateString()}.`,
      type: "payment",
      userId: payment.appointment.doctor.id,
      link: `/record/appointments/${payment.appointment_id}?cat=payments`,
      data: {
        paymentId: payment.id,
        appointmentId: payment.appointment_id,
        amount: amountDue
      }
    });

    // Revalidate the appointment path to update the UI
    revalidatePath(`/record/appointments/${payment.appointment_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error marking payment as completed:', error);
    return { success: false, message: 'An error occurred while updating the payment' };
  }
}