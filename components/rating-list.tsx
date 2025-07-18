import { Star } from 'lucide-react';
import React from 'react'

interface DataProps {
    id: number;
    staff_id: string;
    rating: number;
    comment?: string;
    created_at: Date | string;
    patient: { last_name: string; first_name: string };
}

// RatingList displays a list of patient ratings with stars, comments, and patient info
// Props: data (array of rating objects)
export const RatingList = ({ data }: { data: any[] }) => {
    return <div className="bg-white rounded-lg">
        <div className='flex items-center justify-between p-4'>
            <h1 className='text-xl font-semibold'>Patient Ratings</h1>
        </div>
        <div className='space-y-2 p-2'>
            {data?.map((rate, id) => (
                <div key={rate?.id} className='even:bg-gray-50 p-3 rounded'>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-4'>
                            {/* Patient name and date */}
                            <p className='text-base font-medium'>
                                {rate?.patient?.first_name + " " + rate?.patient?.last_name}
                            </p>
                            <span className='text-sm text-gray-500'>{
                                new Date(rate?.created_at).toLocaleDateString()
                            }</span>
                        </div>

                        <div className='flex flex-col items-center'>
                            {/* Star icons for rating value */}
                            <div className='flex items-center text-yellow-600'>
                                {Array.from({ length: rate.rating }, (_, index) => (
                                    <Star key={index} className='text-lg ' />
                                ))}
                            </div>
                            <span className=''>{rate.rating}</span>
                        </div>
                    </div>
                    {/* Comment or fallback if none */}
                    <div className="text-sm text-gray-500">
                        <p>{rate?.comment || "No comment provided"}</p>
                    </div>
                </div>
            ))}
            {/* Show message if there are no ratings */}
            {
                data?.length === 0 && (
                    <div className='px-2 text-gray-600'>
                        <p>No ratings found</p>
                    </div>)
            }
        </div>
    </div>

}
