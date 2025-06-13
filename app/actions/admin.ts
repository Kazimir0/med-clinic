"use server";

import db from "@/lib/db";
import { DoctorSchema, StaffSchema, WorkingDaysSchema } from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { clerkClient } from "@clerk/nextjs/server";

export async function createNewDoctor(data: any) {
    try {
        const values = DoctorSchema.safeParse(data);

        const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);

        // console.log("DATA PRIMITA:", data);
        // If values and workingDaysValues are not valid, return an error message
        if (!values.success || !workingDaysValues.success) {
            return {
                success: false,
                error: true,
                message: "Please provide all required information.",
            };
        }


        const validatedValues = values.data;
        const workingDayData = workingDaysValues.data!;
        const client = await clerkClient();

        const user = await client.users.createUser({
            emailAddress: [validatedValues.email],
            password: validatedValues.password,
            firstName: validatedValues.name.split(" ")[0],
            lastName: validatedValues.name.split(" ")[1],
            publicMetadata: { role: "doctor" },
        });

        delete validatedValues["password"]; // Remove password from validated values before saving to the database because it's not needed there

        const doctor = await db.doctor.create({
            data: {
                ...validatedValues,
                id: user.id,
            },
        });

        // Promise all to create working days for the doctor
        await Promise.all(
            workingDayData?.map((el) =>
                db.workingDays.create({
                    data: { ...el, doctor_id: doctor.id },
                })
            )
        );
        return { success: true, message: "Doctor added successfully", error: false }

    } catch (error) {
        console.log(error);
        return { error: true, success: false, msg: "Something went wrong. Please try again", };
    }
}

export async function createNewStaff(data: any) {
    try {
        const values = StaffSchema.safeParse(data);
        if (!values.success) {
            return {
                success: false,
                error: true,
                message: "Please provide all required information.",
            };
        }


        const validatedValues = values.data;
        const client = await clerkClient();

        const user = await client.users.createUser({
            emailAddress: [validatedValues.email],
            password: validatedValues.password,
            firstName: validatedValues.name.split(" ")[0],
            lastName: validatedValues.name.split(" ")[1],
            publicMetadata: { role: "doctor" },
        });

        delete validatedValues["password"]; // Remove password from validated values before saving to the database because it's not needed there

        const doctor = await db.staff.create({
            data: {
                name: validatedValues.name,
                phone: validatedValues.phone,
                email: validatedValues.email,
                role: validatedValues.role,
                address: validatedValues.address,
                department: validatedValues.department,
                // img: validatedValues.img,
                license_number: validatedValues.license_number,
                status: 'ACTIVE', // Default status for new staff
                id: user.id, // Use the user ID from Clerk
                colorCode: generateRandomColor(), // Generate a random color
            },
        });
        return { success: true, message: "Staff added successfully", error: false }

    } catch (error) {
        console.log(error);
        return { error: true, success: false, msg: "Something went wrong. Please try again", };
    }
}
