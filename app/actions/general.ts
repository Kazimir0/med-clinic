"use server";

import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Definim schema direct în acest fișier pentru a evita problemele de import
const reviewSchema = z.object({
  patient_id: z.string(),
  staff_id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(1, "Review must be at least 10 characters long")
    .max(250, "Review must not exceed 250 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill" | "service" | "payment-method"
) {
  console.log(`Attempting to delete ${deleteType} with ID:`, id);

  try {
    switch (deleteType) {
      case "doctor":
        try {
          // Verifica daca doctorul exista
          const doctor = await db.doctor.findUnique({ where: { id } });
          if (!doctor) {
            return {
              success: false,
              message: `Doctor with ID ${id} not found`,
              status: 404,
            };
          }

          // Sterge mai intai toate înregistrările asociate
          await db.$transaction([
            // Sterge toate rating-urile asociate cu acest doctor
            db.rating.deleteMany({ where: { staff_id: id } }),

            // Sterge toate programarile asociate cu acest doctor
            db.appointment.deleteMany({ where: { doctor_id: id } }),

            // Sterge zilele de lucru asociate cu acest doctor
            db.workingDays.deleteMany({ where: { doctor_id: id } }),

            // La final, sterge inregistrarea doctorului
            db.doctor.delete({ where: { id } })
          ]);

          // Sterge din Clerk
          try {
            const client = await clerkClient();
            await client.users.deleteUser(id);
          } catch (clerkError: unknown) {
            console.log("Error deleting user from Clerk (non-critical):", clerkError);
            // Continuam chiar daca stergerea din Clerk esueaza
          }
        } catch (err: unknown) {
          console.error("Error deleting doctor:", err);
          return {
            success: false,
            message: err instanceof Prisma.PrismaClientKnownRequestError
              ? `Database error: ${err.message}`
              : `Failed to delete doctor: ${err instanceof Error ? err.message : String(err)}`,
            status: 500,
          };
        }
        break;

      case "staff":
        try {
          // Sterge mai intai toate inregistrarile asociate
          await db.$transaction([
            db.staff.delete({ where: { id } })
          ]);
        } catch (err: unknown) {
          console.error("Error deleting staff:", err);
          return {
            success: false,
            message: `Failed to delete staff: ${err instanceof Error ? err.message : String(err)}`,
            status: 500,
          };
        }
        break;

      case "patient":
        try {
          // Sterge mai intai toate inregistrarile asociate
          await db.$transaction([
            db.rating.deleteMany({ where: { patient_id: id } }),
            db.appointment.deleteMany({ where: { patient_id: id } }),
            db.payment.deleteMany({ where: { patient_id: id } }),
            db.medicalRecords.deleteMany({ where: { patient_id: id } }),
            db.patient.delete({ where: { id } })
          ]);
        } catch (err: unknown) {
          console.error("Error deleting patient:", err);
          return {
            success: false,
            message: `Failed to delete patient: ${err instanceof Error ? err.message : String(err)}`,
            status: 500,
          };
        }
        break;

      case "payment":
        try {
          await db.payment.delete({ where: { id: Number(id) } });
        } catch (err: unknown) {
          console.error("Error deleting payment:", err);
          return {
            success: false,
            message: `Failed to delete payment: ${err instanceof Error ? err.message : String(err)}`,
            status: 500,
          };
        }
        break;

      case "service":
        try {
          // Opțional: poți verifica mai întâi dacă serviciul există
          const existingService = await db.services.findUnique({
            where: { id: parseInt(id) }
          });

          if (!existingService) {
            return {
              success: false,
              message: `Service with ID ${id} not found`,
              status: 404,
            };
          }

          // Șterge serviciul
          await db.services.delete({
            where: { id: parseInt(id) }
          });
        } catch (err: unknown) {
          console.error("Error deleting service:", err);

          // Poți detecta erori specifice legate de relații (foreign key constraints)
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
            return {
              success: false,
              message: `Cannot delete service because it is referenced by other records`,
              status: 400,
            };
          }

          return {
            success: false,
            message: `Failed to delete service: ${err instanceof Error ? err.message : String(err)}`,
            status: 500,
          };
        }
        break;
      
      case "payment-method":
        try {
          await db.payment.delete({
            where: { id: parseInt(id) }
          });
          return { success: true, message: "Payment method deleted successfully" };
        } catch (err) {
          console.error("Error deleting payment method:", err);
          return {
            success: false,
            message: `Failed to delete payment method: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
        break;

      default:
        return {
          success: false,
          message: `Unknown delete type: ${deleteType}`,
          status: 400,
        };
    }

    // Șterge user-ul din Clerk dacă nu a fost deja șters în case-urile de mai sus
    if (
      (deleteType === "staff" || deleteType === "patient") &&
      id
    ) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(id);
      } catch (clerkError: unknown) {
        console.log("Error deleting user from Clerk (non-critical):", clerkError);
        // Continuăm chiar dacă ștergerea din Clerk eșuează
      }
    }

    return {
      success: true,
      message: `${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully`,
      status: 200,
    };
  } catch (error: unknown) {
    console.error("Error in deleteDataById:", error);

    return {
      success: false,
      message: error instanceof Error
        ? `Internal Server Error: ${error.message}`
        : "Unknown error occurred",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  console.log("createReview called with:", values);

  try {
    // Validăm datele cu schema Zod
    const validatedFields = reviewSchema.parse(values);
    console.log("Validated fields:", validatedFields);

    // Creăm review-ul în baza de date
    const result = await db.rating.create({
      data: {
        patient_id: validatedFields.patient_id,
        staff_id: validatedFields.staff_id,
        rating: validatedFields.rating,
        comment: validatedFields.comment,
      },
    });

    console.log("Database result:", result);

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error in createReview:", error);

    // Dacă este o eroare de validare Zod
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        status: 400,
      };
    }

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}