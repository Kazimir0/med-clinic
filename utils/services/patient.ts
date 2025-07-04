import db from "@/lib/db";
import { getMonth, startOfYear, endOfMonth, format } from "date-fns";
import { daysOfWeek } from "..";

type AppointmentStatus = "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface Appointment {
  status: AppointmentStatus;
  appointment_date: Date;
}

function isValidStatus(status: string): status is AppointmentStatus {
  return ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"].includes(status);
}

const initializeMonthlyData = () => {
  const this_year = new Date().getFullYear();

  const months = Array.from(
    { length: getMonth(new Date()) + 1 },
    (_, index) => ({
      name: format(new Date(this_year, index), "MMM"),
      appointment: 0,
      completed: 0,
    })
  );
  return months;
};

export const processAppointments = async (appointments: Appointment[]) => {
  const monthlyData = initializeMonthlyData();

  const appointmentCounts = appointments.reduce<
    Record<AppointmentStatus, number>
  >(
    (acc, appointment) => {
      const status = appointment.status;

      const appointmentDate = appointment?.appointment_date;

      const monthIndex = getMonth(appointmentDate);

      if (
        appointmentDate >= startOfYear(new Date()) &&
        appointmentDate <= endOfMonth(new Date())
      ) {
        monthlyData[monthIndex].appointment += 1;

        if (status === "COMPLETED") {
          monthlyData[monthIndex].completed += 1;
        }
      }

      // Grouping by status
      if (isValidStatus(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }

      return acc;
    },
    {
      PENDING: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
  );
  return { appointmentCounts, monthlyData };
};

export async function getPatientDashboardStatistics(id: string) {
  try {
    if (!id) {
      return { success: false, message: "No data found", data: null };
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
        patient: {
          select: {
            first_name: true,
            last_name: true,
            gender: true,
            date_of_birth: true,
            img: true,
          }
        }
      },

      orderBy: { appointment_date: "desc" },
    });

    const { appointmentCounts, monthlyData } = await processAppointments(appointments);
    const last5Records = appointments.slice(0, 5);

    const today = daysOfWeek[new Date().getDay()]

    const availableDoctor = await db.doctor.findMany({
      select: { id: true, name: true, img: true, specialization: true, working_days: true },
      where: {
        working_days: {
          some: {
            day: {
              equals: today,
              mode: "insensitive",
            }
          },
        },
      },
      take: 6,
    });
    // console.log(availableDoctor)
    return {
      success: true,
      appointmentCounts,
      totalAppointments: appointments.length,
      availableDoctor,
      last5Records,
      monthlyData,
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

export async function getPatientFullDataById(id: string) {
  try {
    const patient = await db.patient.findFirst({
      where: {
        OR: [
          {
            id,
          },
          { email: id },
        ],
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          select: {
            appointment_date: true,
          },
          orderBy: {
            appointment_date: "desc",
          },
          take: 1,
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        message: "Patient data not found",
        status: 404,
      };
    }
    const lastVisit = patient.appointments[0]?.appointment_date || null;

    return {
      success: true,
      data: {
        ...patient,
        totalAppointments: patient._count.appointments,
        lastVisit,
      },
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getAllPatients({ page, limit, search }: { page: number | string, limit?: number | string, search?: string }) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page); // If page is less than or equal to 0, set it to 1 OR if not will take the page number from the request
    const LIMIT = Number(limit) || 10; // If limit is not provided, default to 10
    const SKIP = (PAGE_NUMBER - 1) * LIMIT; // Calculate the number of records to skip based on the page number and limit

    const [patients, totalRecords] = await Promise.all([
      db.patient.findMany({
        where: {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          appointments: {
            select: {
              medical: {
                select: {
                  created_at: true, treatment_plan: true
                },
                orderBy: { created_at: "desc" },
                take: 1, // Get the most recent medical record
              },
            },
            orderBy: { appointment_date: "desc" }, // Order by appointment date
            take: 1, // Get the most recent appointment
          }
        },
        skip: SKIP, // Skip the records based on the page number
        take: LIMIT, // Limit the number of records returned
        orderBy: { first_name: "asc" },
      }),
      db.patient.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT); // Calculate total pages based on total records and limit 


    return { success: true, status: 200, data: patients, totalRecords, totalPages, currentPage: PAGE_NUMBER };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}