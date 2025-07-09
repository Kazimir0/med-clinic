import { getServices } from "@/utils/services/admin";
import { Services } from "@prisma/client";
import { Table } from "../tables/table";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AddService } from "../dialogs/add-service";
import { checkRole } from "@/utils/roles";
import { EditService } from "../dialogs/edit-service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ActionDialog } from "../action-dialog";

const columns = [
  {
    header: "ID",
    key: "id",
    className: "hidden md:table-cell px-1 w-[5%]",
  },
  {
    header: "Service Name",
    key: "name",
    className: "hidden md:table-cell px-4 w-[20%]",
  },
  {
    header: "Price",
    key: "price",
    className: "hidden md:table-cell px-4 w-[10%]",
  },
  {
    header: "Description",
    key: "description",
    className: "hidden xl:table-cell px-4 w-[45%]",
  },
  {
    header: "Actions",
    key: "actions",
    className: "hidden md:table-cell pl-6 w-[20%]",
  },
];

// ServiceSettings fetches and displays a table of all services offered by the platform.
// Allows admins to edit or delete services and add new ones.
export const ServiceSettings = async () => {
  const { data } = await getServices();

  // Render a table row for each service
  const renderRow = async (item: Services) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="py-4 px-2">{item?.id}</td>
      {/* Service name with tooltip */}
      <td className="hidden md:table-cell py-4 px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate max-w-[150px]">{item.service_name}</p>
            </TooltipTrigger>
            <TooltipContent side="top">{item.service_name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      {/* Service price */}
      <td className="hidden md:table-cell py-4 px-4 capitalize">
        {item?.price?.toFixed(2)}
      </td>
      {/* Service description with tooltip */}
      <td className="hidden xl:table-cell py-4 px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="line-clamp-2">{item.description}</p>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-md">
              {item.description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      {/* Admin actions: edit and delete */}
      <td className="hidden md:table-cell py-4 px-4">
        <div className="flex items-center gap-3">
          {await checkRole("ADMIN") && (
            <>
              <EditService service={item} />
              <ActionDialog
                type="delete"
                id={item.id.toString()}
                deleteType="service"
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="capitalize">Services</CardTitle>
          <CardDescription>
            Manage all services offered by the platform from this section.
          </CardDescription>
        </div>
        <AddService />
      </CardHeader>

      <CardContent>
        {/* Table of all services */}
        <Table columns={columns} renderRow={renderRow} data={data!} />
      </CardContent>
    </>
  );
};