import db from "@/lib/db";
import React from "react";
import { MedicalHistory } from "./medical-history";

interface DataProps {
  id?: number | string;
  patientId: string;
}

// MedicalHistoryContainer fetches and prepares a patient's medical history records for display
// Props: id (optional), patientId (required)
export const MedicalHistoryContainer = async ({ id, patientId }: DataProps) => {
  // Get all medical records for the patient, including diagnosis and lab tests, ordered by most recent
  const medicalRecords = await db.medicalRecords.findMany({
    where: { patient_id: patientId },
    include: {
      diagnosis: { include: { doctor: true } },
      lab_test: true,
    },
    orderBy: { created_at: "desc" },
  });

  // For each record, find and add the associated doctor (if any)
  const data = await Promise.all(
    medicalRecords.map(async (record) => {
      let doctor = null;
      if (record.doctor_id) {
        doctor = await db.doctor.findUnique({
          where: { id: record.doctor_id }
        });
      }
      return {
        ...record,
        doctor: doctor || undefined
      };
    })
  );

  return (
    <>
      {/* Render the MedicalHistory component with the fetched data */}
      <MedicalHistory data={data} isShowProfile={false} />
    </>
  );
};