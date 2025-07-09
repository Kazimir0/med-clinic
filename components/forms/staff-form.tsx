"use client";

import { DoctorSchema, StaffSchema } from '@/lib/schema';
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
import { toast } from 'sonner';
import { createNewDoctor, createNewStaff } from '@/app/actions/admin';

const TYPES = [
    { label: "Nurse", value: "NURSE" },
    { label: "Laboratory", value: "LAB_TECHNICIAN" },
];

// StaffForm provides a sheet dialog form to add a new staff member (nurse or lab technician).
// Handles form validation, submission, and user feedback.
export const StaffForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Initialize the form with validation and default values
    const form = useForm<z.infer<typeof StaffSchema>>({
        resolver: zodResolver(StaffSchema),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            role: 'NURSE', // Default role for staff
            address: '',
            department: '',
            img: '',
            password: '',
            license_number: '',
        }
    });

    // Handle form submission for adding a new staff member
    const handleSubmit = async (values: z.infer<typeof StaffSchema>) => {
        try {
            setIsLoading(true); // Set loading state to true because we are submitting the form
            const resp = await createNewStaff(values);

            if (resp.success) {
                toast.success('Staff added successfully');
                form.reset(); // Reset the form fields
                router.refresh(); // Refresh the page to show the new staff
            } else if (resp.error) {
                toast.error(resp.message);
            }

        } catch (error) {
            console.log(error)
            toast.error('Something went wrong. Please try again');
        }finally{
            setIsLoading(false);
        }
    };


    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <PlusIcon size={20} />
                    Add Staff
                </Button>
            </SheetTrigger>
            <SheetContent className='rounded-xl rounded-r-xl md:h-[90%] md:top-[5%] md:right-[1%] w-full overflow-y-scroll'>
                <SheetHeader>
                    <SheetTitle>
                        Add New Staff
                    </SheetTitle>
                </SheetHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8 mt-5 2xl:mt-10 px-4'>
                            <CustomInput type='radio' selectList={TYPES} control={form.control} name='role' label='Type' placeholder='' defaultValue='NURSE' />
                            <CustomInput type='input' control={form.control} name='name' label='Full Name' placeholder="Staff's name" />

                            <div className='flex items-center gap-2'>
                                <CustomInput type='input' control={form.control} name='email' label='Email Address' placeholder="name@example.com" />
                                <CustomInput type='input' control={form.control} name='phone' label='Contact Number' placeholder="0701234567" />
                            </div>

                            <CustomInput type='input' control={form.control} name='license_number' label='License Number' placeholder="License Number" />
                            <CustomInput type='input' control={form.control} name='department' label='Department' placeholder="Type any department" />

                            <CustomInput type='input' control={form.control} name='address' label='Address' placeholder="123 Main St" />
                            <CustomInput type='input' control={form.control} name='password' label='Password' placeholder="" inputType='password' />

                            <Button type='submit' disabled={isLoading} className='w-full mb-3'>Submit</Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};
