import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkRole } from "@/utils/roles";
import db from "@/lib/db";
import { PrescriptionForm } from "@/components/prescription-form";

const CreatePrescriptionPage = async () => {
  // Verifică autorizarea utilizatorului
  const { userId } = await auth();
  const isAuthorized = await checkRole(["ADMIN", "DOCTOR"]);
  
  if (!userId || !isAuthorized) {
    redirect("/");
  }
  
  // Obține lista pacienților pentru formular
  const patients = await db.patient.findMany({
    orderBy: {
      last_name: "asc"
    }
  });
  
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Create New Prescription</h1>
        <p className="text-gray-500">Create a prescription for your patient</p>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <PrescriptionForm patients={patients} />
      </div>
    </div>
  );
};

export default CreatePrescriptionPage;