import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  accountInformation: any;
}

export const ManageAccount = z.object({
  first_name: z
      .string()
      .min(3, "First name must be at least 3 characters long"),
  last_name: z.string().min(3, "Last name must be at least 3 characters long"),
  profile_picture: z.string(),
});

const AccountInformation = ({ accountInformation }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
      accountInformation?.profile_picture || null
  );
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof ManageAccount>>({
    resolver: zodResolver(ManageAccount),
    defaultValues: {
      first_name: "",
      last_name: "",
      profile_picture: "",
    },
  });

  useEffect(() => {
    if (accountInformation) {
      reset({
        first_name: accountInformation.first_name || "",
        last_name: accountInformation.last_name || "",
        profile_picture: accountInformation.profile_picture || "",
      });
      setAvatarPreview(accountInformation.profile_picture || null);
    }
  }, [accountInformation, reset]);

  const handleEdit = () => {
    setIsEditing(true);
    reset((prev) => ({
      ...prev,
      first_name: accountInformation.first_name || "",
      last_name: accountInformation.last_name || "",
    }));
  };

  const handleSaveChanges = async (data: z.infer<typeof ManageAccount>) => {
    setIsEditing(false);
    try {
      const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${session?.user.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: data.first_name,
              last_name: data.last_name,
              profile_picture: data.profile_picture,
            }),
          }
      );

      if (!response.ok) {
        throw new Error("Failed to update user information");
      }

      const responseData = await response.json();
      toast("User information updated successfully:", responseData);
      window.location.reload();
    } catch (error) {
      toast("Failed to update user information:", error || "");
    }
  };

  const formattedCreatedAt = accountInformation?.created_at
      ? format(new Date(accountInformation.created_at), "dd/MM/yyyy HH:mm")
      : "N/A";

  return (
      <form
          onSubmit={handleSubmit(handleSaveChanges)}
          key={isEditing ? "edit" : "view"}
      >
        <Card>
          <CardHeader className="flex flex-col items-center">
            <CardTitle>Account Information</CardTitle>
            <Image
                src={avatarPreview || "/default-avatar.png"}
                alt="avatar"
                width={80}
                height={80}
                className="rounded-full mt-2"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user?.email || ""} disabled />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                    id="first-name"
                    {...register("first_name")}
                    disabled={!isEditing}
                />
                {errors.first_name && (
                    <p className="text-red-500">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                    id="last-name"
                    {...register("last_name")}
                    disabled={!isEditing}
                />
                {errors.last_name && (
                    <p className="text-red-500">{errors.last_name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="created-at">Registered At</Label>
                <div
                    id="created-at"
                    className="p-2 text-gray-800"
                >
                  {formattedCreatedAt}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {!isEditing ? (
                <Button type="button" onClick={handleEdit}>
                  Change Information
                </Button>
            ) : (
                <Button type="submit">Save Changes</Button>
            )}
          </CardFooter>
        </Card>
      </form>
  );
};

export default AccountInformation;