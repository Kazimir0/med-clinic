import { ActionDialog } from '@/components/action-dialog';
import { ViewAction } from '@/components/action-options';
import { DoctorForm } from '@/components/forms/doctor-form';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getAllDoctors } from '@/utils/services/doctor';
import { DATA_LIMIT } from '@/utils/settings';
import { Doctor } from '@prisma/client';
import { format } from 'date-fns';
import { BriefcaseBusiness } from 'lucide-react';
import React from 'react'

const columns = [
  {
    header: "Info",
    key: "name",
  },
  {
    header: "License #",
    key: "license",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    key: "contact",
    className: "hidden md:table-cell",
  },
  {
    header: "Email",
    key: "email",
    className: "hidden lg:table-cell",
  },
  {
    header: "Joined Date",
    key: "created_at",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

const DoctorsList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string; // Current page number for pagination
  const searchQuery = (searchParams?.q || "") as string; // Search query for filtering doctors

  // Fetch the information
  const { data, totalPages, totalRecords, currentPage } = await getAllDoctors({
    page,
    search: searchQuery
  })


  if (!data) return null;
  const isAdmin = await checkRole('ADMIN'); // if the user is an admin, they can see the list of doctors

  const renderRow = (item: Doctor) => <tr key={item.id} className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50'>
    {/* Doctor info cell with profile image and name */}
    <td className='flex items-center gap-4 p-4'>
      <ProfileImage url={item?.img!} name={item?.name!} bgColor={item?.colorCode!} textClassName='text-white' />
      <div>
        <h3 className='uppercase'>{item?.name}</h3>
        <span className='text-sm capitalize'>{item?.specialization}</span>
      </div>
    </td>
    {/* License number */}
    <td className='hidden md:table-cell'>{item?.license_number}</td>
    {/* Phone number */}
    <td className='hidden md:table-cell'>{item?.phone}</td>
    {/* Email address */}
    <td className='hidden lg:table-cell'>{item?.email}</td>
    {/* Joined date */}
    <td className='hidden lg:table-cell'>{format(item.created_at, 'MMMM dd, yyyy')}</td>

    {/* Actions: view and delete (admin only) */}
    <td>
      <div className='flex items-center gap-2'>
      <ViewAction href={`doctors/${item?.id}`} />
      {isAdmin && <ActionDialog type="delete" id={item?.id} deleteType="doctor" />}
      </div>
    </td>
  </tr>


  return (
    <div className='bg-white rounded-xl py-6 px-3 2xl:px-6'>
      <div className='flex items-center justify-between'>
        {/* Total doctors summary */}
        <div className='hidden lg:flex items-center gap-1'>
          <BriefcaseBusiness size={20} className='text-gray-500' />
          <p className='text-2xl font-semibold'>{totalRecords}</p>
          <span className='text-gray-600 text-sm xl:text-base'>Total Doctors</span>
        </div>
        {/* Search and add doctor button (admin only) */}
        <div className='w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2'>
          <SearchInput />
          {/* only the admin can add doctors, first check if is admin*/}
          { isAdmin && <DoctorForm /> }
        </div>
      </div>

      <div className='mt-4'>
        {/* Doctors table */}
        <Table columns={columns} data={data} renderRow={renderRow} />
        {
          totalPages && <Pagination currentPage={currentPage} totalPages={totalPages} totalRecords={totalRecords} limit={DATA_LIMIT} />
        }
      </div>

    </div>
  )
}

export default DoctorsList