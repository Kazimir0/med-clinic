"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { ServicesSchema } from "@/lib/schema";
import { CustomInput } from "../custom-input";
import { Services } from "@prisma/client";
import { updateService } from "@/app/actions/medical";

interface EditServiceProps {
  service: Services;
}

export const EditService = ({ service }: EditServiceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof ServicesSchema>>({
    resolver: zodResolver(ServicesSchema),
    defaultValues: {
      service_name: service.service_name,
      price: service.price,
      description: service.description || "",
    },
  });

  // Reset form when service changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        service_name: service.service_name,
        price: service.price,
        description: service.description || "",
      });
    }
  }, [service, form, open]);

  const handleOnSubmit = async (values: z.infer<typeof ServicesSchema>) => {
    try {
      setIsLoading(true);
      const resp = await updateService(service.id, values);

      if (resp.success) {
        toast.success("Service updated successfully!");
        router.refresh();
        setOpen(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-blue-600">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <CardHeader className="px-0">
            <DialogTitle>Edit Service</DialogTitle>
            <CardDescription>
              Update service information. Changes will affect billing and service listings.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8"
            >
              <CustomInput
                type="input"
                control={form.control}
                name="service_name"
                label="Service Name"
                placeholder=""
              />

              <CustomInput
                type="input"
                control={form.control}
                name="price"
                placeholder=""
                label="Service Price"
              />
              <div className="flex items-center gap-4">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="description"
                  placeholder=""
                  label="Service Description"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 w-full"
              >
                Update
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};