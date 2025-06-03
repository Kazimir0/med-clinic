"use server"

import db from "@/lib/db";
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

