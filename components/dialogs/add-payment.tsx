"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "../ui/button";
import { CardDescription, CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { addPaymentMethod } from "@/app/actions/admin";

// Definim schema pentru metodele de plată
const PaymentMethodSchema = z.object({
  name: z.string().min(1, "Method name is required").max(35, "Method name must be 35 characters or less"),
  description: z.string().min(1, "Description is required").max(100, "Description must be 100 characters or less")
});

export const AddPaymentMethod = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof PaymentMethodSchema>>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof PaymentMethodSchema>) => {
    try {
      setIsLoading(true);
      const resp = await addPaymentMethod(values);
      
      if (resp.success) {
        toast.success("Payment method added successfully!");
        router.refresh();
        setOpen(false);
      } else {
        toast.error(resp.message || "Failed to add payment method");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#0F172A] text-white">
            <PlusIcon size={16} className="mr-1" /> Add New Payment Method
          </Button>
        </DialogTrigger>
        <DialogContent>
          <CardHeader className="px-0">
            <DialogTitle>Add New Payment Method</DialogTitle>
            <CardDescription>
              Add a new payment method to be used across the platform.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8"
            >
              <div className="space-y-1">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="name"
                  label="Method Name"
                  placeholder="e.g. Credit Card, PayPal, Cash"
                />
                <div className="text-xs text-right text-gray-500">
                  {form.watch("name")?.length || 0}/35 characters
                </div>
              </div>

              <div className="space-y-1">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="description"
                  placeholder=""
                  label="Method Description"
                />
                <div className="text-xs text-right text-gray-500">
                  {form.watch("description")?.length || 0}/100 characters
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 w-full"
              >
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};