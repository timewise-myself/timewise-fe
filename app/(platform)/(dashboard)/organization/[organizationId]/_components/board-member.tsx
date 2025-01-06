import React from "react";
import Image from "next/image";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateRole } from "@/actions/update-role/schema";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { Member } from "@/types/Board";
import { removeMember, updateRole } from "@/lib/fetcher";
import { getUserEmailByWorkspace } from "@/utils/userUtils";
import { useStateContext } from "@/stores/StateContext";

interface Props {
  data: Member[];
}

const BoardMember = ({ data }: Props) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const params = useParams();
  const { stateUserEmails, stateWorkspacesByEmail } = useStateContext();

  const form = useForm<z.infer<typeof UpdateRole>>({
    resolver: zodResolver(UpdateRole),
    defaultValues: {
      role: "",
    },
  });

  const handleRoleChange = (value: string, id: number) => {
    if (value === "remove") {
      removeMemberMutation(id);
    } else {
      form.setValue("role", value, { shouldDirty: true });
      changeRole({
        role: value,
        email: data.find((member) => member.id === id)?.email || "",
      });
    }
  };

  const { mutate: changeRole } = useMutation({
    mutationFn: async (values: z.infer<typeof UpdateRole>) => {
      const validatedFields = UpdateRole.safeParse(values);
      if (!validatedFields.success) {
        throw new Error("Invalid fields");
      }

      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }

      const response = await updateRole(
        {
          email: values.email,
          role: values.role,
          organizationId: params.organizationId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["listMembers"] });
    },
    onError: () => {
      toast.error("Error when updating role");
    },
  });

  const { mutate: removeMemberMutation } = useMutation({
    mutationFn: async (workspaceUserId: number) => {
      const userEmail = getUserEmailByWorkspace(
        stateUserEmails,
        stateWorkspacesByEmail,
        Number(params.organizationId)
      );
      if (!userEmail) {
        return null;
      }
      const response = await removeMember(
        {
          workspaceUserId,
          organizationId: params.organizationId,
          userEmail: userEmail.email,
        },
        session
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["listMembers"] });
      queryClient.invalidateQueries({ queryKey: ["listBoardColumns"] });
    },
    onError: () => {
      toast.error("Error when removing member");
    },
  });

  return (
    <div>
      {(Array.isArray(data) ? data : []).map((member: Member) => (
        <div
          key={member?.id}
          className="flex flex-row justify-between items-center w-full space-y-2"
        >
          <div className="flex flex-row items-center space-x-2">
            <Image
              src={member?.profile_picture}
              alt="user"
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
            <div>
              <p className="text-black text-sm font-semibold">
                {member?.email}
              </p>
              <p className="text-black text-sm font-medium">
                {member?.role}
                {session?.user.email === member.email && (
                  <span className="text-black"> (You)</span>
                )}
              </p>
            </div>
          </div>
          <Form {...form}>
            <form className="flex flex-row items-start space-x-2 justify-between">
              <div className="flex flex-row items-start space-x-2 justify-between">
                <FormField
                  control={form.control}
                  name={"role"}
                  render={({ field }) => (
                    <FormItem key={field.value} className="w-full">
                      <Select
                        onValueChange={(value) =>
                          handleRoleChange(value, member.id)
                        }
                        value={form.watch("role")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={member?.role}>
                              {member?.role}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {session?.user.email !== member.email && (
                              <>
                                {member?.role !== "owner" && (
                                  <>
                                    <SelectItem value={"admin"}>
                                      Admin
                                    </SelectItem>
                                    <SelectItem value={"member"}>
                                      Member
                                    </SelectItem>
                                    <SelectItem value={"remove"}>
                                      Remove
                                    </SelectItem>
                                  </>
                                )}
                              </>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      ))}
    </div>
  );
};

export default BoardMember;
