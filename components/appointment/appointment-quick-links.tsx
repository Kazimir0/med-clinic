import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { ReviewForm } from "../dialogs/review-form";

/**
 * Displays a set of quick navigation links for appointment-related actions.
 * - Shows links to charts, appointments, diagnosis, billing, medical history, payments, prescriptions, and vital signs.
 * - If the user is a patient, also displays a review form for staff feedback.
 */
const AppointmentQuickLinks = async ({ staffId }: { staffId: string }) => {
  // Check if the current user is a patient (for conditional rendering)
  const isPatient = await checkRole("PATIENT");

  return (
    <Card className="w-full rounded-xl bg-white shadow-none">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {/* Navigation links for different appointment categories */}
        <Link
          href="?cat=charts"
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
        >
          Charts
        </Link>
        <Link
          href="?cat=appointments"
          className="px-4 py-2 rounded-lg bg-violet-100 text-violet-600"
        >
          Appointments
        </Link>

        <Link
          href="?cat=diagnosis"
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600"
        >
          Diagnosis
        </Link>

        <Link
          href="?cat=billing"
          className="px-4 py-2 rounded-lg bg-green-100 text-green-600"
        >
          Bills
        </Link>

        <Link
          href="?cat=medical-history"
          className="px-4 py-2 rounded-lg bg-red-100 text-red-600"
        >
          Medical History
        </Link>

        <Link
          href="?cat=payments"
          className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
        >
          Payments
        </Link>

        <Link
          href="/doctor/prescriptions"
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600"
        >
          Prescriptions
        </Link>

        <Link
          href="?cat=appointments#vital-signs"
          className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
        >
          Vital Signs
        </Link>

        {/* Only show the review form if the user is a patient */}
        {isPatient && <ReviewForm staffId={staffId} />}
      </CardContent>
    </Card>
  );
};

export default AppointmentQuickLinks;