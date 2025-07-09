"use server"
import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis"
import db from "@/lib/db";
import { DiagnosisSchema, PatientBillSchema, PaymentSchema, ServicesSchema } from "@/lib/schema";
import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Adds a diagnosis for a patient appointment.
 * - Validates input data using Zod schema.
 * - If no medical record exists, creates one for the patient and doctor.
 * - Associates the diagnosis with the correct medical record.
 * Returns a status object indicating success or failure.
 */
export const addDiagnosis = async (
    data: DiagnosisFormData,
    appointmentId: string
) => {
    try {
        // Validate the diagnosis form data
        const validatedData = DiagnosisSchema.parse(data);

        let medicalRecord = null;

        // If no medical record ID is provided, create a new medical record for this appointment
        if (!validatedData.medical_id) {
            medicalRecord = await db.medicalRecords.create({
                data: {
                    patient_id: validatedData.patient_id,
                    doctor_id: validatedData.doctor_id,
                    appointment_id: Number(appointmentId),
                },
            });
        }

        // Use the provided or newly created medical record ID
        const med_id = validatedData.medical_id || medicalRecord?.id;
        await db.diagnosis.create({
            data: {
                ...validatedData,
                medical_id: Number(med_id),
            },
        });

        return {
            success: true,
            message: "Diagnosis added successfully",
            status: 201,
        };
    } catch (error) {
        console.log(error);
        return {
            error: "Failed to add diagnosis",
        };
    }
};

/**
 * Adds a new bill for a patient appointment and service.
 * - Checks if the user is an admin or doctor.
 * - Validates bill data.
 * - Creates a new bill if one does not exist for the appointment.
 * - Associates the bill with the service and patient.
 * Returns a status object indicating success or failure.
 */
export async function addNewBill(data: any) {
  try {
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to add a bill",
      };
    }

    // Validate bill data using Zod schema
    const isValidData = PatientBillSchema.safeParse(data);
    const validatedData = isValidData.data;
    let bill_info = null;

    // If no bill exists for this appointment, create one
    if (!data?.bill_id || data?.bill_id === "undefined") {
      const info = await db.appointment.findUnique({
        where: { id: Number(data?.appointment_id)! },
        select: {
          id: true,
          patient_id: true,
          bills: {
            where: {
              appointment_id: Number(data?.appointment_id),
            },
          },
        },
      });

      if (!info?.bills?.length) {
        bill_info = await db.payment.create({
          data: {
            appointment_id: Number(data?.appointment_id),
            patient_id: info?.patient_id!,
            bill_date: new Date(),
            payment_date: new Date(),
            discount: 0.0,
            amount_paid: 0.0,
            total_amount: 0.0,
          },
        });
      } else {
        bill_info = info?.bills[0];
      }
    } else {
      bill_info = {
        id: data?.bill_id,
      };
    }

    // Create the patient bill record for the service
    await db.patientBills.create({
      data: {
        bill_id: Number(bill_info?.id),
        service_id: Number(validatedData?.service_id),
        service_date: new Date(validatedData?.service_date!),
        quantity: Number(validatedData?.quantity),
        unit_cost: Number(validatedData?.unit_cost),
        total_cost: Number(validatedData?.total_cost),
      },
    });

    return {
      success: true,
      error: false,
      msg: `Bill added successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

/**
 * Generates a bill by updating payment details for an appointment.
 * - Validates payment data.
 * - Calculates discount amount and updates the payment record.
 * - Marks the appointment as completed.
 * Returns a status object indicating success or failure.
 */
export async function generateBill(data: any) {
  try {
    // Validate payment data using Zod schema
    const isValidData = PaymentSchema.safeParse(data);
    const validatedData = isValidData.data;

    // Calculate the discount amount
    const discountAmount =
      (Number(validatedData?.discount) / 100) *
      Number(validatedData?.total_amount);

    // Update the payment record with bill details
    const res = await db.payment.update({
      data: {
        bill_date: validatedData?.bill_date,
        discount: discountAmount,
        total_amount: Number(validatedData?.total_amount)!,
      },
      where: { id: Number(validatedData?.id) },
    });

    // Mark the appointment as completed
    await db.appointment.update({
      data: {
        status: "COMPLETED",
      },
      where: { id: res.appointment_id },
    });
    return {
      success: true,
      error: false,
      msg: `Bill generated successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

/**
 * Updates a service's details (name, description, price).
 * - Validates input fields using Zod schema.
 * - Checks if the service exists before updating.
 * Returns a status object indicating success or failure.
 */
export async function updateService(id: number, values: any) {
  try {
    // Validate service fields
    const validatedFields = ServicesSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        error: true,
        msg: "Invalid fields. Please check your input.",
      };
    }

    const { service_name, description, price } = validatedFields.data;

    // Check if the service exists before updating
    const existingService = await db.services.findUnique({
      where: { id },
    });

    if (!existingService) {
      return {
        success: false,
        error: true,
        msg: "Service not found.",
      };
    }

    // Update the service record
    await db.services.update({
      where: { id },
      data: {
        service_name,
        description,
        price: Number(price),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log("SERVICE_UPDATE_ERROR", error);
    return {
      success: false,
      error: true,
      msg: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Records the administration of medications for a prescription.
 * - Authenticates the user (must be logged in).
 * - Creates a medication administration record for each medication.
 * - If all medications are administered, marks the prescription as completed.
 * - Revalidates relevant cache paths for UI updates.
 * Returns a status object indicating success or failure.
 */
export async function recordMedicationAdministration(
  prescriptionId: number,
  medicationIds: number[],
  notes?: string
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Create administration records for each medication
    const administrations = await Promise.all(
      medicationIds.map(async (medicationId) => {
        return db.medicationAdministration.create({
          data: {
            prescription_id: prescriptionId,
            medication_id: medicationId,
            administered_by: userId,
            notes: notes,
          }
        });
      })
    );
    
    // Check if all medications in the prescription have been administered
    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        medications: true,
        administrations: true
      }
    });
    
    // If all medications are administered, mark the prescription as completed
    if (prescription && prescription.medications.every(med => 
      prescription.administrations.some(adm => adm.medication_id === med.id)
    )) {
      await db.prescription.update({
        where: { id: prescriptionId },
        data: { status: "COMPLETED" }
      });
    }
    
    // Revalidate cache for relevant UI paths
    revalidatePath("/doctor/administer-medications");
    revalidatePath(`/doctor/administer-medications/${prescriptionId}`);
    revalidatePath("/patient/prescription");
    
    return { success: true };
    
  } catch (error) {
    console.error("Error recording medication administration:", error);
    return { error: "Failed to record administration" };
  }
}

/**
 * Creates a new prescription for a patient with associated medications.
 * - Authenticates the user (must be a doctor or admin).
 * - Validates user role.
 * - Creates the prescription and associated medication records.
 * - Revalidates cache for relevant UI paths.
 * Returns a status object indicating success or failure.
 */
export async function createPrescription(data: {
  patientId: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
  }>;
  notes?: string;
}) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Check if the current user is a doctor or admin
    const isDoctor = await checkRole(["ADMIN", "DOCTOR"]);
    if (!isDoctor) {
      return { error: "Unauthorized. Only doctors can create prescriptions." };
    }

    // Create the prescription with associated medications
    const prescription = await db.prescription.create({
      data: {
        patient_id: data.patientId,
        doctor_id: userId,
        notes: data.notes || undefined,
        status: "ACTIVE",
        medications: {
          create: data.medications.map(med => ({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            instructions: med.instructions || undefined
          }))
        }
      }
    });
    
    // Revalidate cache for relevant UI paths
    revalidatePath("/doctor/prescriptions");
    revalidatePath("/doctor/administer-medications");
    
    return { success: true, prescriptionId: prescription.id };
    
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { error: "Failed to create prescription" };
  }
}