import { checkRole } from "@/utils/roles";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import db from "@/lib/db";
import { format } from "date-fns";
import { ProfileImage } from "@/components/profile-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

const DoctorPrescriptionsPage = async () => {
    // Verifică autorizarea utilizatorului
    const { userId } = await auth();
    const isAuthorized = await checkRole(["ADMIN", "DOCTOR"]);

    if (!userId || !isAuthorized) {
        redirect("/");
    }

    // Obține toate prescripțiile create de doctor
    const prescriptions = await db.prescription.findMany({
        where: {
            doctor_id: userId
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
            medications: true
        },
        orderBy: {
            created_at: "desc"
        }
    });

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-2xl font-bold">Prescriptions</h1>
                <Button asChild>
                    <Link href="/doctor/prescriptions/create">
                        <Plus className="h-4 w-4 mr-2" /> Create Prescription
                    </Link>
                </Button>
            </div>

            {prescriptions.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center p-10">
                        <p className="text-gray-500">No prescriptions found. Create your first prescription.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prescriptions.map((prescription) => (
                        <Card key={prescription.id} className="overflow-hidden">
                            <CardHeader className="bg-blue-50 relative">
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
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{format(prescription.created_at, "PPP")}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge className="absolute top-3 right-3" variant={prescription.status === "ACTIVE" ? "default" : "outline"}>
                                    {prescription.status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <h3 className="font-medium mb-2">Medications:</h3>
                                <ul className="space-y-2">
                                    {prescription.medications.map((med, index) => (
                                        <li key={index} className="bg-gray-50 p-2 rounded text-sm">
                                            <div className="font-medium">{med.name}</div>
                                            <div className="text-xs text-gray-600">
                                                {med.dosage} - {med.frequency}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {prescription.medications.length} medication(s)
                                    </span>
                                    <Link
                                        href={`/doctor/prescriptions/${prescription.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Details
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

export default DoctorPrescriptionsPage;