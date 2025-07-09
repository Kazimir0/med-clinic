"use client";

import React from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

// RatingChart displays a pie chart of average ratings using recharts.
// Shows positive vs. negative ratings visually, with a central label for the average.
export const RatingChart = ({
    totalRatings,
    averageRating,
}: {
    totalRatings: number;
    averageRating: number;
}) => {
    // Calculate the negative portion as the difference from max rating (5)
    const negative = 5 - averageRating;

    // Data for the pie chart: positive and negative segments
    const data = [
        { name: "Positive", value: averageRating, fill: "#4CAF50" },
        { name: "Negative", value: negative, fill: "#F44336" },
    ]
    return <div className="bg-white p-4 rounded-md h-80 relative">
        {/* Header section */}
        <div className="flex items-center justify-between ">
            <h1 className="text-xl font-semibold">Ratings</h1>
        </div>
        {/* Responsive pie chart container */}
        <ResponsiveContainer width={"100%"} height={"100%"}>
            <PieChart>
                <Pie
                    dataKey={"value"}
                    startAngle={180}
                    endAngle={0}
                    data={data}
                    cx={"50%"}
                    cy={"50%"}
                    innerRadius={70}
                    fill="#8884d8"
                />
            </PieChart>
        </ResponsiveContainer>
        {/* Center label for average rating */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-2xl font-bold">{averageRating?.toFixed(1)}</h1>
            <p className="text-xs text-gray-500">of max ratings</p>
        </div>
        {/* Footer label for total ratings */}
        <h2 className="font-medium absolute bottom-16 left-0 right-0  m-auto text-center">Rated by: {totalRatings} patients</h2>
    </div>;
};
