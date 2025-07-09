import React from 'react'
import { Card } from '../ui/card';
import { Diagnosis, Doctor } from '@prisma/client';
import { Separator } from '../ui/separator';

// ExtendedMedicalRecord includes diagnosis info and the associated doctor
interface ExtendedMedicalRecord extends Diagnosis {
    doctor: Doctor;
}

/**
 * MedicalHistoryCard displays a single diagnosis record with details.
 * - Shows appointment ID, date, diagnosis, symptoms, notes, and doctor info.
 * - Highlights the most recent record with a 'Recent' label.
 */
export const MedicalHistoryCard = ({ record, index }: { record: ExtendedMedicalRecord; index: number; }) => {
    return (
        <Card className='shadow-none'>
            <div className='space-y-6 pt-4 mx-2'>
                <div className='flex gap-x-6 justify-between'>
                    <div>
                        <span className='text-sm text-gray-500'>Appointment ID</span>
                        <p className='text-xl font-medium'># {record.id}</p>
                    </div>
                    {/* Show 'Recent' label for the first record in the list */}
                    {index === 0 && <div className='px-4 h-8 text-center bg-blue-100 rounded-full font-semibold text-blue-600'>
                        <span>Recent</span>
                    </div>}
                    <div>
                        <span className='text-sm text-gray-500'>Date</span>
                        <p className='text-xl font-medium'>{record.created_at.toLocaleDateString()}</p>
                    </div>
                </div>
                <Separator />
                {/* Diagnosis details */}
                <div>
                    <span className='text-sm text-gray-500'>Diagnosis</span>
                    <p className='text-lg text-muted-foreground'>{record.diagnosis}</p>
                </div>
                <Separator />
                <div>
                    <span className='text-sm text-gray-500'>Symptoms</span>
                    <p className='text-lg text-muted-foreground'>{record.symptoms}</p>
                </div>
                <Separator />
                <div>
                    <span className='text-sm text-gray-500'>Additional Notes</span>
                    <p className='text-lg text-muted-foreground'>{record.notes}</p>
                </div>
                <Separator />
                {/* Doctor info */}
                <div>
                    <span className='text-sm text-gray-500'>Doctor</span>
                    <div>
                        <p className='text-lg text-muted-foreground'>{record.doctor.name}</p>
                        <span>{record.doctor.specialization}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
