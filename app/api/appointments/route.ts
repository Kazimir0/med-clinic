import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { createNotification } from "@/utils/server-notifications";

/**
 * POST: Creates a new appointment between a doctor and a patient.
 * - Authenticates the user.
 * - Creates the appointment in the database.
 * - Sends notifications to both patient and doctor about the new appointment.
 * Returns the created appointment and notification info.
 */
export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body for appointment details
        const data = await request.json();
        const { doctor_id, patient_id, appointment_date, time, notes } = data;

        // Log for debugging
        console.log("========= CREATING APPOINTMENT =========");
        console.log("Patient ID:", patient_id);
        console.log("Doctor ID:", doctor_id);

        // Create the appointment in the database
        const appointment = await db.appointment.create({
            data: {
                appointment_date: new Date(appointment_date),
                time,
                note: notes,
                status: "PENDING",
                type: "CONSULTATION",
                doctor: {
                    connect: {
                        id: String(doctor_id)
                    }
                },
                patient: {
                    connect: {
                        id: String(patient_id)
                    }
                }
            },
            include: {
                doctor: true,
                patient: true
            }
        });
        console.log("Appointment created successfully, ID:", appointment.id);

        // Create notification for the patient
        let patientNotification = null;
        try {
            patientNotification = await db.notification.create({
                data: {
                    title: "New Appointment",
                    message: `Appointment created for ${format(new Date(appointment_date), 'dd MMMM yyyy', { locale: ro })} at ${time}.`,
                    type: "appointment",
                    user_id: patient_id,
                    read: false,
                    link: `/record/appointments/${appointment.id}`,
                    data: JSON.stringify({
                        appointmentId: appointment.id,
                        doctorId: doctor_id,
                        date: appointment_date,
                        time: time
                    })
                }
            });
            console.log("Patient notification created directly, ID:", patientNotification.id);
        } catch (error) {
            console.error("Failed to create patient notification:", error);
        }

        // Create notification for the doctor
        let doctorNotification = null;
        try {
            doctorNotification = await db.notification.create({
                data: {
                    title: "New Appointment",
                    message: `You have a new appointment on ${format(new Date(appointment_date), 'dd MMMM yyyy', { locale: ro })} at ${time}.`,
                    type: "appointment",
                    user_id: doctor_id,
                    read: false,
                    link: `/record/appointments/${appointment.id}`,
                    data: JSON.stringify({
                        appointmentId: appointment.id,
                        patientId: patient_id,
                        date: appointment_date,
                        time: time
                    })
                }
            });
            console.log("Doctor notification created directly, ID:", doctorNotification.id);
        } catch (error) {
            console.error("Failed to create doctor notification:", error);
        }

        // Return the created appointment and notification info
        return NextResponse.json({
            success: true,
            message: "Appointment created successfully",
            appointment,
            notifications: {
                patient: patientNotification ? {
                    id: patientNotification.id,
                    title: patientNotification.title
                } : null,
                doctor: doctorNotification ? {
                    id: doctorNotification.id,
                    title: doctorNotification.title
                } : null
            }
        });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            { error: "Failed to create appointment" },
            { status: 500 }
        );
    }
}

/**
 * PATCH: Updates an existing appointment's status or details.
 * - Authenticates the user.
 * - Updates the appointment in the database.
 * - Sends notifications to patient and doctor if the status changes.
 * Returns the updated appointment.
 */
export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body for update details
        const data = await request.json();
        const { id, status, ...otherData } = data;

        // Find the existing appointment
        const existingAppointment = await db.appointment.findUnique({
            where: { id: parseInt(id) },
            include: {
                doctor: true,
                patient: true
            }
        });

        if (!existingAppointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
        }

        // Update the appointment in the database
        const updatedAppointment = await db.appointment.update({
            where: { id: parseInt(id) },
            data: {
                status,
                ...otherData
            },
            include: {
                doctor: true,
                patient: true
            }
        });

        // Send notifications if the status changed
        if (status && status !== existingAppointment.status) {
            let title = "";
            let message = "";

            switch (status) {
                case "CONFIRMED":
                    title = "Appointment Confirmed";
                    message = `The appointment on ${format(new Date(existingAppointment.appointment_date), 'dd MMMM yyyy', { locale: ro })} at ${existingAppointment.time} has been confirmed.`;
                    break;
                case "COMPLETED":
                    title = "Appointment Completed";
                    message = `The appointment on ${format(new Date(existingAppointment.appointment_date), 'dd MMMM yyyy', { locale: ro })} at ${existingAppointment.time} has been completed.`;
                    break;
                case "CANCELLED":
                    title = "Appointment Cancelled";
                    message = `The appointment on ${format(new Date(existingAppointment.appointment_date), 'dd MMMM yyyy', { locale: ro })} at ${existingAppointment.time} has been cancelled.`;
                    break;
            }

            if (title) {
                // Get patient and doctor IDs for notifications
                const patientId = existingAppointment.patient?.id;
                const doctorId = existingAppointment.doctor?.id;

                // Notification for patient
                if (patientId) {
                    console.log("Creating notification for patient with ID:", patientId);
                    try {
                        const patientNotification = await createNotification({
                            title,
                            message,
                            type: "appointment",
                            userId: patientId,
                            link: `/record/appointments/${existingAppointment.id}`,
                        });
                        console.log("Patient notification created with ID:", patientNotification?.id || "unknown");
                    } catch (notificationError) {
                        console.error("Failed to create patient notification:", notificationError);
                        console.error("Notification error details:", notificationError instanceof Error ? notificationError.message : "Unknown error");
                    }
                }

                // Notification for doctor
                if (doctorId) {
                    console.log("Creating notification for doctor with ID:", doctorId);
                    try {
                        const doctorNotification = await createNotification({
                            title,
                            message: message.replace("dumneavoastră", "cu pacientul"),
                            type: "appointment",
                            userId: doctorId,
                            link: `/record/appointments/${existingAppointment.id}`,
                        });
                        console.log("Doctor notification created with ID:", doctorNotification?.id || "unknown");
                    } catch (notificationError) {
                        console.error("Failed to create doctor notification:", notificationError);
                        console.error("Notification error details:", notificationError instanceof Error ? notificationError.message : "Unknown error");
                    }
                }
            }
        }

        return NextResponse.json(updatedAppointment);
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json(
            { error: "Failed to update appointment" },
            { status: 500 }
        );
    }
}