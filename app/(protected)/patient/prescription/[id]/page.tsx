import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarIcon, CheckCircle, Clock, Pill } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

const PrescriptionDetailPage = async ({ params }: PageProps) => {
  // Get current user ID
  const { userId } = await auth();
  
  if (!userId) {
    // Redirect unauthenticated users to sign-in
    redirect("/sign-in");
  }

  const prescriptionId = parseInt(params.id);
  
  // Check if the ID is a valid number
  if (isNaN(prescriptionId)) {
    redirect("/patient/prescription");
  }

  // Fetch prescription with medication administration details
  const prescription = await db.prescription.findUnique({
    where: {
      id: prescriptionId,
      patient_id: userId
    },
    include: {
      doctor: {
        select: {
          name: true,
          specialization: true,
        }
      },
      medications: {
        include: {
          administrations: {
            orderBy: {
              administered_at: "desc"
            }
          }
        }
      }
    }
  });
  
  // Redirect if prescription does not exist or does not belong to patient
  if (!prescription) {
    redirect("/patient/prescription");
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        {/* Back link to prescriptions list */}
        <Link 
          href="/patient/prescription" 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to prescriptions
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Prescription #{prescription.id}</h1>
          <Badge variant={prescription.status === "ACTIVE" ? "default" : "outline"}>
            {prescription.status}
          </Badge>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="bg-blue-50">
          <CardTitle>Prescribed by Dr. {prescription.doctor.name}</CardTitle>
          <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(prescription.created_at, "PPP")}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {prescription.notes && (
            <div className="mb-4 pb-4 border-b">
              <h3 className="font-medium mb-2">Doctor's Notes</h3>
              <p className="text-gray-700">{prescription.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Medications and their administration history */}
      <h2 className="text-lg font-medium mb-4">Medications and Administration History</h2>
      <div className="space-y-4">
        {prescription.medications.map((medication) => (
          <Card key={medication.id} className="overflow-hidden">
            <CardHeader className={
              medication.administrations.length > 0 
                ? "bg-green-50" 
                : "bg-gray-50"
            }>
              <div className="flex justify-between items-center">
                <CardTitle className="text-md">{medication.name}</CardTitle>
                {medication.administrations.length > 0 ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Administered
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-300 text-gray-600">
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{medication.dosage}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{medication.frequency}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {medication.instructions && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm mb-1">Instructions</h3>
                  <p className="text-sm text-gray-700">{medication.instructions}</p>
                </div>
              )}
              
              {medication.administrations.length > 0 ? (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium text-sm mb-2">Administration History</h3>
                  {medication.administrations.map((admin) => (
                    <div key={admin.id} className="text-sm mb-3 pb-3 border-b border-dashed last:border-0 last:mb-0 last:pb-0">
                      <div className="flex justify-between text-gray-600">
                        <span>Administered on:</span>
                        <span>{format(admin.administered_at, "PPP p")}</span>
                      </div>
                      {admin.notes && (
                        <div className="mt-1 text-gray-700">
                          <span className="font-medium">Notes: </span>
                          {admin.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
                  <p>This medication has not been administered yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionDetailPage;