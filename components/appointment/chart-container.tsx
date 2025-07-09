import { getVitalSignData } from "@/utils/services/medical";
import BloodPressureChart from "./blood-pressure-chart";
import { HeartRateChart } from "./heart-rate-chart";

/**
 * ChartContainer fetches and displays vital sign charts for a patient/appointment.
 * - Retrieves blood pressure and heart rate data using the provided ID.
 * - Renders BloodPressureChart and HeartRateChart components with the fetched data.
 */
export default async function ChartContainer({ id }: { id: string }) {
  // Fetch vital sign data and averages for the given ID
  const { data, average, heartRateData, averageHeartRate } =
    await getVitalSignData(id.toString());

  return (
    <>
      {/* Blood pressure chart visualization */}
      <BloodPressureChart data={data} average={average} />
      {/* Heart rate chart visualization */}
      <HeartRateChart data={heartRateData} average={averageHeartRate} />
    </>
  );
}