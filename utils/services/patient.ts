import db from "@/lib/db";
import { CANCELLED } from "dns";
import { availableMemory } from "process";


export async function getPatientDashboardStatistics(id: string) {
    try {
        if (!id) {
            return { success: false, message: "Patient ID is required", status: 400 };
        }
        const data = await db.patient.findUnique({
            where: { id },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                gender: true,
                phone: true,
                img: true,
            }
        });

        if (!data) {
            return { success: false, message: "Patient data not found", status: 200, data: null };
        }
        const appointments = await db.appointment.findMany({
            where: { patient_id: data?.id },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        img: true,
                        specialization: true,
                    },
                },
            },

            orderBy: { appointment_date: "desc" },
        });

        // TODO: process appointments info
        return {
            success: true,
            message: "Patient found",
            appointmentCounts: { CANCELLED: 0, PENDING: 0, SCHEDULED: 0, COMPLETED: 0 },
            totalAppointments: appointments.length,
            availableDoctors: null,
            last5Records: null,
            monthlyData: null,
            status: 200,
            data
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}

export async function getPatientById(id: string) {
    try {
        const patient = await db.patient.findUnique({
            where: { id },
        });
        if (!patient) {
            return { success: false, message: "Patient not found", status: 200, data: null };
        }

        return { success: true, message: "Patient found", status: 200, data: patient };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}