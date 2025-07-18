import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { formatNumber } from '@/utils';

interface CardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    note: string;
    className?: string;
    iconClassName?: string;
    link: string;
}

// StatCard displays a statistic with a title, value, icon, note, and a link to details
// Props: title, value, icon, note, className, iconClassName, link
const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
    return <Icon />
}
export const StatCard = ({
    title,
    value,
    icon,
    note,
    className,
    iconClassName,
    link
}: CardProps) => {
    return <Card className= {cn("w-full md:w-[300px] 2xl:w-[250px]", className)}>
        <CardHeader className='flex flex-row items-center justify-between py-3 capitalize'>
            {/* Title and link to details */}
            <h3>{title}</h3>
            <Button asChild size={"sm"} variant={"outline"} className='font-normal text-xs bg-transparent p-2 h-0 hover:underline'>
                <Link href={link}>See details</Link>
            </Button>
        </CardHeader>

        <CardContent>
            <div className='flex items-center gap-4'>
                {/* Icon and value */}
                <div className={cn("w-10 h-10 bg-violet-50-500/15 rounded-full flex items-center justify-center text-violet-600",iconClassName)}>
                <CardIcon icon={icon}/>
                </div>
                <h2 className='text-2xl 2xl:text-3xl font-semibold'>
                    {formatNumber(value)}
                </h2>
            </div>
        </CardContent>
        {/* Note below the value */}
        <CardFooter className='pb-3'> 
            <p className='text-sm text-gray-500'>{note}</p>
        </CardFooter>
    </Card>
    
}
