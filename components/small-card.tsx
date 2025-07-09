import { cn } from '@/lib/utils'
import React from 'react'

// SmallCard displays a label and value, useful for showing summary stats or info in a compact format
// Props: label (string), value (string), className (optional for custom styling)
export const SmallCard = ({ label, value, className }: { label: string, value: string, className?: string }) => {
    return (
        <div className='w-full md:w-1/3'>
            <span className='text-sm text-gray-400 '>{label}</span>
            <p className={cn("text-sm md:text-base", className)}>{value}</p>
        </div>
    )
}
