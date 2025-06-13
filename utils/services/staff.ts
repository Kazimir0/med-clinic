import db from "@/lib/db";

export async function getAllStaff({ page, limit, search }: { page: number | string, limit?: number | string, search?: string }) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page); // If page is less than or equal to 0, set it to 1 OR if not will take the page number from the request
    const LIMIT = Number(limit) || 10; // If limit is not provided, default to 10
    const SKIP = (PAGE_NUMBER - 1) * LIMIT; // Calculate the number of records to skip based on the page number and limit

    const [staff, totalRecords] = await Promise.all([
      db.staff.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        skip: SKIP, // Skip the records based on the page number
        take: LIMIT, // Limit the number of records returned
      }),
      db.staff.count(),
    ]);
    
    const totalPages = Math.ceil(totalRecords / LIMIT); // Calculate total pages based on total records and limit 


    return { success: true, status: 200, data: staff, totalRecords, totalPages, currentPage: PAGE_NUMBER };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error", status: 500 };
  }
}