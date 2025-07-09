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

// Pagination component provides navigation controls for paginated data tables or lists
// Handles updating the URL query string to reflect the current page
export const Pagination = ({ totalRecords, currentPage, totalPages, limit }: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();


    // Helper to generate a new query string with the updated page number
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );


    // Go to the previous page if not on the first page
    const handlePrevious = () => {
        if (currentPage > 1) { // Check if current page is greater than 1
            // Update the URL with the new page number
            router.push(
                pathname + "?" + createQueryString("p", (currentPage - 1).toString())
            );
        }
    };

    // Go to the next page if not on the last page
    const handleNext = () => {
        if (currentPage < totalPages) { // Check if current page is less than total pages
            // Update the URL with the new page number
            router.push(
                pathname + "?" + createQueryString("p", (currentPage + 1).toString())
            );
        }
    };

    if (totalRecords === 0) return null; // Hide pagination if there are no records

    return <div className='p-4 flex items-center justify-between text-gray-600 mt-5'>
        {/* Previous button, disabled on first page */}
        <Button size={"sm"} variant="outline" disabled={currentPage === 1} onClick={handlePrevious} className='py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'>
            Previous
        </Button>

        {/* Display current range of records */}
        <div className="flex items-center gap-2 text-sm">
            <span className="text-xs lg:text-sm">
                Showing {currentPage * limit - (limit - 1)} to{" "}
                {currentPage * limit <= totalRecords
                    ? currentPage * limit
                    : totalRecords}{" "}
                of {totalRecords}
            </span>
        </div>

        {/* Next button, disabled on last page */}
        <Button size={"sm"} variant="outline" disabled={currentPage === totalPages} onClick={handleNext} className='py-2 px-4 rounded-md bg-slate-200 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'>
            Next
        </Button>
    </div>
};
