import { format } from "date-fns";
import { SmallCard } from "../small-card";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";


interface AppointmentDetailsProps {
    id: number | string;
    patient_id: string;
    appointment_date: Date;
    time: string;
    notes?: string;
}

export const AppointmentDetails = ({ id, patient_id, appointment_date, time, notes }: AppointmentDetailsProps) => {
    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex ">
                    <SmallCard label="Appointment #" value={`# ${id}`} />
                    <SmallCard label="Date" value={format(appointment_date, "MMMM dd, yyyy")} />
                    <SmallCard label="Time" value={time} />
                </div>

                <div>
                    <span className="text-sm font-medium">Additional Notes</span>
                    <p className="text-sm text-gray-500">{notes || "No additional notes provided."}</p>
                </div>
            </CardContent>
        </Card>
    );
};
