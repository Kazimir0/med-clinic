"use server"

import { VitalSignsFormData } from "@/components/dialogs/add-vitals-signs";
import db from "@/lib/db";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";

// Update appointment status and reason
export async function appointmentAction(id: string | number, status: AppointmentStatus, reason: string) {
    try {
        await db.appointment.update({
            where: { id: Number(id) },
            data: {
                status: status,
                reason: reason
            },
        });

        return { success: true, error: false, msg: `Appointment has been ${status.toLowerCase()}` };
    } catch (error) {
        console.error(error);
        return { success: false, msg: "Internal server error", error: true };
    }

}

// Create a new appointment
export async function createNewAppointment(data: any) {
    try {
        const validatedData = AppointmentSchema.safeParse(data);

        // Check if the data is valid
        // If not, return an error message
        if (!validatedData.success) {
            return { success: false, msg: "Invalid data", }
        }


        const validated = validatedData.data;

        await db.appointment.create({
            data: {
                patient_id: data.patient_id,
                doctor_id: validated.doctor_id,
                time: validated.time,
                type: validated.type,
                status: "PENDING",
                appointment_date: new Date(validated.appointment_date),
                note: validated.note,
            },
        });
        return {
            success: true,
            msg: "Appointment created successfully",
        };

    } catch (error) {
        console.error(error);
        return { success: false, msg: "Internal server error", error: true };
    }

}

// Add vital signs to a medical record (creates record if needed)
export async function addVitalSigns(data: VitalSignsFormData, appointmentId: string, doctorId: string) {
    try {
        const { userId } = await auth();

        if (!userId) {
            // Only authenticated users can add vital signs
            return { success: false, msg: "Unauthorized" };
        }

        const validatedData = VitalSignsSchema.parse(data);

        let medicalRecord = null;

        // Check if the medical record already exists for the appointment
        if (!validatedData.medical_id) {
            medicalRecord = await db.medicalRecords.create({
                data: {
                    patient_id: validatedData.patient_id,
                    appointment_id: Number(appointmentId),
                    doctor_id: doctorId,
                },
            });
        }

        const med_id = validatedData.medical_id || medicalRecord?.id;

        await db.vitalSigns.create({
            data: {
                ...validatedData,
                medical_id: Number(med_id!),
            },
        });

        return {
            success: true,
            msg: "Vital signs added successfully",
        };
    } catch (error) {
        console.log(error);
        return { success: false, msg: "Internal Server Error" };
    }
}