import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { NoDataFound } from "../no-data-found";
import { AddDiagnosis } from "../dialogs/add-diagnosis";
import { MedicalHistoryCard } from "./medical-history-card";

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

  // Verifică dacă utilizatorul curent este doctorul asociat cu programarea
  const isCurrentDoctor = userId === doctorId;
  
  // Obține detalii despre programare pentru a verifica statusul
  const appointment = await db.appointment.findUnique({
    where: { id: Number(id) }
  });

  // Verifică dacă programarea are statusul "COMPLETED"
  const isAppointmentCompleted = appointment && appointment.status === "COMPLETED";
  
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

  // Un doctor poate adăuga diagnostic doar dacă:
  // 1. Este doctorul asociat cu programarea
  // 2. Statusul programării este "completed"
  const canAddDiagnosis = isCurrentDoctor && isAppointmentCompleted;

  const diagnosis = data?.diagnosis || null;
  const isPatient = await checkRole("PATIENT");

  return (
    <div>
      {diagnosis?.length === 0 || !diagnosis ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <NoDataFound note="No diagnosis found" />
          {/* Afișează butonul de adăugare diagnostic doar dacă este doctorul corect și programarea este completată */}
          {!isPatient && canAddDiagnosis && (
            <AddDiagnosis
              key={new Date().getTime()}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={id}
              medicalId={data?.id.toString() || ""}
            />
          )}
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