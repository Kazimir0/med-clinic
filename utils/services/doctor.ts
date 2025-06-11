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

export async function getDoctorById(id: string) {
  try {
    const [doctor, totalAppointment] = await Promise.all([
      db.doctor.findUnique({
        where: { id },
        include: {
          working_days: true,
          appointments: {
            include: {
              patient: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  gender: true,
                  img: true,
                  colorCode: true,
                  date_of_birth: true,
                },
              },
              doctor: {
                select: {
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
            take: 10, // Limit to the last 10 appointments
          },
        },
      }),
      db.appointment.count({
        where: { doctor_id: id },
      }),
    ]);

    return { data: doctor, totalAppointment };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}


export async function getRatingById(id: string) {
  try {
    const data = await db.rating.findMany({
      where: { staff_id: id },
      include: {
        patient: {
          select: {
            last_name: true,
            first_name: true,
          }
        }
      },
    });

    const totalRatings = data?.length; // Get total number of ratings

    const sumRatings = data?.reduce((sum, el) => sum + el.rating, 0); // Sum all ratings

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0; // If totalRatings is greater than 0, calculate average, otherwise set to 0

    const formattedRatings = (Math.round(averageRating * 10) / 10).toFixed(1); // Round to one decimal place

    return { totalRatings, averageRating: formattedRatings, ratings: data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}


export async function getAllDoctors({ page, limit, search }: { page: number | string, limit?: number | string, search?: string }) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page); // If page is less than or equal to 0, set it to 1 OR if not will take the page number from the request
    const LIMIT = Number(limit) || 10; // If limit is not provided, default to 10
    const SKIP = (PAGE_NUMBER - 1) * LIMIT; // Calculate the number of records to skip based on the page number and limit

    const [doctors, totalRecords] = await Promise.all([
      db.doctor.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { specialization: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: { working_days: true },
        skip: SKIP, // Skip the records based on the page number
        take: LIMIT, // Limit the number of records returned
      }),
      db.doctor.count(),
    ]);
    const totalPages = Math.ceil(totalRecords / LIMIT); // Calculate total pages based on total records and limit 


    return { success: true, status: 200, data: doctors, totalRecords, totalPages, currentPage: PAGE_NUMBER };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}