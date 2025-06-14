import { AppointmentQuickLinks } from "@/components/appointment/appointment-quick-links";
import { PatientDetailsCard } from "@/components/appointment/patient-details-card";
import { getAppointmentsWithMedRecordsById } from "@/utils/services/appointment";

const AppointmentDetailsPage = async ({ params ,searchParams}: { params: Promise<{ id: string }> ,searchParams: Promise<{ [key: string]: string  | string[] | undefined }> }) => {


    const { id } = await params;
    const search = await searchParams;
    const cat = search.cat as string || "charts"; //default value for category
    
    const {data} = await getAppointmentsWithMedRecordsById(Number(id), )

    return (
        <div className="flex p-6 flex-col-reverse lg:flex-row w-full min-h-screen gap-10">
            {/* LEFT SIDE */}
            <div className="w-full lg:w-[65%] flex flex-col gap-6">
                {/* {cat === "charts" && <ChartContainer />} */}
                {/* {cat === "appointment" && 
                <>
                <AppointmentContainer />
                </>
                
                
                } */}




                {/* {cat === "diagnosis" && <DiagnosisContainer />} */}
                {/* {cat === "billing" && <BillingContainer />} */}
                {/* {cat === "medical-history" && <MedicalHistoryContainer />} */}
                {/* {cat === "payments" && <PaymentsContainer />} */}
            </div>






            {/* RIGHT SIDE */}
             <div className="flex-1 space-y-6">
                <AppointmentQuickLinks staffId={data?.doctor_id as string}/>
                <PatientDetailsCard data={data?.patient!} />
            </div>
        </div>
    );
};

export default AppointmentDetailsPage;