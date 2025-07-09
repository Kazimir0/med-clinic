"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { recordMedicationAdministration } from "@/app/actions/medical";

interface MedicationProps {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string | null;
}

interface MedicationAdministrationFormProps {
  prescriptionId: number;
  medications: MedicationProps[];
}

const administrationSchema = z.object({
  notes: z.string().optional(),
  administered: z.array(z.number()),
});

// MedicationAdministrationForm allows a user to record which medications were administered for a prescription
// Handles validation, submission, and UI for selecting medications and adding notes
const MedicationAdministrationForm = ({ prescriptionId, medications }: MedicationAdministrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Set up form with zod validation schema
  const form = useForm<z.infer<typeof administrationSchema>>({
    resolver: zodResolver(administrationSchema),
    defaultValues: {
      notes: "",
      administered: [],
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof administrationSchema>) {
    try {
      setIsSubmitting(true);
      // Require at least one medication to be selected
      if (values.administered.length === 0) {
        toast.error("Please select at least one medication to administer");
        setIsSubmitting(false);
        return;
      }
      // Call server action to record administration
      const result = await recordMedicationAdministration(
        prescriptionId,
        values.administered,
        values.notes || undefined
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Medications administered successfully");
        router.push("/doctor/administer-medications");
        router.refresh();
      }
    } catch (error) {
      console.error("Error administering medications:", error);
      toast.error("Failed to record medication administration");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Administer Medications</h2>
          {/* Medication selection checkboxes */}
          <FormField
            control={form.control}
            name="administered"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Select medications to administer</FormLabel>
                </div>
                <div className="space-y-2">
                  {medications.map((medication) => (
                    <FormField
                      key={medication.id}
                      control={form.control}
                      name="administered"
                      render={({ field }) => (
                        <FormItem
                          key={medication.id}
                          className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(medication.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, medication.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== medication.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">
                              {medication.name}
                            </FormLabel>
                            <p className="text-sm text-gray-500">
                              {medication.dosage} - {medication.frequency}
                            </p>
                            {medication.instructions && (
                              <p className="text-xs text-gray-500 mt-1">
                                Instructions: {medication.instructions}
                              </p>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Optional notes textarea */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Administration Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any notes about the administration (optional)" 
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Action buttons for cancel and submit */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Administration"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MedicationAdministrationForm;