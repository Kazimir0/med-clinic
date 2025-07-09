"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Updates an existing patient's information in both Clerk (authentication) and the database.
 * - Validates input data using Zod schema.
 * - Updates user's name in Clerk.
 * - Updates patient record in the database.
 */
export async function updatePatient(data: any, pid: string) {
    try {
        // Validate input fields
        const validatedData = PatientFormSchema.safeParse(data)

        if (!validatedData.success) {
            return {
                success: false,
                error: true,
                msg: "Provide all required fields",
            };
        }

        const patientData = validatedData.data;
        const client = await clerkClient();

        // Update user's name in Clerk
        await client.users.updateUser(pid,{
                firstName: patientData.first_name,
                lastName: patientData.last_name,
        });
        
        // Update patient record in the database
        await db.patient.update({
            data:{...patientData},
            where: {id: pid},
        })
        return {success: true, error: false, msg: "Patient info updated successfully"}

    } catch (error: any) {
        console.error("Error creating new patient:", error);
        return {success: false, error: true, msg: error?.message};
    }
}

/**
 * Creates a new patient user and record.
 * - If pid is 'new-patient', creates a new user in Clerk and sets role to 'patient'.
 * - Otherwise, updates existing user metadata.
 * - Creates the patient record in the database.
 */
export async function createNewPatient(data: any, pid: string) {
    try {
        // Validate input fields
        const validatedData = PatientFormSchema.safeParse(data)
        if (!validatedData.success) {
            return {
                success: false,
                error: true,
                msg: "Provide all required fields",
            };
        }
        const patientData = validatedData.data;
        let patient_id = pid;

        const client = await clerkClient();
        if(pid === "new-patient"){
            // Create a new user in Clerk for the patient
            const user = await client.users.createUser({
                emailAddress: [patientData.email],
                password: patientData.phone,
                firstName: patientData.first_name,
                lastName: patientData.last_name,
                publicMetadata: {role: "patient"}
            });
            patient_id = user?.id;
        }else {
            // Update existing user's metadata to set role as patient
            await client.users.updateUser(pid,{
                publicMetadata: {role: "patient"}
            });
        }

        // Create the patient record in the database
        await db.patient.create({
            data:{...patientData, id: patient_id,}
        })

        return {success: true, error: false, msg: "Patient created successfully"}

    } catch (error: any) {
        console.error("Error creating new patient:", error);
        return {success: false, error: true, msg: error?.message};
    }
}