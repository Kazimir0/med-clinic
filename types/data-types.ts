import { AppointmentStatus, Doctor, Patient } from "@prisma/client";

export type AppointmentChartProps = {
    name: string;
    appointment: number;
    completed: number;
}[];

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  type: string;
  appointment_date: Date;
  time: string;
  status: AppointmentStatus;

  patient: Patient;
  doctor: Doctor;
};

export type AvailableDoctorProps = {
  colorCode?: string;
  id: string;
  name: string;
  specialization: string;
  img?: string;
  working_days: {
    day: string;
    start_time: string;
    close_time: string;
  }[];
}[];