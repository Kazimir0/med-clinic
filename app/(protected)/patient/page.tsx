import { AvailableDoctors } from '@/components/available-doctor'
import { AppointmentChart } from '@/components/charts/appointment-chart'
import { StatSummary } from '@/components/charts/stat-summary'
import { PatientRatingContainer } from '@/components/patient-rating-container'
import { StatCard } from '@/components/stat-card'
import { RecentAppointments } from '@/components/tables/recent-appointments'
import { Button } from '@/components/ui/button'
import { AvailableDoctorProps } from '@/types/data-types'
import { getPatientDashboardStatistics } from '@/utils/services/patient'
import { currentUser } from '@clerk/nextjs/server'
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const PatientDashboard = async () => {
  // Get current user info
  const user = await currentUser()
  // Fetch dashboard statistics for the patient
  const { data, appointmentCounts, last5Records, totalAppointments, availableDoctor, monthlyData } = await getPatientDashboardStatistics(user?.id!);

  // Redirect to registration if user exists but no patient data
  if (user && !data) {
    redirect('/patient/registration')
  }

  // If no data, render nothing
  if (!data) return null;

  // Prepare data for summary cards
  const cardData = [
    {
      title: "appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total appointments",
    },
    {
      title: "cancelled",
      value: appointmentCounts?.CANCELLED,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cancelled Appointments",
    },
    {
      title: "pending",
      value: appointmentCounts?.PENDING! + appointmentCounts?.SCHEDULED!,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending Appointments",
    },
    {
      title: "completed",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Successfully appointments",
    },
  ];

  return (
    <div className='py-6 mp-3 flex flex-col rotate-xl xl:flex-row gap-6'>
      {/* LEFT: Main dashboard content */}
      <div className='w-full xl:w-[69%]'>
        <div className='bg-white rounded-xl p-4 mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-lg xl:text-2xl font-semibold'>Welcome {data?.first_name || user?.firstName}</h1>

            <div className='space-x-2 '>
              <Button size={"sm"}>{new Date().getFullYear()}</Button>
              <Button size={"sm"} variant={"outline"} className='hover:underline'>
                <Link href='/patient/self'>View Profile</Link>
              </Button>
            </div>

          </div>

          {/* Appointment summary cards */}
          <div className='w-full flex flex-wrap gap-5'>
            {cardData?.map((el, id) => (<StatCard link='#' key={id} {...el} />))}
          </div>
        </div>

        {/* Appointment statistics chart */}
        <div className='h-[500px]'>
          <AppointmentChart data={monthlyData} />
        </div>
        <div className='bg-white rounded-xl p-4 mt-8'>
          {/* Recent appointments table */}
          <RecentAppointments data={last5Records} />
        </div>
      </div>


      {/* RIGHT: Sidebar with stats, doctors, and ratings */}
      <div className='w-full xl:w-[30%]'>
        <div className='w-full h-[450px] mb-8'>
          <StatSummary data={appointmentCounts} total={totalAppointments} />
        </div>

        {/* List of available doctors */}
        <AvailableDoctors data={availableDoctor as AvailableDoctorProps} />

        {/* Patient rating section */}
        <PatientRatingContainer />
      </div>
    </div>
  )
}

export default PatientDashboard;