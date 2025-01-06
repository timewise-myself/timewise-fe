/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { CreateWorkspace } from "@/actions/create-workspace/schema";
import CustomDialog from "@/components/custom-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import FormSubmit from "@/components/form/form-submit";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLinkedEmails } from "@/hooks/useLinkedEmail";

const CreateWorkspaceDialogCompact = () => {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const { linkedEmails } = useLinkedEmails();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof CreateWorkspace>>({
    resolver: zodResolver(CreateWorkspace),
    defaultValues: {
      title: "",
      description: "",
      email: "",
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateWorkspace>) => {
      const validatedFields = CreateWorkspace.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }
      const { title, description, email } = values;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/workspace/create-workspace`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.access_token}`,
          },
          body: JSON.stringify({
            description,
            email,
            title,
          }),
        }
      );
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }
      return result;
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Workspace created successfully");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      mutate(values, {
        onSuccess: () => {
          toast.success("Workspace created successfully");
          queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    });
  });

  return (
    <CustomDialog
      title={"Create New Workspace"}
      description={
        "Boost your productivity by making it easier for everyone to access boards in one location."
      }
      btnSubmitContent="Create Workspace"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Title"
                        {...field}
                        type="text"
                        className="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:ring-4 focus:ring-blue-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Description"
                        {...field}
                        type="text"
                        className="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:ring-4 focus:ring-blue-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-4">
              <FormField
                control={form.control}
                name={"email"}
                render={({ field }) => {
                  return (
                    <FormItem key={field.value} className="w-full">
                      <FormLabel>Email</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={"Select email to create workspace"}
                            >
                              {field.value}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectContent>
                            {(Array.isArray(linkedEmails)
                              ? linkedEmails
                              : []
                            ).map((emailObj: any) => (
                              <React.Fragment key={emailObj}>
                                <SelectGroup>
                                  <SelectItem value={emailObj}>
                                    {emailObj}
                                  </SelectItem>
                                </SelectGroup>
                              </React.Fragment>
                            ))}
                          </SelectContent>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <FormSubmit className="w-full">Create Workspace</FormSubmit>
          </div>
        </form>
      </Form>
    </CustomDialog>
  );
};

export default CreateWorkspaceDialogCompact;
