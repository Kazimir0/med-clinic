import { StatSummary } from "@/components/charts/stat-summary";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { currentUser } from "@clerk/nextjs/server";
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from "lucide-react";
import { AvailableDoctors } from "@/components/available-doctor";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { RecentAppointments } from "@/components/tables/recent-appointments";

const DoctorDashboard = async () => {
  const user = await currentUser();
  const {
    totalPatient,
    totalNurses,
    totalAppointment,
    appointmentCounts,
    availableDoctors,
    monthlyData,
    last5Records,
  } = await getDoctorDashboardStats();

  // This data is for displaying the doctor's dashboard statistics
  const cardData = [
    {
      title: "Patients",
      value: totalPatient,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total patients",
      link: "/record/patients",
    },
    {
      title: "Nurses",
      value: totalNurses,
      icon: User,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Total nurses",
      link: "",
    },
    {
      title: "Appointments",
      value: totalAppointment,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Total appointments",
      link: "/record/appointments",
    },
    {
      title: "Consultation",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Total consultation",
      link: "/record/appointments",
    },
  ];

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className=" w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg xl:text-2xl font-semibold">
              Welcome, Doctor {user?.firstName} {user?.lastName}
            </h1>

            <Button size="sm" variant="outline" asChild>
              <Link href={`/record/doctors/${user?.id}`}>View Profile</Link>
            </Button>
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {cardData?.map((el, index) => (
              <StatCard
                key={index}
                title={el?.title}
                value={el?.value!}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                link={el.link}
                note={el.note}
              />
            ))}
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData!} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records!} />
        </div>
      </div>

      {/* the remaining 1% is for the gap  */}
      {/* RIGHT */}
      <div className=" w-full xl:w-[30%]">
        <div className="w-full h-[450px] mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointment!} />
        </div>
        {/* Available doctors section */}
        <AvailableDoctors data={availableDoctors as any} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
