"use client";

import { useUser } from '@clerk/nextjs';
import { Patient } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form } from './ui/form';
import { useForm } from 'react-hook-form';
import { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PatientFormSchema } from '@/lib/schema';
import { CustomInput } from './custom-input';
import { GENDER, MARITAL_STATUS, RELATION } from '@/lib';

interface DataProps {
  data?: Patient;
  type: "create" | "update";
}
export const NewPatient = ({ data, type }: DataProps) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imgURL, setImgURL] = useState<any>();
  const router = useRouter();

  const userData = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses[0].emailAddress || "",
    phone: user?.phoneNumbers?.toString() || "",
  };


  const form = useForm <z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema) as unknown as Resolver<z.infer<typeof PatientFormSchema>>,
    defaultValues: {
      ...userData,
      address: "",
      date_of_birth: new Date(),
      gender: undefined,
      marital_status: undefined,
      emergency_contact_name: "",
      emergency_contact_number: "",
      relation: undefined,
      blood_group: "",
      allergies: "",
      medical_conditions: "",
      insurance_number: "",
      insurance_provider: "",
      medical_history: "",
    },
  });

  return (
    <Card className='max-w-6xl w-full p-4'>
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
        <CardDescription>
          Please provide all the information below to help us understand
          better and provide good and quality service to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action="" onSubmit={() => {} } className='space-y-8 mt-5'>
            <h3 className='text-lg font-semibold'>Personal Information</h3>
            <>
            {/* <ImagePicker /> */}

            <div className='flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4'>
              <CustomInput type="input" control={form.control} name="first_name" placeholder="First Name" label="First Name" />
              <CustomInput type="input" control={form.control} name="last_name" placeholder="Last Name" label="Last Name" />
            </div>

            <CustomInput type="input" control={form.control} name="email" placeholder="email@example.com" label="Email Address" />

            <div  className='flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4'>
            <CustomInput type="select" control={form.control} name="gender" placeholder="Select Gender" label="Gender" selectList={GENDER}/>
            <CustomInput type="input" control={form.control} name="date_of_birth" placeholder="01-01-2002" label="Date of Birth" inputType='date'/>
            </div>

            <div className='flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4'>
            <CustomInput type="input" control={form.control} name="phone" placeholder="0757828463" label="Contact Number" />
            <CustomInput type="select" control={form.control} name="marital_status" placeholder="Select marital status" label="Marital Status" selectList={MARITAL_STATUS} />
            </div>

            <CustomInput type="input" control={form.control} name="address" placeholder="Street Address" label="Address" />

            <div className='space-y-8'>
              <h3 className='text-lg font-semibold'>Family Information</h3>
              <CustomInput type="input" control={form.control} name="emergency_contact_name" placeholder="Contact name" label="Emergency contact name" />
              <CustomInput type="input" control={form.control} name="emergency_contact_number" placeholder="0757828463" label="Emergency contact" />
              <CustomInput type="select" control={form.control} name="relation" placeholder="Select relation with contact person" label="Relation" selectList={RELATION} />
            </div>

            </>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
};