import { Diagnosis, Doctor, LabTest, MedicalRecords, Patient } from "@prisma/client";
import { BriefcaseBusiness } from "lucide-react";
import React from "react";
import { Table } from "./tables/table";
import { ProfileImage } from "./profile-image";
import { formatDateTime } from "@/utils";
import { ViewAction } from "./action-options";
import { MedicalHistoryDialog } from "./medical-history-dialog";
export interface ExtendedMedicalHistory extends MedicalRecords {
  patient?: Patient;
  diagnosis: Diagnosis[];
  lab_test?: LabTest[];
  index?: number;
  doctor?: Doctor;
}

interface DataProps {
  data: ExtendedMedicalHistory[];
  isShowProfile?: boolean;
}

// MedicalHistory component displays a table of medical history records for patients.
// Supports optional profile info, doctor details, diagnosis dialog, and view action.
export const MedicalHistory = ({ data, isShowProfile }: DataProps) => {
  // Define table columns, some are conditionally shown based on isShowProfile or screen size
  const columns = [
    {
      header: "No",
      key: "no",
    },
    {
      header: "Info",
      key: "name",
      className: isShowProfile ? "table-cell" : "hidden",
    },
    {
      header: "Date & Time",
      key: "medical_date",
      className: "",
    },
    {
      header: "Doctor",
      key: "doctor",
      className: "hidden xl:table-cell",
    },
    {
      header: "Diagnosis",
      key: "diagnosis",
      className: "hidden md:table-cell",
    },
    // {
    //   header: "Lab Test",
    //   key: "lab_test",
    //   className: "hidden 2xl:table-cell",
    // },
    {
      header: "Action",
      key: "action",
      className: "hidden 2xl:table-cell",
    },
  ];

  // Render a single row of the medical history table
  const renderRow = (item: ExtendedMedicalHistory) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        {/* Record ID */}
        <td className="py-2 xl:py-6"># {item?.id}</td>

        {/* Patient profile info, if enabled */}
        {isShowProfile && (
          <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
            <ProfileImage
              url={item?.patient?.img!}
              name={item?.patient?.first_name + " " + item?.patient?.last_name}
            />
            <div>
              <h3 className="font-semibold">
                {item?.patient?.first_name + " " + item?.patient?.last_name}
              </h3>
              <span className="text-xs capitalize hidden md:flex">
                {item?.patient?.gender.toLowerCase()}
              </span>
            </div>
          </td>
        )}

        {/* Date and time of record creation */}
        <td className="">{formatDateTime(item?.created_at.toString())}</td>

        {/* Doctor info, with fallback if not found */}
        <td className="hidden xl:table-cell py-2">
          {item?.doctor ? (
            <div className="flex items-center gap-2">
              <ProfileImage
                url={item.doctor.img || ""}
                name={item.doctor.name || ""}
              />
              <div>
                <p className="font-medium">
                  {item.doctor.name || "Unknown Doctor"}
                </p>
                <p className="text-xs text-gray-500">
                  {item.doctor.specialization || "General"}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm italic text-gray-500">
              {item?.doctor_id}
            </span>
          )}
        </td>

        {/* Diagnosis info, opens dialog if present */}
        <td className="hidden lg:table-cell">
          {item?.diagnosis?.length === 0 ? (
            <span className="text-sm italic text-gray-500">
              No diagnosis found
            </span>
          ) : (
            <>
              <MedicalHistoryDialog
                id={item?.appointment_id}
                patientId={item?.patient_id}
                doctor_id={item?.doctor_id}
                label={
                  <div className="flex gap-x-2 items-center text-lg">
                    {item?.diagnosis?.length}

                    <span className="text-sm">Found</span>
                  </div>
                }
              />
            </>
          )}
        </td>
        {/* <td className="hidden 2xl:table-cell">
          {item?.lab_test?.length === 0 ? (
            <span className="text-sm italic text-gray-500">
              No lab test found
            </span>
          ) : (
            <div className="flex gap-x-2 items-center text-lg">
              {item?.lab_test?.length}

              <span className="text-sm">Found</span>
            </div>
          )}
        </td> */}

        {/* View action button for appointment details */}
        <td>
          <ViewAction href={`/record/appointments/${item?.appointment_id}`} />
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl p-2 2xl:p-6">
        {/* Header with record count */}
        <div className="">
          <h1 className="font-semibold text-xl">Medical History (All)</h1>
          <div className="hidden lg:flex items-center gap-1">
            <BriefcaseBusiness size={20} className="text-gray-500" />
            <p className="text-2xl font-semibold">{data?.length}</p>
            <span className="text-gray-600 text-sm xl:text-base">
              total records
            </span>
          </div>
        </div>
        {/* Render the table with columns and rows */}
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
    </>
  );
};