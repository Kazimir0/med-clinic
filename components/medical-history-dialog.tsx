import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import { DiagnosisContainer } from "./appointment/diagnosis-container";

interface DataProps {
  id: string | number;
  patientId: string;
  medicalId?: string;
  doctor_id: string;
  label: React.ReactNode;
}
export const MedicalHistoryDialog = async ({
  id,
  patientId,
  doctor_id,
  label,
}: DataProps) => {
  const stringId = id.toString();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full bg-blue-600/10 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm"
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[425px] md:max-w-2xl 2xl:max-w-4xl p-8 overflow-y-auto">
        <DialogTitle>Diagnosis container form</DialogTitle>
        <DiagnosisContainer
          id={stringId}
          patientId={patientId!}
          doctorId={doctor_id!}
        />
      </DialogContent>
    </Dialog>
  );
};