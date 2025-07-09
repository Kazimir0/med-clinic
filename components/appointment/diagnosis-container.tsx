import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { NoDataFound } from "../no-data-found";
import { AddDiagnosis } from "../dialogs/add-diagnosis";
import { MedicalHistoryCard } from "./medical-history-card";

/**
 * DiagnosisContainer displays diagnosis records for a specific appointment.
 * - Only the doctor assigned to the appointment can add a diagnosis, and only if the appointment is completed.
 * - Patients can only view diagnosis records.
 * - Handles conditional rendering for add diagnosis button and status messages.
 */
export const DiagnosisContainer = async ({
  patientId,
  doctorId,
  id,
}: {
  patientId: string;
  doctorId: string;
  id: string;
}) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  // Check if the current user is the doctor assigned to the appointment
  const isCurrentDoctor = userId === doctorId;
  
  // Fetch appointment details to check its status
  const appointment = await db.appointment.findUnique({
    where: { id: Number(id) }
  });

  // Check if the appointment is completed
  const isAppointmentCompleted = appointment && appointment.status === "COMPLETED";
  
  // Fetch the medical record and associated diagnosis for this appointment
  const data = await db.medicalRecords.findFirst({
    where: { appointment_id: Number(id) },
    include: {
      diagnosis: {
        include: { doctor: true },
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  // A doctor can add a diagnosis only if:
  // 1. They are the doctor assigned to the appointment
  // 2. The appointment status is "COMPLETED"
  const canAddDiagnosis = isCurrentDoctor && isAppointmentCompleted;

  const diagnosis = data?.diagnosis || null;
  const isPatient = await checkRole("PATIENT");

  return (
    <div>
      {/* If there are no diagnosis records, show a message and add button if allowed */}
      {diagnosis?.length === 0 || !diagnosis ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <NoDataFound note="No diagnosis found" />
          {/* Show add diagnosis button only if user is the correct doctor and appointment is completed */}
          {!isPatient && canAddDiagnosis && (
            <AddDiagnosis
              key={new Date().getTime()}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={id}
              medicalId={data?.id.toString() || ""}
            />
          )}
          {/* Show status message if not allowed to add diagnosis */}
          {!isPatient && !canAddDiagnosis && (
            <p className="text-sm text-red-500 mt-2">
              {!isCurrentDoctor 
                ? "You can only add diagnosis to your own appointments" 
                : "Diagnosis can only be added when appointment status is completed"}
            </p>
          )}
        </div>
      ) : (
        <section className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Medical Records</CardTitle>

              {/* Show add diagnosis button if allowed, or status messages if not */}
              {!isPatient && canAddDiagnosis && (
                <AddDiagnosis
                  key={new Date().getTime()}
                  patientId={patientId}
                  doctorId={doctorId}
                  appointmentId={id}
                  medicalId={data?.id.toString() || ""}
                />
              )}
              {!isPatient && !canAddDiagnosis && isCurrentDoctor && !isAppointmentCompleted && (
                <p className="text-sm text-amber-500">
                  Diagnosis can only be added after the appointment is completed
                </p>
              )}
              {!isPatient && !isCurrentDoctor && (
                <p className="text-sm text-gray-500">
                  You cannot add diagnosis to another doctor's appointment
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Render all diagnosis records for this appointment */}
              {diagnosis?.map((record, id) => (
                <div key={record.id}>
                  <MedicalHistoryCard record={record} index={id} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};