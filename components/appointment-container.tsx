import React from "react";
import { BookAppointment } from "./forms/book-appointment";
import { getPatientById } from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";

// AppointmentContainer fetches patient and doctor data and renders the BookAppointment form
// Props: id (patient ID)
export const AppointmentContainer = async ({ id }: { id: string }) => {
  // Fetch patient data by ID
  const { data } = await getPatientById(id);
  // Fetch list of available doctors
  const { data: doctors } = await getDoctors();

  return (
    <div>
      {/* Render the appointment booking form with patient and doctor data */}
      <BookAppointment data={data!} doctors={doctors!} />
    </div>
  );
};