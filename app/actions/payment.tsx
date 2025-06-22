"use server";

import db from "@/lib/db";
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

export async function markPaymentCompleted(paymentId: string, stripeSessionId: string, method: "CASH" | "CARD") {
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

    // Actualizează plata în baza de date
    const updatedPayment = await db.payment.update({
      where: { id: paymentIdNum },
      data: {
        payment_method: method as PaymentMethod,
        amount_paid: payment.total_amount - payment.discount,
        status: PaymentStatus.PAID,
        stripe_session_id: stripeSessionId 
      }
    });

    // Revalidează calea pentru a actualiza UI-ul
    revalidatePath(`/record/appointments/${payment.appointment_id}`);
    
    return {
      success: true,
      data: updatedPayment
    };
  } catch (error) {
    console.error("Payment completion error:", error);
    return {
      success: false,
      message: "Failed to mark payment as completed."
    };
  }
}