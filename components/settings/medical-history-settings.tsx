"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Table } from "@/components/tables/table";
import { ProfileImage } from "@/components/profile-image";
import { format } from "date-fns";
import { ViewAction } from "@/components/action-options";


interface Diagnosis {
    id: number;
    name: string;
    description?: string;
}

interface Patient {
    first_name: string;
    last_name: string;
    img?: string;
    gender?: string;
    colorCode?: string;
    phone?: string;
}

interface Doctor {
    id: string;
    name: string;
}

interface MedicalRecord {
    id: number;
    created_at: string | Date;
    doctor_id?: string;
    patient?: Patient;
    appointment_id?: number | string;
    diagnosis: Diagnosis[];
}

// MedicalHistorySettings fetches and displays a table of all medical records in the system.
// Handles loading, error, and empty states, and provides a view action for each record.
export const MedicalHistorySettings = () => {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch medical records from the API
                const recordsResponse = await fetch('/api/admin/medical-records');

                if (recordsResponse.ok) {
                    const recordsData = await recordsResponse.json();
                    setMedicalRecords(recordsData);
                    setError(null);
                } else {
                    const errorData = await recordsResponse.json();
                    console.error("Failed to fetch medical records:", errorData);
                    setError(errorData.error || "Failed to fetch medical records");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("An error occurred while fetching data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Table columns definition
    const columns = [
        {
            header: "Patient",
            key: "patient",
        },
        {
            header: "Date",
            key: "date",
            className: "hidden md:table-cell",
        },
        {
            header: "Doctor",
            key: "doctor",
            className: "hidden lg:table-cell",
        },
        // {
        //     header: "Diagnosis",
        //     key: "diagnosis",
        //     className: "hidden xl:table-cell",
        // },
        {
            header: "Actions",
            key: "actions",
        },
    ];

    // Render a table row for each medical record
    const renderRow = (item: MedicalRecord) => {
        const patientName = item?.patient?.first_name + " " + item?.patient?.last_name;
        return (
            <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 hover:bg-slate-50">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <ProfileImage
                            url={item?.patient?.img}
                            name={patientName}
                            bgColor={item?.patient?.colorCode || '#2563eb'}
                            textClassName="text-white"
                        />
                        <div>
                            <p className="font-medium">{patientName}</p>
                            <p className="text-sm text-gray-500">{item?.patient?.gender}</p>
                        </div>
                    </div>
                </td>
                {/* Record creation date */}
                <td className="hidden md:table-cell">
                    {format(new Date(item.created_at), 'dd MMM yyyy')}
                </td>
                {/* Doctor ID (truncated if long) */}
                <td className="hidden lg:table-cell">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
                        {item?.doctor_id
                            ? (item.doctor_id.length > 25
                                ? `${item.doctor_id.substring(0, 25)}...`
                                : item.doctor_id)
                            : 'Unassigned'}
                    </span>
                </td>
                {/* <td className="hidden xl:table-cell">
                    {item?.diagnosis?.length > 0
                        ? item.diagnosis.map((d: Diagnosis) => d.name).join(", ")
                        : "No diagnosis"
                    }
                </td> */}
                {/* View action for the record */}
                <td>
                    <ViewAction href={`/record/appointments/${item?.appointment_id}`} />
                </td>
            </tr>
        );
    };

    // Show loading spinner while fetching data
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    // Show error message if fetch failed
    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600 text-center">{error}</p>
                <div className="flex justify-center mt-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Show message if there are no records
    if (medicalRecords.length === 0) {
        return (
            <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-gray-600 mb-1">There are no medical records!</h3>
                <p className="text-gray-500">No medical records found in the system.</p>
            </div>
        );
    }

    // Render the table of medical records
    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-6">Medical History Overview</h2>
            <Table
                columns={columns}
                data={medicalRecords}
                renderRow={renderRow}
            />
        </div>
    );
};