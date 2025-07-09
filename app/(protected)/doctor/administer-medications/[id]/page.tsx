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
import MedicationAdministrationForm from "@/components/medication-administraction-form";

// PageProps defines the expected route params
interface PageProps {
  params: {
    id: string;
  };
}

// Main page component for administering medication
const AdministerMedicationPage = async ({ params }: PageProps) => {
  // Get current user and check if they have the right role
  const { userId } = await auth();
  const isAuthorized = await checkRole(["ADMIN", "DOCTOR", "NURSE"]);
  
  if (!userId || !isAuthorized) {
    // Redirect unauthorized users to home
    redirect("/");
  }

  // Fetch prescription details from the database
  const prescriptionId = parseInt(params.id);
  const prescription = await db.prescription.findUnique({
    where: {
      id: prescriptionId
    },
    include: {
      patient: true,
      doctor: {
        select: {
          name: true,
          specialization: true,
        }
      },
      medications: true
    }
  });
  
  if (!prescription) {
    // Redirect if prescription not found
    redirect("/doctor/administer-medications");
  }
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Administer Medication</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/doctor/administer-medications">Back to List</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Administration Record</CardTitle>
              <CardDescription>Record medication administration details</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Form for recording medication administration */}
              <MedicationAdministrationForm 
                prescriptionId={prescription.id}
                medications={prescription.medications}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-md">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                {/* Patient profile image and basic info */}
                <ProfileImage 
                  url={prescription.patient.img || ""} 
                  name={`${prescription.patient.first_name} ${prescription.patient.last_name}`}
                  bgColor={prescription.patient.colorCode || ""}
                />
                <div>
                  <p className="font-medium">{prescription.patient.first_name} {prescription.patient.last_name}</p>
                  <p className="text-sm text-gray-600">{prescription.patient.gender} • {format(prescription.patient.date_of_birth, "PPP")}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Phone: </span>
                  <span>{prescription.patient.phone}</span>
                </div>
                <div>
                  <span className="font-medium">Allergies: </span>
                  <span>{prescription.patient.allergies || "None reported"}</span>
                </div>
                <div>
                  <span className="font-medium">Medical Conditions: </span>
                  <span>{prescription.patient.medical_conditions || "None reported"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-md">Prescription Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-3 text-sm">
                {/* Doctor and prescription info */}
                <p><span className="font-medium">Prescribed by: </span>Dr. {prescription.doctor.name}</p>
                <p><span className="font-medium">Specialization: </span>{prescription.doctor.specialization}</p>
                <p><span className="font-medium">Date: </span>{format(prescription.created_at, "PPP")}</p>
              </div>
              
              {prescription.notes && (
                <div className="mt-3 pt-3 border-t">
                  <h3 className="font-medium mb-1">Notes</h3>
                  <p className="text-sm">{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdministerMedicationPage;