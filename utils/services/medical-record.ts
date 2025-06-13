import db from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getMedicalRecords({ page, limit, search }: { page: number | string, limit?: number | string, search?: string }) {
    try {
        const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page); // If page is less than or equal to 0, set it to 1 OR if not will take the page number from the request
        const LIMIT = Number(limit) || 10; // If limit is not provided, default to 10
        const SKIP = (PAGE_NUMBER - 1) * LIMIT; // Calculate the number of records to skip based on the page number and limit

        const where: Prisma.MedicalRecordsWhereInput = {
            OR: [
                {
                    patient: {
                        first_name: { contains: search, mode: "insensitive" }
                    }
                },
                {
                    patient: {
                        last_name: { contains: search, mode: "insensitive" }
                    }
                },
                {
                    patient_id: {
                        contains: search, mode: "insensitive"
                    }
                },
            ],
        };

        const [data, totalRecords] = await Promise.all([
            db.medicalRecords.findMany({
                where: where,
                include: {
                    patient: {
                        select: {
                            first_name: true,
                            last_name: true,
                            date_of_birth: true,
                            img: true,
                            colorCode: true,
                            gender: true,
                        },
                    },
                    diagnosis: {
                        include: {
                            doctor: {
                                select: {
                                    name: true,
                                    specialization: true,
                                    img: true,
                                    colorCode: true,
                                }
                            }
                        }
                    },
                    lab_test: true
                },
                skip: SKIP, // Skip the records based on the page number
                take: LIMIT, // Limit the number of records returned
                orderBy: { created_at: "desc" },
            }),
            db.medicalRecords.count({
                // where: where
                where
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / LIMIT); // Calculate total pages based on total records and limit 


        return { success: true, status: 200, data, totalRecords, totalPages, currentPage: PAGE_NUMBER };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}