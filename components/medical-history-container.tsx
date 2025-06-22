import db from "@/lib/db";
import React from "react";
import { MedicalHistory } from "./medical-history";

interface DataProps {
  id?: number | string;
  patientId: string;
}

export const MedicalHistoryContainer = async ({ id, patientId }: DataProps) => {
  // Get medical records
  const medicalRecords = await db.medicalRecords.findMany({
    where: { patient_id: patientId },
    include: {
      diagnosis: { include: { doctor: true } },
      lab_test: true,
    },
    orderBy: { created_at: "desc" },
  });

  // For each record, find and add the associated doctor
  const data = await Promise.all(
    medicalRecords.map(async (record) => {
      // Find the doctor using doctor_id
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
      <MedicalHistory data={data} isShowProfile={false} />
    </>
  );
};