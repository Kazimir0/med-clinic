import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { RatingList } from "./rating-list";

// PatientRatingContainer fetches and displays the latest ratings for a patient
// If no id is provided, it uses the current authenticated user's id
export const PatientRatingContainer = async ({ id }: { id?: string }) => {
  const { userId } = await auth();

  // Fetch up to 10 most recent ratings for the patient
  const data = await db.rating.findMany({
    take: 10,
    where: { patient_id: id ? id : userId! },
    include: { patient: { select: { last_name: true, first_name: true } } },
    orderBy: { created_at: "desc" },
  });

  if (!data) return null; // If no ratings, render nothing

  return (
    <div>
      {/* Render the list of ratings */}
      <RatingList data={data} />
    </div>
  );
};