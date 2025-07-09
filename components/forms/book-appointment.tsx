"use client";

import { AppointmentSchema } from "@/lib/schema";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Divide, UserPen } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";

const TYPES = [
    { label: "General Consultation", value: "General Consultation" },
    { label: "General Check up", value: "General Check Up" },
    { label: "Antenatal", value: "Antenatal" },
    { label: "Maternity", value: "Maternity" },
    { label: "Lab Test", value: "Lab Test" },
    { label: "ANT", value: "ANT" },
];

// BookAppointment provides a sheet dialog form for patients to book a new appointment.
// Handles form validation, submission, and user feedback.
export const BookAppointment = ({
    data,
    doctors,
}: {
    data: Patient;
    doctors: Doctor[];
}) => {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Generate available appointment times (8:00 to 17:00, every 30 min)
    const appointmentTimes = generateTimes(8, 17, 30);
    const patientName = `${data?.first_name} ${data?.last_name}`;
    const [physicians, setPhysicians] = useState<Doctor[] | undefined>(doctors);

    // Initialize the form with validation and default values
    const form = useForm<z.infer<typeof AppointmentSchema>>({
        resolver: zodResolver(AppointmentSchema),
        defaultValues: {
            doctor_id: "",
            appointment_date: "",
            time: "",
            type: "",
            note: "",
        },
    });
    
    // Handle form submission for creating a new appointment
    const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = { ...values, patient_id: data?.id! };
      console.log("Sending appointment data:", newData);

      const res = await createNewAppointment(newData);
      console.log("Server response:", res);

      if (res.success) {
        form.reset({});
        router.refresh();
        toast.success("Appointment created successfully");
      }
    } catch (error) {
        console.log("Error creating appointment:", error);
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white"
                >
                    <UserPen size={16} />
                </Button>
            </SheetTrigger>

            <SheetContent className="rounded-xl rounded-r-2xl md:h-p[95%] md:top-[2.5%] md:right-[1%] w-full">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <span>Loading</span>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-4">
                        <SheetHeader>
                            <SheetTitle>Book Appointment</SheetTitle>
                            <SheetDescription>
                                Please fill in the details below to book an appointment.
                            </SheetDescription>
                        </SheetHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8 mt-5 2xl:mt-10"
                            >
                                <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                                    <ProfileImage
                                        url={data?.img!}
                                        name={patientName}
                                        className="size-16 border border-input"
                                        bgColor={data?.colorCode!}
                                    />
                                    <div>
                                        <p className="font-semibold text-lg">{patientName}</p>
                                        <span className="text-sm text-gray-500 capitalize">
                                            {data?.gender}
                                        </span>
                                    </div>
                                </div>

                                <CustomInput
                                    type="select"
                                    selectList={TYPES}
                                    control={form.control}
                                    name="type"
                                    label="Appointment Type"
                                    placeholder="Select a appointment type"
                                />
                                {/* Physician Selection */}
                                <FormField
                                    control={form.control}
                                    name="doctor_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Physician</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a physician" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="">
                                                    {physicians?.map((i, id) => (
                                                        <SelectItem key={id} value={i.id} className="p-2">
                                                            <div className="flex flex-row gap-2 p-2">
                                                                <ProfileImage
                                                                    url={i?.img!}
                                                                    name={i?.name}
                                                                    bgColor={i?.colorCode!}
                                                                    textClassName="text-black"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-start ">
                                                                        {i.name}
                                                                    </p>
                                                                    <span className="text-sm text-gray-600">
                                                                        {i?.specialization}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Appointment Date and Time */}
                                <div className="flex items-center gap-2">
                                    {/* Appointment Date */}
                                    <CustomInput
                                        type="input"
                                        control={form.control}
                                        name="appointment_date"
                                        placeholder=""
                                        label="Date"
                                        inputType="date"
                                    />
                                    {/* Appointment Time */}
                                    <CustomInput
                                        type="select"
                                        control={form.control}
                                        name="time"
                                        placeholder="Select time"
                                        label="Time"
                                        selectList={appointmentTimes}
                                    />
                                </div>

                                {/* Additional Note */}
                                <CustomInput
                                    type="textarea"
                                    control={form.control}
                                    name="note"
                                    placeholder="Additional note"
                                    label="Additional Note"
                                />

                                {/* Submit Button */}
                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="bg-blue-600 w-full"
                                >
                                    Submit
                                </Button>


                            </form>
                        </Form>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
