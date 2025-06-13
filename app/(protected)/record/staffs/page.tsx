import { ActionDialog } from '@/components/action-dialog';
import { ViewAction } from '@/components/action-options';
import { DoctorForm } from '@/components/forms/doctor-form';
import { StaffForm } from '@/components/forms/staff-form';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getAllStaff } from '@/utils/services/staff';
import { DATA_LIMIT } from '@/utils/settings';
import { Doctor, Staff } from '@prisma/client';
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

const StaffList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string; // Current page number for pagination
  const searchQuery = (searchParams?.q || "") as string; // Search query for filtering doctors

  // Fetch the information
  const { data, totalPages, totalRecords, currentPage } = await getAllStaff({
    page,
    search: searchQuery
  })


  if (!data) return null;
  const isAdmin = await checkRole('ADMIN'); // if the user is an admin, they can see the list of doctors

//   console.log(data);

  const renderRow = (item: Staff
  ) => <tr key={item.id} className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50'>
    <td className='flex items-center gap-4 p-4'>
      <ProfileImage url={item?.img!} name={item?.name!} bgColor={item?.colorCode!} textClassName='text-white' />
      <div>
        <h3 className='uppercase'>{item?.name}</h3>
        <span className='text-sm capitalize'>{item?.phone}</span>
      </div>
    </td>
    <td className='hidden md:table-cell'>{item?.role}</td>
    <td className='hidden md:table-cell'>{item?.phone}</td>
    <td className='hidden lg:table-cell'>{item?.email}</td>
    <td className='hidden lg:table-cell'>{format(item.created_at, 'MMMM dd, yyyy')}</td>

    <td>
      <div className='flex items-center gap-2'>
      <ActionDialog type="staff" id={item?.id} data={item} />

      {isAdmin && <ActionDialog type="delete" id={item?.id} deleteType="staff" />}
      </div>
    </td>
  </tr>


  return (
    <div className='bg-white rounded-xl py-6 px-3 2xl:px-6'>
      <div className='flex items-center justify-between'>
        <div className='hidden lg:flex items-center gap-1'>
          <BriefcaseBusiness size={20} className='text-gray-500' />
          <p className='text-2xl font-semibold'>{totalRecords}</p>
          <span className='text-gray-600 text-sm xl:text-base'>Total Staffs</span>
        </div>
        <div className='w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2'>
          <SearchInput />
          { isAdmin && <StaffForm /> }
        </div>
      </div>

      <div className='mt-4'>
        <Table columns={columns} data={data} renderRow={renderRow} />
        {
          totalPages && <Pagination currentPage={currentPage} totalPages={totalPages} totalRecords={totalRecords} limit={DATA_LIMIT} />
        }
      </div>

    </div>
  )
}

export default StaffList;