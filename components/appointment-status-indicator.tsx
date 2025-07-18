import { Appointment, AppointmentStatus } from '@prisma/client';
import React from 'react'
import { cn } from '@/lib/utils';

// AppointmentStatusIndicator visually displays the current status of an appointment
// The color and style change based on the status (Pending, Scheduled, Cancelled, Completed)
const status_color = {
    PENDING: "bg-yellow-600/15 text-yellow-600",
    SCHEDULED: "bg-emerald-600/15 text-emerald-600",
    CANCELLED: "bg-red-600/15 text-red-600",
    COMPLETED: "bg-blue-600/15 text-blue-600",
};

export const AppointmentStatusIndicator = ({ status }: { status: AppointmentStatus }) => {
    // Render a styled pill with the status text and color
    return <p className={cn("w-fit px-2 py-1 rounded-full capitalize text-xs lg:text-sm", status_color[status])}>
        {status?.toLowerCase()}
    </p>
};
