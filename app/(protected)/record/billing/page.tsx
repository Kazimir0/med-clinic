import { ActionDialog } from '@/components/action-dialog';
import { ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { cn } from '@/lib/utils';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getPaymentRecords } from '@/utils/services/payments';
import { DATA_LIMIT } from '@/utils/settings';
import { Patient, Payment, } from '@prisma/client';
import { format } from 'date-fns';
import { ReceiptText } from 'lucide-react';

const columns = [
    {
        header: "RNO", // record number
        key: "id",
    },
    {
        header: "Patient",
        key: "info",
        className: "",
    },
    {
        header: "Contact",
        key: "phone",
        className: "hidden md:table-cell",
    },
    {
        header: "Bill Date",
        key: "bill_date",
        className: "hidden md:table-cell",
    },
    {
        header: "Total",
        key: "total",
        className: "hidden xl:table-cell",
    },
    {
        header: "Discount",
        key: "discount",
        className: "hidden xl:table-cell",
    },
    {
        header: "Payable",
        key: "payable",
        className: "hidden xl:table-cell",
    },
    {
        header: "Paid",
        key: "paid",
        className: "hidden xl:table-cell",
    },
    {
        header: "Status",
        key: "status",
        className: "hidden xl:table-cell",
    },
    {
        header: "Actions",
        key: "action",
    },
];

interface ExtendedProps extends Payment {
    patient: Patient;
    index?: number;
}

const BillingPage = async (props: SearchParamsProps) => {
    // Get search params for pagination and filtering
    const searchParams = await props.searchParams;
    const page = (searchParams?.p || "1") as string;
    const searchQuery = (searchParams?.q || "") as string;

    // Fetch payment records from backend
    const { data, totalPages, totalRecords, currentPage } = await getPaymentRecords({
        page,
        search: searchQuery
    })
    // Check if user is admin for delete permissions
    const isAdmin = await checkRole('ADMIN');

    if (!data) return null;

    // Render a row for each payment record
    const renderRow = (item: ExtendedProps) => {
        const name = item?.patient?.first_name + " " + item?.patient?.last_name;
        const patient = item?.patient;

        const uniqueKey = `payment-${item?.id || 'unknown'}-${patient?.id || 'unknown'}-${item?.index || 0}`;

        return (
            <tr key={uniqueKey} className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50'>
                {/* Record number */}
                <td> # {item?.id || 'N/A'}</td>
                {/* Patient info */}
                <td className='flex items-center gap-4 p-4'>
                    <ProfileImage
                        url={patient?.img || ''}
                        name={name}
                        bgColor={patient?.colorCode || '#2563eb'}
                        textClassName='text-white'
                    />
                    <div>
                        <h3 className='uppercase'>{name}</h3>
                        <span className='text-sm capitalize'>{patient?.gender?.toLowerCase() || 'unknown'}</span>
                    </div>
                </td>

                {/* Patient contact */}
                <td className='hidden md:table-cell'>{patient?.phone || 'N/A'}</td>

                {/* Bill date */}
                <td className='hidden md:table-cell'>
                    {item?.bill_date ? format(item.bill_date, 'yyyy-MM-dd') : 'N/A'}
                </td>

                {/* Total amount */}
                <td className='hidden xl:table-cell'>
                    {item?.total_amount ? item.total_amount.toFixed(2) : '0.00'}
                </td>

                {/* Discount */}
                <td className='hidden xl:table-cell'>
                    {item?.discount ? item.discount.toFixed(2) : '0.00'}
                </td>

                {/* Payable amount */}
                <td className='hidden xl:table-cell'>
                    {item?.total_amount && item?.discount
                        ? (item.total_amount - item.discount).toFixed(2)
                        : '0.00'
                    }
                </td>

                {/* Amount paid */}
                <td className='hidden xl:table-cell'>
                    {item?.amount_paid ? item.amount_paid.toFixed(2) : '0.00'}
                </td>

                {/* Payment status */}
                <td className='hidden xl:table-cell'>
                    <span className={cn(
                        item?.status === 'UNPAID' ? 'text-red-500' :
                            item?.status === 'PAID' ? 'text-green-500' :
                                'text-gray-600'
                    )}>
                        {item?.status || 'UNKNOWN'}
                    </span>
                </td>

                {/* Actions: view and delete (admin only) */}
                <td className='flex items-center gap-2'>
                    <ViewAction href={`/record/appointments/${item?.appointment_id}?cat=billing`} />
                    {isAdmin && (
                        <ActionDialog
                            type='delete'
                            deleteType='payment'
                            id={item?.id?.toString() || ''}
                        />
                    )}
                </td>
            </tr>
        )
    };

    return (
        <div className='bg-white rounded-xl py-6 px-3 2xl:px-6'>
            <div className='flex items-center justify-between'>
                {/* Total records summary */}
                <div className='hidden lg:flex items-center gap-1'>
                    <ReceiptText size={20} className='text-gray-500' />
                    <p className='text-2xl font-semibold'>{totalRecords}</p>
                    <span className='text-gray-600 text-sm xl:text-base'>Total records</span>
                </div>
                {/* Search input */}
                <div className='w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2'>
                    <SearchInput />
                </div>
            </div>

            <div className='mt-4'>
                {/* Billing table */}
                <Table columns={columns} data={data} renderRow={renderRow} />
                {/* Pagination controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    limit={DATA_LIMIT}
                />
            </div>
        </div>
    )
}

export default BillingPage;