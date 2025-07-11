import { AvailableDoctorProps } from "@/types/data-types";
import { checkRole } from "@/utils/roles";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Card } from "./ui/card";
import { ProfileImage } from "./profile-image";
import { daysOfWeek } from "@/utils";

const getToday = () => {
    const today = new Date().getDay();
    // console.log("Today index:", today);
    //  console.log("Today mapped:", daysOfWeek[today]);
    return daysOfWeek[today];
};

const debugWorkingHours = (workingDays: Days[]) => {
    const todayIndex = new Date().getDay();
    const todayName = daysOfWeek[todayIndex];
    console.log("Today index:", todayIndex);
    console.log("Today name:", todayName);
    console.log("Working days:", workingDays);
    console.log("Day names in array:", daysOfWeek);
    
    return workingDays.find(day => day.day.toLowerCase() === todayName.toLowerCase());
}

const todayDay = getToday();

interface Days {
    day: string;
    start_time: string;
    close_time: string;
}

interface DataProps {
    data: AvailableDoctorProps;
}

// availableDays returns the working hours for today if the doctor is available, otherwise 'Not Available'.
export const availableDays = ({ data }: { data: Days[] }) => {
    const isTodayWorkingDay = data?.find(
        (dayObj) => dayObj?.day.toLowerCase() === todayDay.toLowerCase()
    );

    return isTodayWorkingDay
        ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.close_time}`
        : "Not Available";
};

// AvailableDoctors displays a list of available doctors with their profile, specialization, and today's working hours.
// Only admins see the 'View All' button.
export const AvailableDoctors = async ({
    data,
}: DataProps) => {
    return (
        <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-semibold">Available Doctors</h1>
                {/* Show 'View All' button for admins if there are doctors */}
                {(await checkRole("ADMIN")) && (
                    <Button
                        asChild
                        variant="outline"
                        disabled={data.length === 0}
                        className="disabled:cursor-not-allowed disabled:text-gray-200"
                    >
                        <Link href="/record/doctors">View All</Link>
                    </Button>
                )}
            </div>
            {/* Render a card for each available doctor */}
            <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
                {data?.map((doc, id) => (
                    <Card
                        key={id}
                        className="border-none w-full md:w-[300px] min-h-28 xl:w-full p-4 flex gap-4 odd:bg-emerald-600/5 even:bg-yellow-600/5"
                    >
                        <ProfileImage
                            url={doc?.img}
                            name={doc?.name}
                            className={`md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16`}
                            textClassName="text-2xl font-semibold"
                            bgColor={doc?.colorCode!}
                        />
                        <div>
                            <h2 className="font-semibold text-lg md:text-xl">{doc?.name}</h2>
                            <p className="text-base capitalize text-gray-600">{doc?.specialization}</p>
                            <p className="text-sm flex items-center">
                                <span className="hidden lg:flex">Available Time:</span>
                                {availableDays({ data: doc?.working_days })}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
