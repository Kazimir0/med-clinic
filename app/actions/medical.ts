"use server"
import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis"
import db from "@/lib/db";
import { DiagnosisSchema, PatientBillSchema, PaymentSchema, ServicesSchema } from "@/lib/schema";
import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const addDiagnosis = async (
    data: DiagnosisFormData,
    appointmentId: string
) => {
    try {
        const validatedData = DiagnosisSchema.parse(data);

        let medicalRecord = null;

        if (!validatedData.medical_id) {
            medicalRecord = await db.medicalRecords.create({
                data: {
                    patient_id: validatedData.patient_id,
                    doctor_id: validatedData.doctor_id,
                    appointment_id: Number(appointmentId),
                },
            });
        }

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

    const isValidData = PatientBillSchema.safeParse(data);

    const validatedData = isValidData.data;
    let bill_info = null;

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

export async function generateBill(data: any) {
  try {
    const isValidData = PaymentSchema.safeParse(data);

    const validatedData = isValidData.data;

    const discountAmount =
      (Number(validatedData?.discount) / 100) *
      Number(validatedData?.total_amount);

    const res = await db.payment.update({
      data: {
        bill_date: validatedData?.bill_date,
        discount: discountAmount,
        total_amount: Number(validatedData?.total_amount)!,
      },
      where: { id: Number(validatedData?.id) },
    });

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

export async function updateService(id: number, values: any) {
  try {
    const validatedFields = ServicesSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        error: true,
        msg: "Invalid fields. Please check your input.",
      };
    }

    const { service_name, description, price } = validatedFields.data;

    // Verifică dacă serviciul există
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

    // Actualizează serviciul
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
    
    // Creează înregistrări de administrare pentru fiecare medicament
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
    
    // Verifică dacă toate medicamentele din prescripție au fost administrate
    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        medications: true,
        administrations: true
      }
    });
    
    // Dacă toate medicamentele au fost administrate, marchează prescripția ca fiind completată
    if (prescription && prescription.medications.every(med => 
      prescription.administrations.some(adm => adm.medication_id === med.id)
    )) {
      await db.prescription.update({
        where: { id: prescriptionId },
        data: { status: "COMPLETED" }
      });
    }
    
    revalidatePath("/doctor/administer-medications");
    revalidatePath(`/doctor/administer-medications/${prescriptionId}`);
    revalidatePath("/patient/prescription");
    
    return { success: true };
    
  } catch (error) {
    console.error("Error recording medication administration:", error);
    return { error: "Failed to record administration" };
  }
}

// export async function createPrescription(data: {
//   patientId: string;
//   medications: Array<{
//     name: string;
//     dosage: string;
//     frequency: string;
//     instructions?: string;
//   }>;
//   notes?: string;
// }) {
//   try {
//     const { userId } = await auth();
    
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }
    
//     // Verifică dacă utilizatorul actual este doctor
//     const isDoctor = await checkRole(["ADMIN", "DOCTOR"]);
//     if (!isDoctor) {
//       return { error: "Unauthorized. Only doctors can create prescriptions." };
//     }

//     // Creează prescripția cu medicamentele asociate
//     const prescription = await db.prescription.create({
//       data: {
//         patient_id: data.patientId,
//         doctor_id: userId,
//         notes: data.notes || undefined,
//         status: "ACTIVE",
//         medications: {
//           create: data.medications.map(med => ({
//             name: med.name,
//             dosage: med.dosage,
//             frequency: med.frequency,
//             instructions: med.instructions || undefined
//           }))
//         }
//       }
//     });
    
//     revalidatePath("/doctor/prescriptions");
    
//     return { success: true, prescriptionId: prescription.id };
    
//   } catch (error) {
//     console.error("Error creating prescription:", error);
//     return { error: "Failed to create prescription" };
//   }
// }

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
    
    // Verifică dacă utilizatorul actual este doctor
    const isDoctor = await checkRole(["ADMIN", "DOCTOR"]);
    if (!isDoctor) {
      return { error: "Unauthorized. Only doctors can create prescriptions." };
    }

    // Creează prescripția cu medicamentele asociate
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
    
    revalidatePath("/doctor/prescriptions");
    revalidatePath("/doctor/administer-medications");
    
    return { success: true, prescriptionId: prescription.id };
    
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { error: "Failed to create prescription" };
  }
}