import { ActionOptions, ViewAction } from "@/components/action-options";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { SearchParamsProps } from "@/types";
import { calculateAge } from "@/utils";
import { checkRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/settings";
import { getAllPatients } from "@/utils/services/patient";
import { Patient } from "@prisma/client";
import { format } from "date-fns";
import { Pill, UserPen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ActionDialog } from "@/components/action-dialog";

const columns = [
  {
    header: "Patient Name",
    key: "name",
  },
  {
    header: "Gender",
    key: "gender",
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
    header: "Address",
    key: "address",
    className: "hidden xl:table-cell",
  },
  {
    header: "Last Visit",
    key: "created_at",
    className: "hidden lg:table-cell",
  },
  {
    header: "Prescriptions",
    key: "prescriptions",
    className: "hidden xl:table-cell pl-6",
  },
  {
    header: "Actions",
    key: "action",
  },
];

interface PatientProps extends Patient {
  appointments: {
    medical: {
      created_at: Date;
      treatment_plan: string;
    }[];
  }[];
}
const PatientList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const { data, totalPages, totalRecords, currentPage } = await getAllPatients({
    page,
    search: searchQuery,
  });
  const isAdmin = await checkRole("ADMIN");

  if (!data) return null;

  const renderRow = (item: PatientProps) => {
    const lastVisit = item?.appointments[0]?.medical[0] || null;
    const name = item?.first_name + " " + item?.last_name;

    return (
      <tr
        key={item?.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        {/* Patient info cell with profile image and name */}
        <td className="flex items-center gap-4 p-4">
          <ProfileImage
            url={item?.img!}
            name={name}
            bgColor={item?.colorCode!}
            textClassName="text-black"
          />
          <div>
            <h3 className="uppercase">{name}</h3>
            <span className="text-sm capitalize">
              {calculateAge(item?.date_of_birth)}
            </span>
          </div>
        </td>
        {/* Gender */}
        <td className="hidden md:table-cell">{item?.gender}</td>
        {/* Phone */}
        <td className="hidden md:table-cell">{item?.phone}</td>
        {/* Email */}
        <td className="hidden lg:table-cell">{item?.email}</td>
        {/* Address */}
        <td className="hidden xl:table-cell">{item?.address}</td>
        {/* Last visit date */}
        <td className="hidden lg:table-cell">
          {lastVisit ? (
            format(lastVisit?.created_at, "yyyy-MM-dd HH:mm:ss")
          ) : (
            <span className="text-gray-400 italic">No last visit</span>
          )}
        </td>
        {/* Prescriptions link */}
        <td className="hidden xl:table-cell px-4">
  <Button
    variant="ghost"
    size="sm"
    className="h-8 px-3 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
    asChild
  >
    <Link href={`/doctor/prescriptions?patient=${item?.id}`}>
      <Pill className="h-3.5 w-3.5 mr-1" />
      See Prescriptions
    </Link>
  </Button>
</td>
        {/* Actions: view and admin options */}
        <td>
          <div className="flex items-center gap-2">
            <ViewAction href={`/patient/${item?.id}`} />
            <ActionOptions>
              <div className="space-y-3">
                {isAdmin && (
                  <ActionDialog
                    type="delete"
                    id={item.id}
                    deleteType="patient"
                  />
                )}
              </div>
            </ActionOptions>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        {/* Total patients summary */}
        <div className="hidden lg:flex items-center gap-1">
          <Users size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            total patients
          </span>
        </div>
        {/* Search input */}
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        {/* Patients table */}
        <Table columns={columns} data={data} renderRow={renderRow} />
        {/* Pagination controls */}
        {totalPages && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalRecords={totalRecords}
            limit={DATA_LIMIT}
          />
        )}
      </div>
    </div>
  );
};

export default PatientList;