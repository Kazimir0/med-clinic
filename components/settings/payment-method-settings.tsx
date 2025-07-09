import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table } from "../tables/table";
import { EditPaymentMethod } from "../dialogs/edit-payment";

// Sample static data for payment methods
const paymentMethods = [
  {
    id: 1,
    name: "CASH",
    description: "Cash payment - Pay the amount directly to your doctor"
  },
  {
    id: 2,
    name: "CARD",
    description: "Card payment - Pay online using credit/debit card via Stripe"
  }
];

// Column configuration for the payment methods table
const columns = [
  {
    header: "ID",
    key: "id",
    className: "hidden md:table-cell pr-3 w-[5%]",
  },
  {
    header: "Method Name",
    key: "name",
    className: "hidden md:table-cell px-4 w-[30%]",
  },
  {
    header: "Description",
    key: "description",
    className: "hidden xl:table-cell px-4 w-[45%]",
  },
];

// PaymentMethodSettings displays a table of available payment methods for the platform.
// Payment methods are static and can be viewed but not edited here.
export const PaymentMethodSettings = async () => {
  // Render a table row for each payment method
  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="py-4 px-2">{item?.id}</td>
      <td className="hidden md:table-cell py-4 px-4">
        <p className="truncate max-w-[150px]">{item.name}</p>
      </td>
      <td className="hidden xl:table-cell py-4 px-4">
        <p className="line-clamp-2">{item.description}</p>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <EditPaymentMethod method={item} />
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="capitalize">Payment Methods</CardTitle>
          <CardDescription>
            Available payment methods on the platform.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* Info box about payment methods */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            Payment methods are configured statically in the system. Currently, the platform supports cash payments and card payments (via Stripe integration).
          </p>
        </div>
        {/* Table of payment methods */}
        <Table columns={columns} renderRow={renderRow} data={paymentMethods} />
      </CardContent>
    </>
  );
};