import { Patient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { calculateAge } from "@/utils";
import { Calendar, Home, Info, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

// PatientDetailsCard displays detailed information about a patient in a styled card.
// It shows the patient's photo, name, contact info, demographics, and medical details.
export const PatientDetailsCard = ({ data }: { data: Patient | undefined | null }) => {
    // If no patient data is provided, show a message indicating information is unavailable.
    if (!data) {
        return (
            <Card className="shadow-none bg-white">
                <CardHeader>
                    <CardTitle>Patient Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">Patient information is not available.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-none bg-white">
            <CardHeader>
                <CardTitle>Patient Details</CardTitle>
                {/* Patient profile image, defaults to /user.jpg if not set */}
                <div className="relative size-20 xl:size-24 rounded-full overflow-hidden">
                    <Image
                        src={data.img || "/user.jpg"}
                        alt={data.first_name || "Patient"}
                        width={100}
                        height={100}
                        className="rounded-full"
                        priority
                    />
                </div>

                {/* Patient name, email, phone, gender, and age */}
                <div>
                    <h2 className="text-lg font-semibold">
                        {data.first_name} {data.last_name}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {data.email} - {data.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                        {data.gender} - {calculateAge(data.date_of_birth)}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="mt-4 space-y-4">
                {/* Date of Birth section with calendar icon */}
                <div className="flex items-start gap-3">
                    <Calendar size={22} className="text-0gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.date_of_birth ? format(new Date(data.date_of_birth), "MMM d, yyyy") : "Not available"}
                        </p>
                    </div>
                </div>
                {/* Address section with home icon */}
                <div className="flex items-start gap-3">
                    <Home size={22} className="text-0gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.address || "Not available"}
                        </p>
                    </div>
                </div>
                {/* Email section with mail icon */}
                <div className="flex items-start gap-3">
                    <Mail size={22} className="text-0gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.email || "Not available"}
                        </p>
                    </div>
                </div>
                {/* Phone section with phone icon */}
                <div className="flex items-start gap-3">
                    <Phone size={22} className="text-0gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.phone || "Not available"}
                        </p>
                    </div>
                </div>
                {/* Physician section with info icon (currently hardcoded) */}
                <div className="flex items-start gap-3">
                    <Info size={22} className="text-0gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Physician</p>
                        <p className="text-base font-medium text-muted-foreground">
                            Dr Catalin
                        </p>
                    </div>
                </div>
                {/* Active medical conditions section */}
                <div className="flex items-start gap-3">
                    <div>
                        <p className="text-sm text-gray-500">Active Conditions</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.medical_conditions || "None reported"}
                        </p>
                    </div>
                </div>
                {/* Allergies section */}
                <div className="flex items-start gap-3">
                    <div>
                        <p className="text-sm text-gray-500">Allergies</p>
                        <p className="text-base font-medium text-muted-foreground">
                            {data.allergies || "None reported"}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};