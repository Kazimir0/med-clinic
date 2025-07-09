import { FaMagnifyingGlassChart } from "react-icons/fa6";

// NoDataFound displays a friendly message and icon when no data is available for a section or table
// Optionally accepts a custom note to display
export const NoDataFound = ({ note }: { note?: string }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-0">
      {/* Magnifying glass icon for visual feedback */}
      <FaMagnifyingGlassChart size={80} className="text-gray-600" />
      {/* Show custom note or default message */}
      <span className="text-xl text-gray-500 mt-2 font-medium">
        {note || "No Record Found"}
      </span>
    </div>
  );
};