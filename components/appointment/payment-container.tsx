import db from '@/lib/db';
import { checkRole } from '@/utils/roles';
import { Payment, PaymentStatus } from '@prisma/client';
import { format } from 'date-fns';
import React from 'react'
import { Table } from '../tables/table';
import { PayButton } from '../pay-button';
import { ActionDialog } from '../action-dialog';

const columns = [
    {
        header: "No",
        key: "id",
    },
    {
        header: "Bill Date",
        key: "bill_date",
        className: "",
    },
    {
        header: "Payment Date",
        key: "pay_date",
        className: "hidden md:table-cell",
    },
    {
        header: "Total",
        key: "total",
        className: "",
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
        header: "Actions",
        key: "action",
    },
];
export const PaymentsContainer = async ({ patientId }: { patientId: string }) => {
    const data = await db.payment.findMany({
        where: { patient_id: patientId },
    });

    if (!data) return null;

    const isAdmin = await checkRole("ADMIN");
    const isPatient = await checkRole("PATIENT");

    const renderRow = (item: Payment) => {
        // Determine if the payment is fully paid or partially paid
        const isPaid = item.status === PaymentStatus.PAID;
        const isPending = item.status === PaymentStatus.PART;

        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
            >
                {/* Payment ID */}
                <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
                    #{item?.id}
                </td>

                {/* Bill date */}
                <td className="lowercase">{format(item?.bill_date, "MMM d, yyyy")}</td>
                {/* Payment date, hidden on small screens */}
                <td className="hidden  items-center py-2  md:table-cell">
                    {format(item?.payment_date, "MMM d, yyyy")}
                </td>
                {/* Total amount */}
                <td className="">{item?.total_amount.toFixed(2)}</td>
                {/* Discount, hidden on small screens */}
                <td className="hidden xl:table-cell">{item?.discount.toFixed(2)}</td>
                {/* Payable amount (total - discount), hidden on small screens */}
                <td className="hidden xl:table-cell">
                    {(item?.total_amount - item?.discount).toFixed(2)}
                </td>
                {/* Amount paid, hidden on small screens */}
                <td className="hidden xl:table-cell">{item?.amount_paid.toFixed(2)}</td>

                {/* Actions: Pay button for patients, status label, and delete for admins */}
                <td className="">
                    <div className="flex items-center">
                        {/* Show Pay button if patient and payment is not complete */}
                        {isPatient && item.amount_paid < (item.total_amount - item.discount) ? (
                            <PayButton paymentId={item.id.toString()} />
                        ) : (
                            // Show payment status label
                            <span className={`font-medium ${item.amount_paid >= (item.total_amount - item.discount) ? "text-green-600" : "text-amber-600"}`}>
                                {item.amount_paid >= (item.total_amount - item.discount)
                                    ? "Payment Complete"
                                    : "Payment Pending"}
                            </span>
                        )}
                        {/* Show delete action for admins */}
                        {isAdmin && (
                            <ActionDialog
                                type="delete"
                                deleteType="payment"
                                id={item?.id.toString()}
                            />
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
            <div className="flex items-center justify-between">
                <div className="hidden lg:flex items-center gap-1">
                    <p className="text-2xl font-semibold">{data?.length ?? 0}</p>
                    <span className="text-gray-600 text-sm xl:text-base">
                        total records
                    </span>
                </div>
            </div>

            <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
    );
};