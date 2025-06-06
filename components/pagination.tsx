"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react'
import { Button } from './ui/button';


interface PaginationProps {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
}
export const Pagination = ({ totalRecords, currentPage, totalPages, limit }: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();


    // Create a function to generate the query string with updated page number
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );


    // Handle the previous page click
    const handlePrevious = () => {
        if (currentPage > 1) { // Check if current page is greater than 1
            // Update the URL with the new page number
            router.push(
                pathname + "?" + createQueryString("p", (currentPage - 1).toString())
            );
            // router.push(`?p=${currentPage - 1}`);
        }
    };

    // Handle the next page click
    const handleNext = () => {
        if (currentPage < totalPages) { // Check if current page is less than total pages
            // Update the URL with the new page number
            // router.push(`?p=${currentPage + 1}`);
            router.push(
                pathname + "?" + createQueryString("p", (currentPage + 1).toString())
            );
        }
    };

    if (totalRecords === 0) return null; // If no records, do not render pagination

    return <div className='p-4 flex items-center justify-between text-gray-600 mt-5'>
        {/* if currentPage = 1 then disable 'previous' button */}
        <Button size={"sm"} variant="outline" disabled={currentPage === 1} onClick={handlePrevious} className='py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'>
            Previous
        </Button>

        {/* 10 - 9 = 11 - 20 of 20 */}
        <div className="flex items-center gap-2 text-sm">
            <span className="text-xs lg:text-sm">
                Showing {currentPage * limit - (limit - 1)} to{" "}
                {currentPage * limit <= totalRecords
                    ? currentPage * limit
                    : totalRecords}{" "}
                of {totalRecords}
            </span>
        </div>

        {/* if currentPage = totalPages(max number) then disable 'next' button */}
        <Button size={"sm"} variant="outline" disabled={currentPage === totalPages} onClick={handleNext} className='py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'>
            Next
        </Button>


    </div>
};
