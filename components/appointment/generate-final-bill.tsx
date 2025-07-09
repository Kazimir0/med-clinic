"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { generateBill } from "@/app/actions/medical";
import { PaymentSchema } from "@/lib/schema";
import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import { CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";

// Props for the GenerateFinalBills component
interface DataProps {
  id?: string | number; // Payment or bill ID
  total_bill: number;  // Total bill amount
}

/**
 * GenerateFinalBills provides a dialog form to generate a final bill for a patient.
 * - Uses react-hook-form and Zod for validation.
 * - Submits the form to generate the bill and shows toast notifications for success/failure.
 * - Allows entering discount and bill date.
 */
export const GenerateFinalBills = ({ id, total_bill }: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  let discountInfo = null;

  // Initialize the form with default values and validation schema
  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      id: id?.toString(),
      bill_date: new Date(),
      discount: "0",
      total_amount: total_bill.toString(),
    },
  });

  // Handles form submission to generate the bill
  const handleOnSubmit = async (values: z.infer<typeof PaymentSchema>) => {
    try {
      setIsLoading(true);

      const resp = await generateBill(values);

      if (resp.success) {
        toast.success("Patient bill generated successfully!");

        router.refresh(); // Refresh the page to show updated data

        form.reset();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Dialog for generating the final bill */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-sm font-normal">
            <Plus size={22} className="text-gray-400" />
            Generate Final Bill
          </Button>
        </DialogTrigger>
        <DialogContent>
          <CardHeader className="px-0">
            <DialogTitle>Patient Medical Bill</DialogTitle>
          </CardHeader>

          {/* Bill generation form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8"
            >
              <div className="flex items-center gap-2">
                <div className="">
                  <span>Total Bill</span>
                  <p className="text-3xl font-semibold">
                    {total_bill?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Discount input */}
              <CustomInput
                type="input"
                control={form.control}
                name="discount"
                placeholder="eg.: 5"
                label="Discount (%)"
              />

              {/* Bill date input */}
              <CustomInput
                type="input"
                control={form.control}
                name="bill_date"
                label="Bill Date"
                placeholder=""
                inputType="date"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 w-full"
              >
                Generate Bill
              </Button>
            </form>
          </Form>

          <DialogDescription>
          Generate a final bill for the patient
        </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};