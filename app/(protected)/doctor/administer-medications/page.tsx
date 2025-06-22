import { checkRole } from "@/utils/roles";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import db from "@/lib/db";
import { format } from "date-fns";
import { ProfileImage } from "@/components/profile-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const AdministerMedicationsPage = async () => {
  // Check user authorization
  const { userId } = await auth();
  const isAuthorized = await checkRole(["ADMIN", "DOCTOR", "NURSE"]);

  if (!userId || !isAuthorized) {
    redirect("/");
  }

  // Get active prescriptions that need administration
  const activePrescriptions = await db.prescription.findMany({
    where: {
      status: "ACTIVE"
    },
    include: {
      patient: {
        select: {
          first_name: true,
          last_name: true,
          img: true,
          colorCode: true,
        }
      },
      doctor: {
        select: {
          name: true,
          specialization: true,
        }
      },
      medications: true
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Administer Medications</h1>
        <Button asChild>
          <Link href="/doctor/prescriptions/create">
            Create Prescription
          </Link>
        </Button>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activePrescriptions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                No active prescriptions to administer
              </div>
            </CardContent>
          </Card>
        ) : (
          activePrescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center gap-3">
                  <ProfileImage
                    url={prescription.patient.img || ""}
                    name={`${prescription.patient.first_name} ${prescription.patient.last_name}`}
                    bgColor={prescription.patient.colorCode || ""}
                  />
                  <div>
                    <CardTitle className="text-md">
                      {prescription.patient.first_name} {prescription.patient.last_name}
                    </CardTitle>
                    <CardDescription>
                      Prescribed by Dr. {prescription.doctor.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-3 text-sm">
                  <span className="font-medium">Issue Date:</span> {format(prescription.created_at, "PPP")}
                </div>

                <h3 className="font-medium mb-2">Medications:</h3>
                <ul className="space-y-2">
                  {prescription.medications.map((med, index) => (
                    <li key={index} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-xs text-gray-600">
                        {med.dosage} - {med.frequency}
                      </div>
                      <div className="text-xs text-gray-600">
                        {med.instructions}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-end">
                  <Button size="sm" asChild>
                    <Link href={`/doctor/administer-medications/${prescription.id}`}>
                      Administer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdministerMedicationsPage;