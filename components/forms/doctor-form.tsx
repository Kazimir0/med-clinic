"use client";

import { DoctorSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { PlusIcon } from 'lucide-react';
import { Form } from '../ui/form';
import { CustomInput, SwitchInput } from '../custom-input';
import { spec } from 'node:test/reporters';
import { SPECIALIZATION } from '@/utils/settings';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { createNewDoctor } from '@/app/actions/admin';

const TYPES = [
    { label: "Full-Time", value: "FULL" },
    { label: "Part-Time", value: "PART" },
];

const WORKING_DAYS = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
];

type Day = {
    day: string;
    start_time?: string;
    close_time?: string;
};

// DoctorForm provides a sheet dialog form to add a new doctor to the platform.
// Handles form validation, submission, work schedule, and user feedback.
export const DoctorForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [workSchedule, setWorkSchedule] = useState<Day[]>([])

    // Initialize the form with validation and default values
    const form = useForm<z.infer<typeof DoctorSchema>>({
        resolver: zodResolver(DoctorSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            address: '',
            specialization: '',
            type: 'FULL',
            department: '',
            img: '',
            password: '',
            license_number: '',
        }
    });

    // Handle form submission for adding a new doctor
    const handleSubmit = async (values: z.infer<typeof DoctorSchema>) => {
        try {
            if (isLoading) return; // Prevent multiple submissions

            // if the work schedule is empty, show an error message
            if (workSchedule.length === 0) {
                toast.error('Please select at least one working day');
                return;
            }
            setIsLoading(true); // Set loading state to true because we are submitting the form
            const resp = await createNewDoctor({
                ...values,
                work_schedule: workSchedule,
            });
            if (resp.success) {
                toast.success('Doctor added successfully');
                setWorkSchedule([]); // Reset work schedule after successful submission
                form.reset(); // Reset the form fields
                router.refresh(); // Refresh the page to show the new doctor
            } else if (resp.error) {
                toast.error(resp.message);
            }

        } catch (error) {
            console.log(error)
            toast.error('Something went wrong. Please try again');
        } finally {
            setIsLoading(false); // Reset loading state after submission
        }
    }
    // Watch the specialization field to update department automatically
    const selectedSpecialization = form.watch('specialization');
    useEffect(() => {
        if (selectedSpecialization) {
            const department = SPECIALIZATION.find((el) => el.value === selectedSpecialization)

            if (department) {
                form.setValue('department', department.department);
            }
        }
    }, [selectedSpecialization]);
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <PlusIcon size={20} />
                    Add Doctor
                </Button>
            </SheetTrigger>
            <SheetContent className='rounded-xl rounded-r-xl md:h-[90%] md:top-[5%] md:right-[1%] w-full overflow-y-scroll'>
                <SheetHeader>
                    <SheetTitle>
                        Add New Doctor
                    </SheetTitle>
                </SheetHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8 mt-5 2xl:mt-10 px-4'>
                            <CustomInput type='radio' selectList={TYPES} control={form.control} name='type' label='Type' placeholder='' defaultValue='FULL' />
                            <CustomInput type='input' control={form.control} name='name' label='Full Name' placeholder="Doctor's name" />

                            <div className='flex items-center gap-2'>
                                <CustomInput type='select' control={form.control} name='specialization' label='Specialization' placeholder="Select specialization" selectList={SPECIALIZATION} />
                                <CustomInput type='input' control={form.control} name='department' label='Department' placeholder="OPD" />
                            </div>

                            <CustomInput type='input' control={form.control} name='license_number' label='License Number' placeholder="License Number" />

                            <div className='flex items-center gap-2'>
                                <CustomInput type='input' control={form.control} name='email' label='Email Address' placeholder="name@example.com" />
                                <CustomInput type='input' control={form.control} name='phone' label='Contact Number' placeholder="0701234567" />
                            </div>

                            <CustomInput type='input' control={form.control} name='address' label='Address' placeholder="123 Main St" />
                            <CustomInput type='input' control={form.control} name='password' label='Password' placeholder="" inputType='password' />
                            <div className='mt-6'>
                                <Label>Working Days</Label>
                                <SwitchInput data={WORKING_DAYS} setWorkSchedule={setWorkSchedule} workSchedule={workSchedule}  />
                            </div>

                            <Button type='submit' disabled={isLoading} className='w-full mb-3'>Submit</Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};
