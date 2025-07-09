import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import db from "@/lib/db";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MoveRight, Pill } from "lucide-react";

const PrescriptionPage = async () => {
  // Get current user ID
  const { userId } = await auth();
  
  if (!userId) {
    // Redirect unauthenticated users to sign-in
    redirect("/sign-in");
  }

  // Get all prescriptions for the current patient
  const prescriptions = await db.prescription.findMany({
    where: {
      patient_id: userId
    },
    include: {
      doctor: {
        select: {
          name: true,
          specialization: true,
          img: true,
          colorCode: true
        }
      },
      medications: {
        include: {
          administrations: {
            orderBy: {
              administered_at: "desc"
            },
            take: 1  // Only fetch the latest administration for display
          }
        }
      }
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">My Prescriptions</h1>
        <p className="text-gray-500">View all your current and past prescriptions</p>
      </div>

      {/* Show message if no prescriptions exist */}
      {prescriptions.length === 0 ? (
        <Card className="bg-gray-50 border border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-10">
            <Pill className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-1">No Prescriptions Found</h3>
            <p className="text-gray-500 text-sm">
              You don't have any prescriptions at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Render each prescription card */}
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden">
              <CardHeader className="bg-blue-50 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">
                    Prescription #{prescription.id}
                  </CardTitle>
                  <Badge variant={prescription.status === "ACTIVE" ? "default" : "outline"}>
                    {prescription.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(prescription.created_at, "PPP")}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="border-b pb-3 mb-3">
                  <h3 className="text-sm font-medium mb-1">Prescribed by</h3>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">Dr. {prescription.doctor.name}</p>
                      <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                {/* List medications for this prescription */}
                <h3 className="font-medium mb-2">Medications</h3>
                <div className="space-y-3">
                  {prescription.medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{med.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{med.dosage}</p>
                          {med.administrations && med.administrations.length > 0 ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Administered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-300">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{med.frequency}</span>
                      </div>
                      {/* Show last administration date if available */}
                      {med.administrations && med.administrations.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                          Last administered: {format(med.administrations[0].administered_at, "PPP")}
                        </div>
                      )}
                      {/* Show instructions if available */}
                      {med.instructions && (
                        <p className="mt-2 text-sm text-gray-700 border-t pt-2">
                          {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show doctor's notes if available */}
                {prescription.notes && (
                  <div className="mt-4 border-t pt-3">
                    <h3 className="font-medium mb-1">Doctor's Notes</h3>
                    <p className="text-sm text-gray-700">{prescription.notes}</p>
                  </div>
                )}
                
                {/* Link to view prescription details */}
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Link 
                    href={`/patient/prescription/${prescription.id}`} 
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    View details
                    <MoveRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionPage;