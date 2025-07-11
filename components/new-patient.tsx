"use client";

import { useUser } from '@clerk/nextjs';
import { Patient } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form } from './ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PatientFormSchema } from '@/lib/schema';
import { CustomInput } from './custom-input';
import { GENDER, MARITAL_STATUS, RELATION } from '@/lib';
import { Button } from './ui/button';
import { createNewPatient, updatePatient } from '@/app/actions/patient';
import { toast } from 'sonner';

interface DataProps {
  data?: Patient;
  type: "create" | "update";
}

// NewPatient component handles both patient registration and update forms
// Uses react-hook-form and zod for validation, and supports pre-filling data for updates
export const NewPatient = ({ data, type }: DataProps) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imgURL, setImgURL] = useState<any>();
  const router = useRouter();

  // Prepare default user data for form fields
  const userData = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses[0].emailAddress || "",
    phone: user?.phoneNumbers?.toString() || "",
  };

  const userId = user?.id;
  // Set up form with zod schema and default values
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

  // Handle form submission for create or update
  const onSubmit: SubmitHandler<z.infer<typeof PatientFormSchema>> = async(values) =>{
    setLoading(true);
    const res = type === "create" ? await createNewPatient(values, userId!) : await updatePatient(values, userId!);
    setLoading(false);
    if(res?.success){
      toast.success(res.msg);
      form.reset();
      router.push("/patient");
    }else{
      console.log(res);
      toast.error("Failed to create patient, please try again");
    }
  };

  // Pre-fill form fields based on type (create or update)
  useEffect(() => {
    if (type === "create") {
      userData && form.reset({ ...userData });
    } else if (type === "update") {
      data &&
        form.reset({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          date_of_birth: new Date(data.date_of_birth),
          gender: data.gender,
          marital_status: data.marital_status as
            | "married"
            | "single"
            | "divorced"
            | "widowed"
            | "separated",
          address: data.address,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_number: data.emergency_contact_number,
          relation: data.relation as
            | "mother"
            | "father"
            | "husband"
            | "wife"
            | "other",
          blood_group: data?.blood_group!,
          allergies: data?.allergies! || "",
          medical_conditions: data?.medical_conditions! || "",
          medical_history: data?.medical_history! || "",
          insurance_number: data.insurance_number! || "",
          insurance_provider: data.insurance_provider! || "",
          medical_consent: data.medical_consent,
          privacy_consent: data.privacy_consent,
          service_consent: data.service_consent,
        });
    }
  }, [user]);

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
          <form action="" onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 mt-5'>
            {/* Personal Information Section */}
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
            </>

            {/* Family Information Section */}
            <div className='space-y-8'>
              <h3 className='text-lg font-semibold'>Family Information</h3>
              <CustomInput type="input" control={form.control} name="emergency_contact_name" placeholder="Contact name" label="Emergency contact name" />
              <CustomInput type="input" control={form.control} name="emergency_contact_number" placeholder="0757828463" label="Emergency contact" />
              <CustomInput type="select" control={form.control} name="relation" placeholder="Select relation with contact person" label="Relation" selectList={RELATION} />
            </div>

            {/* Medical Information Section */}
            <div className='space-y-8'>
              <h3 className='text-lg font-semibold'>Medical Information</h3>
              <CustomInput type="input" control={form.control} name="blood_group" placeholder="A++" label="Blood group" />
              <CustomInput type="input" control={form.control} name="allergies" placeholder="Milk" label="Allergies" />
              <CustomInput type="input" control={form.control} name="medical_conditions" placeholder="Medical conditions" label="Medical conditions" />
              <CustomInput type="input" control={form.control} name="medical_history" placeholder="Medical history" label="Medical history" />

              <div className='flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-4'>
                <CustomInput type="input" control={form.control} name="insurance_provider" placeholder="Insurance provider" label="Insurance provider" />
                <CustomInput type="input" control={form.control} name="insurance_number" placeholder="Insurance number" label="Insurance number" />
              </div>

            </div>

            {/* Consent Section, only for new registrations */}
            {type !== "update" && (
              <div className="">
                <h3 className="text-lg font-semibold mb-2">Consent</h3>

                <div className="space-y-6">
                  <CustomInput
                    name="privacy_consent"
                    label=" Privacy Policy Agreement"
                    placeholder=" I consent to the collection, storage, and use of my\n                    personal and health information as outlined in the Privacy\n                    Policy. I understand how my data will be used, who it may\n                    be shared with, and my rights regarding access,\n                    correction, and deletion of my data."
                    type="checkbox"
                    control={form.control}
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="service_consent"
                    label=" Terms of Service Agreement"
                    placeholder=" I agree to the Terms of Service, including my\n                    responsibilities as a user of this healthcare management\n                    system, the limitations of liability, and the dispute\n                    resolution process. I understand that continued use of\n                    this service is contingent upon my adherence to these\n                    terms."
                  />

                  <CustomInput
                    control={form.control}
                    type="checkbox"
                    name="medical_consent"
                    label="Informed Consent for Medical Treatment"
                    placeholder="I provide informed consent to receive medical treatment\n                    and services through this healthcare management system. I\n                    acknowledge that I have been informed of the nature,\n                    risks, benefits, and alternatives to the proposed\n                    treatments and that I have the right to ask questions and\n                    receive further information before proceeding."
                  />
                </div>
              </div>
            )}
            {/* Submit button */}
            <Button disabled={loading} type='submit' className='w-full md:w-fit px-6'>
              {type === "create" ? "Submit" : "Update"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
};