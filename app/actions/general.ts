"use server";

import { ReviewFormValues, reviewSchema } from "@/components/dialogs/review-form";
import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function deleteDataById(id: string, deleteType: "doctor" | "staff" | "patient" | "payment") {
    try {
        switch (deleteType) {
            case "doctor":
                await db.doctor.delete({ where: { id: id } });
            case "staff":
                await db.staff.delete({ where: { id: id } });
            case "patient":
                await db.patient.delete({ where: { id: id } });
            case "payment":
                await db.payment.delete({ where: { id: Number(id) } });
            default:
                break;
        }

        // If deleteType is staff, patient, or doctor, we will delete the user from Clerk
        if (deleteType === "staff" || deleteType === "patient" || deleteType === "doctor") {
            const client = await clerkClient(); // Initialize Clerk client
            await client.users.deleteUser(id); // Delete user from Clerk
        }
        return { success: true, message: "Record deleted successfully", status: 200 };
    } catch (error) {
        console.log(error)
        return { success: false, message: "Internal Server Error", status: 500 };
    }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const validatedFields = reviewSchema.parse(values);

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}