"use client";
import { AppointmentChartProps } from '@/types/data-types';
import React from 'react'
import { ResponsiveContainer, BarChart, CartesianGrid, Legend, Bar, Tooltip, XAxis, YAxis } from 'recharts';

interface DataProps {
    data: AppointmentChartProps
}

// AppointmentChart displays a bar chart of appointment statistics using recharts.
export const AppointmentChart = ({ data }: DataProps) => {
    return (
        <div className='bg-white rounded-xl p-4 h-full' >
            {/* Header section with title */}
            <div className='flex justify-between items-center '>
                <h1 className='text-lg font-semibold'>Appointments</h1>
            </div>
            {/* Responsive bar chart container */}
            <ResponsiveContainer width="100%" height="90%">
                <BarChart width={100} height={300} data={data} barSize={25}>
                    {/* Grid lines for chart background */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd' />

                    {/* X-axis for category names */}
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tick={{ fill: "#9ca3af" }}
                        tickLine={false}
                    />
                    {/* Y-axis for values */}
                    <YAxis axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} />
                    {/* Tooltip on hover */}
                    <Tooltip
                        contentStyle={{ borderRadius: "10px", borderColor: "#fff" }}
                    />
                    {/* Legend for bar colors */}
                    <Legend
                        align="left"
                        verticalAlign="top"
                        wrapperStyle={{
                            paddingTop: "20px",
                            paddingBottom: "40px",
                            textTransform: "capitalize",
                        }}
                    />
                    {/* Bar for total appointments */}
                    <Bar
                        dataKey="appointment"
                        fill="#000000"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                    {/* Bar for completed appointments */}
                    <Bar
                        dataKey="completed"
                        fill="#2563eb"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
