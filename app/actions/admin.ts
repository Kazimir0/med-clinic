"use server";

import db from "@/lib/db";
import { DoctorSchema, ServicesSchema, StaffSchema, WorkingDaysSchema } from "@/lib/schema";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function createNewDoctor(data: any) {
  try {
    const values = DoctorSchema.safeParse(data);
    const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);

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

    // Create user in Clerk
    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName: validatedValues.name.split(" ")[0],
      lastName: validatedValues.name.split(" ")[1],
      publicMetadata: { role: "doctor" },
    });

    delete validatedValues["password"]; // Remove password before saving to DB

    // Create doctor in local database
    const doctor = await db.doctor.create({
      data: {
        ...validatedValues,
        id: user.id,
      },
    });

    // Create working days for the doctor
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
    const { userId } = await auth();

    if (!userId) {
      // Only authenticated users can create staff
      return { success: false, msg: "Unauthorized" };
    }

    const isAdmin = await checkRole("ADMIN");

    if (!isAdmin) {
      // Only admins can create staff
      return { success: false, msg: "Unauthorized" };
    }

    const values = StaffSchema.safeParse(data);

    if (!values.success) {
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;

    // Create user in Clerk
    const client = await clerkClient();
    const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName: validatedValues.name.split(" ")[0],
      lastName: validatedValues.name.split(" ")[1],
      publicMetadata: { role: "doctor" },
    });

    delete validatedValues["password"];

    // Create staff in local database
    const doctor = await db.staff.create({
      data: {
        name: validatedValues.name,
        phone: validatedValues.phone,
        email: validatedValues.email,
        address: validatedValues.address,
        role: validatedValues.role,
        license_number: validatedValues.license_number,
        department: validatedValues.department,
        colorCode: generateRandomColor(),
        id: user.id,
        status: "ACTIVE",
      },
    });

    return {
      success: true,
      message: "Doctor added successfully",
      error: false,
    };
  } catch (error) {
    console.log(error);
    return { error: true, success: false, message: "Something went wrong" };
  }
}

export async function addNewService(data: any) {
  try {
    const isValidData = ServicesSchema.safeParse(data);

    const validatedData = isValidData.data;

    await db.services.create({
      data: { ...validatedData!, price: Number(data.price!) },
    });

    return {
      success: true,
      error: false,
      msg: `Service added successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export const getPaymentMethods = async () => {
  const paymentMethods = [
    {
      id: 1,
      name: "CASH",
      description: "Cash payment - Pay the amount directly to your doctor"
    },
    {
      id: 2,
      name: "CARD",
      description: "Card payment - Pay online using credit/debit card via Stripe"
    }
  ];

  return {
    success: true,
    data: paymentMethods,
  };
};

export async function addPaymentMethod(values: any) {

  return {
    success: true,
    message: "Payment method configuration is static and cannot be modified"
  };
}
export async function updatePaymentMethod(id: number, values: any) {

  return {
    success: true,
    message: "Payment method configuration is static and cannot be modified"
  };
}