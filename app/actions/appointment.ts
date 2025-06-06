"use server"

import db from "@/lib/db";
import { AppointmentSchema } from "@/lib/schema";
import { AppointmentStatus } from "@prisma/client";
import { error } from "console";

export async function appointmentAction(id: string | number, status: AppointmentStatus, reason: string) {
try {
    await db.appointment.update({
        where: { id: Number(id) },
        data:{
            status: status,
            reason: reason
        },
    });

    return { success: true, error:false, msg: `Appointment has been ${status.toLowerCase()}` };
} catch (error) {
    console.error(error);
    return { success: false, msg: "Internal server error", error: true };
  }
    
}

export async function createNewAppointment(data:any) {
try {
    const validatedData = AppointmentSchema.safeParse(data);

    // Check if the data is valid
    // If not, return an error message
    if (!validatedData.success) {
        return { success: false, msg: "Invalid data",}
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
    return{
        success: true,
        msg: "Appointment created successfully",
    };

} catch (error) {
    console.error(error);
    return { success: false, msg: "Internal server error", error: true };
  }
    
}
