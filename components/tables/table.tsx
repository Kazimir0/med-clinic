import React from "react";

interface TableProps {
  columns: { header: string; key: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}

// Table is a reusable table component for displaying tabular data.
// Accepts columns definition, a row renderer, and the data array.
export const Table = ({ columns, renderRow, data }: TableProps) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm lg:uppercase">
          {/* Render table headers based on columns prop */}
          {columns.map(({ header, key, className }) => (
            <th key={key} className={className}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {/* Show message if no data is available */}
        {data?.length < 1 && (
          <tr className="text-gray-400 text-base py-10">
            <td>No Data Found</td>
          </tr>
        )}
        {/* Render each row using the renderRow function */}
        {data?.length > 0 &&
          data?.map((item, id) => renderRow({ ...item, index: id }))}
      </tbody>
    </table>
  );
};