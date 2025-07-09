import { NewPatient } from '@/components/new-patient'
import { getPatientById } from '@/utils/services/patient';
import { auth } from '@clerk/nextjs/server'
import React from 'react'

const Registration = async () => {
  // Get current user ID from authentication
  const { userId } = await auth();
  // Fetch patient data for the current user
  const { data } = await getPatientById(userId!)

  return (
    <div className='w-full h-full flex justify-center'>
      <div className='max-w-6xl w-full relative pb-10'>
        {/* Render the NewPatient form, using 'create' or 'update' mode based on data presence */}
        <NewPatient data={data!} type={!data ? "create" : "update"} />
      </div>
    </div>
  );
};

export default Registration;