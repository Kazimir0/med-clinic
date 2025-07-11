import Link from 'next/link';
import React from 'react'
import { Button } from '../ui/button';
import { Table } from './table';
import { Appointment } from '@/types/data-types';
import { ProfileImage } from '../profile-image';
import { format } from 'date-fns';
import { AppointmentStatusIndicator } from '../appointment-status-indicator';
import { ViewAppointment } from '../view-appointment';

interface DataProps {
    data: any[];
}
const columns = [
    { header: "Info", key: "name" },
    {
        header: "Date",
        key: "appointment_date",
        className: "hidden md:table-cell",
    },
    {
        header: "Time",
        key: "time",
        className: "hidden md:table-cell",
    },
    {
        header: "Doctor",
        key: "doctor",
        className: "hidden md:table-cell",
    },
    {
        header: "Status",
        key: "status",
        className: "hidden xl:table-cell",
    },
    {
        header: "Actions",
        key: "action",
    },
];

// RecentAppointments displays a table of the most recent appointments with patient and doctor info.
// Includes status indicators and actions for viewing appointment details.
export const RecentAppointments = ({ data }: DataProps) => {
    // Render a table row for each appointment
    const renderRow = (item: Appointment) => {
        const name = item?.patient?.first_name + " " + item?.patient?.last_name
        return (
            <tr key={item?.id} className='border-b border-gray-200 even:bg-slate-200 text-sm hover:bg-slate-50'>
                {/* Patient info and profile image */}
                <td className='flex items-center gap-2 2xl:gap-4 py-2 xl:py-4'>
                    <ProfileImage url={item?.patient?.img!} name={name} className='bg-violet-600' />
                    <div>
                        <h3 className='text-sm md:text-base md:font-medium uppercase'>{name}</h3>
                        <span className='text-xs capitalize'>
                            {item?.patient?.gender?.toLowerCase()}
                        </span>
                    </div>
                </td>
                {/* Appointment date */}
                <td className='hidden md:table-cell'>{format(item?.appointment_date, "yyyy-MM-dd")}</td>
                {/* Appointment time */}
                <td className='hidden md:table-cell lowercase'>{(item?.time)}</td>
                {/* Doctor info and profile image */}
                <td className='hidden md:table-cell items-center py-2'>
                    <div className='flex items-center gap-2 2x:gap-4'>
                        <ProfileImage url={item?.doctor?.img!} name={item?.doctor?.name!} className='bg-blue-600' />
                        <div >
                            <h3 className='font-medium uppercase'>{item?.doctor?.name}</h3>
                            <span className='text-xs capitalize'>{item?.doctor?.specialization}</span>
                        </div>
                    </div>
                </td>
                {/* Appointment status indicator */}
                <td className='hidden xl:table-cell'>
                    <AppointmentStatusIndicator status={item?.status} />
                </td>
                {/* Actions: view and see all */}
                <td>
                    <div className='flex items-center gap-x-2'>
                        <ViewAppointment id={item?.id} />
                        <Link href={`/record/appointments/${item?.id}`} className='text-blue-600 hover:underline'>
                            See All
                        </Link>
                    </div>
                </td>
            </tr>
        )
    };

    return (
        <div className='bg-white rounded-xl p-2 2xl:p-4'>
            <div className='flex justify-between items-center'>
                <h1 className='text-lg font-semibold'>Recent Appointments</h1>
                {/* Button to view all appointments */}
                <Button asChild variant="outline">
                    <Link href="/record/appointments">View All</Link>
                </Button>
            </div>
            {/* Table of recent appointments */}
            <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
    )
}
