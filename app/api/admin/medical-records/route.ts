import db from "@/lib/db";
import { checkRole } from "@/utils/roles";
import { createNotification } from "@/utils/server-notifications";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * GET: Returns the latest 50 medical records for admin users.
 * - Checks authentication and admin role.
 * - Includes patient info and diagnosis for each record.
 */
export async function GET() {
  try {
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkRole("ADMIN");
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the latest 50 medical records, including patient and diagnosis info
    const medicalRecords = await db.medicalRecords.findMany({
      take: 50,
      orderBy: { created_at: "desc" },
      include: {
        patient: {
          select: {
            first_name: true,
            last_name: true,
            img: true,
            gender: true,
            colorCode: true,
          },
        },
        diagnosis: true,
      },
    });

    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 }
    );
  }
}

/**
 * POST: Creates a new medical record for a patient.
 * - Only admins and doctors are authorized.
 * - Accepts patient, doctor, and record details in the request body.
 * - Sends a notification to the patient after creation.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role (admin or doctor)
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    const isAuthorized = isAdmin || isDoctor;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body for medical record data
    const data = await request.json();
    const { patient_id, doctor_id, type, diagnosis, vital_signs, notes, ...otherData } = data;

    // Create the medical record in the database
    const medicalRecord = await db.medicalRecords.create({
      data: {
        patient_id,
        doctor_id,
        type,
        vital_signs,
        notes,
        ...otherData
      }
    });

    // Log patient and doctor IDs for debugging
    console.log("Patient ID from request:", patient_id);
    console.log("Doctor ID from request:", doctor_id);

    // Create notification for the patient about the new record
    try {
      await createNotification({
        title: "New medical record",
        message: `A new medical record has been added to your file.`,
        type: "medical",
        userId: patient_id,
        link: `/patient/self?cat=medical-records`,
        data: {
          recordId: medicalRecord.id
        }
      });
    } catch (notificationError) {
      console.error("Failed to create patient notification:", notificationError);
    }

    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error("Error creating medical record:", error);
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 }
    );
  }
}