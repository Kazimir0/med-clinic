import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { daysOfWeek } from "..";
import { processAppointments } from "./patient";

export async function getDoctors() {
  try {
    const data = await db.doctor.findMany();

    return { success: true, message: "Doctor found", status: 200, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}

export async function getDoctorDashboardStats() {
  try {
    const { userId } = await auth();
    const todayDate = new Date().getDay();
    const today = daysOfWeek[todayDate];

    // This code retrieves the total number of patients, nurses, appointments, and doctors
    const [totalPatient, totalNurses, appointments, doctors] =
      await Promise.all([
        db.patient.count(),
        db.staff.count({ where: { role: "NURSE" } }),
        // Fetches all appointments for the current doctor (userId) that have already occurred or are currently in progress.
        // This is done by checking if the appointment date is less than or equal to the current date.
        db.appointment.findMany({
          where: { doctor_id: userId!, appointment_date: { lte: new Date() } },
          include: {
            patient: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                gender: true,
                date_of_birth: true,
                phone: true,
                email: true,
                colorCode: true,
                img: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                img: true,
                colorCode: true,
              },
            },
          },
          orderBy: {
            appointment_date: "desc",
          },
        }),
        db.doctor.findMany({
          where: {
            working_days: {
              some: { day: { equals: today, mode: "insensitive" } },
            },
          },
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true,
            working_days: true,
          },
          take: 5,
        }),
      ]);

    const { appointmentCounts, monthlyData } = await processAppointments(
      appointments
    );

    // 'last5Records' will be used to display the last 5 appointments in the dashboard because the appointments are ordered by date in descending order.
    const last5Records = appointments.slice(0, 5);
    // const availableDoctors = doctors.slice(0, 5);

    return {
      totalNurses,
      totalPatient,
      appointmentCounts,
      last5Records,
      availableDoctors: doctors,
      totalAppointment: appointments?.length,
      monthlyData,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}
