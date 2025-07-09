import { format } from "date-fns";
import { SmallCard } from "../small-card";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Props for displaying appointment details
interface AppointmentDetailsProps {
    id: number | string; // Appointment ID
    patient_id: string;  // Patient's unique identifier
    appointment_date: Date; // Date of the appointment
    time: string;        // Time of the appointment
    notes?: string;      // Optional additional notes
}

/**
 * Displays the details of a specific appointment, including date, time, and notes.
 * Uses SmallCard components for key info and a Card layout for structure.
 */
export const AppointmentDetails = ({ id, patient_id, appointment_date, time, notes }: AppointmentDetailsProps) => {
    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Key appointment info in a row of small cards */}
                <div className="flex ">
                    <SmallCard label="Appointment #" value={`# ${id}`} />
                    <SmallCard label="Date" value={format(appointment_date, "MMMM dd, yyyy")} />
                    <SmallCard label="Time" value={time} />
                </div>

                {/* Additional notes section */}
                <div>
                    <span className="text-sm font-medium">Additional Notes</span>
                    <p className="text-sm text-gray-500">{notes || "No additional notes provided."}</p>
                </div>
            </CardContent>
        </Card>
    );
};
