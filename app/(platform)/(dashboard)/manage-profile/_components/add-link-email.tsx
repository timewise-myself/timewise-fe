/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { LinkEmail } from "@/actions/link-email/schema";
import CustomDialog from "@/components/custom-dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const linkEmail = async (params: any, session: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user/emails/send?email=${params.email}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.user.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
      }),
    }
  );
  if (!response.ok) {
    // Nếu response không thành công, ném lỗi
    const errorData = await response.json();
    throw new Error(errorData?.error || "Failed to link email.");
  }

  const data = await response.json();
  return data;
};

const AddLinkEmail = () => {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof LinkEmail>>({
    resolver: zodResolver(LinkEmail),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const { mutate: linkEmailMutation } = useMutation({
    mutationFn: async (values: z.infer<typeof LinkEmail>) => {
      const validatedFields = LinkEmail.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }

      const response = await linkEmail(values, session);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accountInformation"],
      });
      reset();
      startTransition(() => {
        toast.success("Email sent successfully");
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to send email.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      startTransition(() => {
        toast.error(errorMessage);
      });
    },
  });

  const handleSubmission = handleSubmit((values) => {
    if (values.email === session?.user?.email) {
      startTransition(() => {
        toast.error("You cannot link your own email.");
      });
      return;
    }
    linkEmailMutation(values);
  });

  return (
      <CustomDialog
          title={"Link new Email"}
          description={
            "Boost your productivity by making it easier for everyone to access boards in one location."
          }
          btnSubmitContent="Start Linking"
      >
        <form onSubmit={handleSubmission} className="w-full flex flex-row gap-x-1">
          <div className="w-full flex items-center flex-col">
            <Input
                type="text"
                disabled={isPending}
                placeholder="Enter email"
                className="w-full p-2 border border-gray-300 rounded-md"
                {...register("email")}
            />
            {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <Button className="w-fit" type="submit">
            Link
          </Button>
        </form>
      </CustomDialog>
  );
};

export default AddLinkEmail;
