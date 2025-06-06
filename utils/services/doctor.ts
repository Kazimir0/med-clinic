import db from "@/lib/db";

export async function getDoctors() {
    try {
        const data = await db.doctor.findMany()

        return { success: true, message: "Doctor found", status: 200, data };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Internal server error", status: 500 };
    }
}