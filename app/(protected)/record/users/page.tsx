import { Table } from '@/components/tables/table';
import { clerkClient } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { BriefcaseBusiness } from 'lucide-react';
import React from 'react'

const columns = [
    {
        header: "user ID",
        key: "id",
        className: "hidden lg:table-cell",
    },
    {
        header: "Name",
        key: "name",
    },
    {
        header: "Email",
        key: "email",
        className: "hidden md:table-cell",
    },
    {
        header: "Role",
        key: "role",
    },
    {
        header: "Status",
        key: "status",
    },
    {
        header: "Last Login",
        key: "last_login",
        className: "hidden xl:table-cell",
    },
];


interface UserProps {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: { emailAddress: string }[];
    publicMetadata: { role: string };
    lastSignInAt: number | string;
}

  const renderRow = (item: UserProps) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-base hover:bg-slate-50"
    >
      {/* User ID (hidden on small screens) */}
      <td className="hidden lg:table-cell items-center">{item?.id}</td>
      {/* User full name */}
      <td className="table-cell py-2 xl:py-4">
        {item?.firstName} {item?.lastName}
      </td>
      {/* Email address */}
      <td className="table-cell">{item?.emailAddresses[0].emailAddress}</td>
      {/* User role */}
      <td className="table-cell capitalize">{item?.publicMetadata.role}</td>
      {/* Status (always Active here) */}
      <td className="hidden md:table-cell capitalize">Active</td>
      {/* Last login date */}
      <td className="hidden md:table-cell capitalize">
        {format(item?.lastSignInAt, "yyyy-MM-dd h:mm:ss")}
      </td>
    </tr>
  );

const UserPage = async () => {
    // Fetch user list from Clerk
    const client = await clerkClient();
    const { data, totalCount } = await client.users.getUserList({
        orderBy: "-created_at" // in descending order
    });

    return (
        <div className='bg-white rounded-xl p-2 md:p-4 2xl:p-6'>
            <div className='flex items-center justify-between'>
                {/* Total users summary */}
                <div className='hidden lg:flex items-center gap-1'>
                    <BriefcaseBusiness size={20} className='text-gray-500' />
                    <p className='text-2xl font-semibold'>{totalCount}</p>
                    <span className='text-gray-600 text-sm xl:text-base'>Total Users</span>
                </div>
            </div>
            <div>
                {/* Users table */}
                <Table columns={columns} data={data} renderRow={renderRow} />
            </div>
        </div>
    )
}

export default UserPage