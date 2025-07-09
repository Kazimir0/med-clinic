"use server";

import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Define the review schema here to avoid import issues and ensure validation is always available
const reviewSchema = z.object({
  patient_id: z.string(), // Patient's unique identifier
  staff_id: z.string(),   // Staff (doctor/nurse) unique identifier
  rating: z.number().min(1).max(5), // Rating must be between 1 and 5
  comment: z
    .string()
    .min(1, "Review must be at least 10 characters long")
    .max(250, "Review must not exceed 250 characters"), // Comment length constraints
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

/**
 * Deletes a record and all related data by ID, based on the entity type.
 * Handles cascading deletes for related records and user deletion from Clerk if needed.
 * Returns a status object indicating success or failure.
 */
export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill" | "service" | "payment-method"
) {
  console.log(`Attempting to delete ${deleteType} with ID:`, id);

  try {
    switch (deleteType) {
      case "doctor":
        try {
          // Check if the doctor exists before attempting deletion
          const doctor = await db.doctor.findUnique({ where: { id } });
          if (!doctor) {
            return {
              success: false,
              message: `Doctor with ID ${id} not found`,
              status: 404,
            };
          }

          // Delete all records associated with this doctor in a transaction for consistency
          await db.$transaction([
            db.rating.deleteMany({ where: { staff_id: id } }), // Remove all ratings for this doctor
            db.appointment.deleteMany({ where: { doctor_id: id } }), // Remove all appointments for this doctor
            db.workingDays.deleteMany({ where: { doctor_id: id } }), // Remove all working days for this doctor
            db.doctor.delete({ where: { id } }) // Finally, delete the doctor record
          ]);

          // Attempt to delete the user from Clerk (authentication provider)
          try {
            const client = await clerkClient();
            await client.users.deleteUser(id);
          } catch (clerkError: unknown) {
            console.log("Error deleting user from Clerk (non-critical):", clerkError);
            // Continue even if Clerk deletion fails
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
          // Delete the staff record (add more cascading deletes here if needed)
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
          // Delete all records associated with this patient in a transaction
          await db.$transaction([
            db.rating.deleteMany({ where: { patient_id: id } }), // Remove all ratings by this patient
            db.appointment.deleteMany({ where: { patient_id: id } }), // Remove all appointments for this patient
            db.payment.deleteMany({ where: { patient_id: id } }), // Remove all payments by this patient
            db.medicalRecords.deleteMany({ where: { patient_id: id } }), // Remove all medical records for this patient
            db.patient.delete({ where: { id } }) // Finally, delete the patient record
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
          // Delete a payment record by its numeric ID
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
          // Optionally check if the service exists before deleting
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

          // Delete the service record
          await db.services.delete({
            where: { id: parseInt(id) }
          });
        } catch (err: unknown) {
          console.error("Error deleting service:", err);

          // Handle foreign key constraint errors (service is referenced elsewhere)
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
          // Delete a payment method by its numeric ID (assumes payment-method is stored in payment table)
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
        // Handle unknown delete types
        return {
          success: false,
          message: `Unknown delete type: ${deleteType}`,
          status: 400,
        };
    }

    // Delete user from Clerk if not already deleted above (for staff and patient)
    if (
      (deleteType === "staff" || deleteType === "patient") &&
      id
    ) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(id);
      } catch (clerkError: unknown) {
        console.log("Error deleting user from Clerk (non-critical):", clerkError);
        // Continue even if Clerk deletion fails
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

/**
 * Creates a new review for a staff member by a patient.
 * Validates input using Zod schema and inserts the review into the database.
 * Returns a status object indicating success or validation/database errors.
 */
export async function createReview(values: ReviewFormValues) {
  console.log("createReview called with:", values);

  try {
    // Validate input fields using Zod schema
    const validatedFields = reviewSchema.parse(values);
    console.log("Validated fields:", validatedFields);

    // Insert the review into the database
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

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        status: 400,
      };
    }

    // Handle other errors (e.g., database errors)
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}