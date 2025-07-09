import { getRatingById } from '@/utils/services/doctor';
import React from 'react'
import { RatingList } from './rating-list';
import { RatingChart } from './charts/rating-chart';

// RatingContainer fetches and displays a rating chart and list for a given doctor or staff member
// Uses the provided id to fetch ratings, total count, and average rating
export const RatingContainer = async({id}: {id:string}) => {
    const {ratings,totalRatings,averageRating} = await getRatingById(id);
    return (
        <div className='space-y-4'>
            {/* Show a chart with total and average ratings */}
            <RatingChart totalRatings={totalRatings!} averageRating={Number(averageRating)!}/>
            {/* Show a list of individual ratings */}
            <RatingList data={ratings!}/>
        </div>
    )
}
