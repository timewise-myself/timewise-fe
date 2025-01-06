import CustomDialog from "@/components/custom-dialog";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {useParams} from "next/navigation";
import React, {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Command, CommandEmpty, CommandGroup, CommandList, CommandSeparator,} from "@/components/ui/command";
import {toast} from "sonner";
import FormSubmit from "@/components/form/form-submit";
import Tab from "./tab";
import {Input} from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {getListUserInvite, inviteMemberToWorkspace, inviteMemberToWorkspaceByMember} from "@/lib/fetcher";
import {SendingInvitation} from "@/actions/invite-member/schema";
import {getUserEmailByWorkspace} from "@/utils/userUtils";
import {useStateContext} from "@/stores/StateContext";

interface Props {
    members: any;
    currentUserInfo: any;
}

const InviteMember = ({ members, currentUserInfo}: Props) => {
    const {data: session} = useSession();
    const params = useParams();
    const [isCommandListOpen, setIsCommandListOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState("");
    const {stateUserEmails, stateWorkspacesByEmail} = useStateContext();
    const queryClient = useQueryClient();
    const debouncedEmail = useDebounce(email, 1000);

    const form = useForm<z.infer<typeof SendingInvitation>>({
        resolver: zodResolver(SendingInvitation),
        defaultValues: {
            email: "",
            role: "member",
        },
    });

    const handleRoleChange = (value: string) => {
        form.setValue("role", value);
    };

    const {setValue, handleSubmit} = form;

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setValue("email", value);
        setIsCommandListOpen(value.length > 0);
    };

    const selectEmail = (email: string) => {
        setEmail(email);
        setValue("email", email, {shouldValidate: true});
        setIsCommandListOpen(false);
    };

    const {data: userInvite} = useQuery({
        queryKey: ["listUserInvite", debouncedEmail],
        queryFn: () => {
            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }
            return getListUserInvite(
                {
                    email: debouncedEmail,
                    organizationId: params.organizationId,
                    userEmail: userEmail.email
                },
                session
            )
        },
        enabled: !!debouncedEmail && !!session,
    });

    const {mutate} = useMutation({
        mutationFn: async (values: z.infer<typeof SendingInvitation>) => {
            const validatedFields = SendingInvitation.safeParse(values);
            if (!validatedFields.success) {
                throw new Error("Invalid fields");
            }

            const userEmail = getUserEmailByWorkspace(stateUserEmails, stateWorkspacesByEmail, Number(params.organizationId));
            if (!userEmail) {
                return null;
            }
            if (currentUserInfo?.role === "member") {
                const response = await inviteMemberToWorkspaceByMember(
                    {
                        email: values.email,
                        role: values.role,
                        organizationId: params.organizationId,
                        userEmail: userEmail.email
                    },
                    session
                );
                return response;
            } else {
                const response = await inviteMemberToWorkspace(
                    {
                        email: values.email,
                        role: values.role,
                        organizationId: params.organizationId,
                        userEmail: userEmail.email
                    },
                    session
                );
                return response;
            }
        },
    });
    const organizationId = params.organizationId;
    const handleSubmission = handleSubmit((values) => {
        const existingMember = members.find((member: { email: string; }) => member.email === values.email);
        if (existingMember) {
            toast.error("This email is pending to join or already is a member of the workspace.");
            return;
        }

        startTransition(() => {
            mutate(values, {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ["listMembers", organizationId]
                    });
                    toast.success("Invitation sent successfully")
                },
                onError: (error) => toast.error(error.message),
            });
        });
    });

    return (
        <CustomDialog
            title={"Invite to workspace"}
            description={
                "Boost your productivity by making it easier for everyone to access boards in one location."
            }
            btnSubmitContent="Invite"
            btnContentIcon={"Invite Member"}
        >
            <Form {...form}>
                <form onSubmit={handleSubmission}>
                    <div className="flex flex-row items-start space-x-2 justify-between ">
                        <Command className="rounded-lg border shadow-md md:min-w-[200px] w-[200px] h-auto">
                            <Input
                                disabled={isPending}
                                id="email"
                                placeholder="Type email or search..."
                                onChange={(e) => handleEmailChange(e.target.value)}
                                value={email}
                            />
                            {isCommandListOpen && (
                                <CommandList>
                                    <CommandGroup heading="Suggestions">
                                        {Array.isArray(userInvite) && userInvite.length > 0 ? (
                                            userInvite.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => selectEmail(user.email)}
                                                    className="bg-transparent text-black cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-200 p-2 w-full text-start text-sm"
                                                >
                                                    {user.email}
                                                </button>
                                            ))
                                        ) : (
                                            <CommandEmpty>No user found</CommandEmpty>
                                        )}
                                    </CommandGroup>
                                    <CommandSeparator/>
                                </CommandList>
                            )}
                        </Command>

                        <FormField
                            control={form.control}
                            name={"role"}
                            render={({field}) => {
                                const roles = currentUserInfo?.role === "member" ? ["member", "guest"] : ["admin", "member", "guest"];
                                return (
                                    <FormItem key={field.value} className="w-full">
                                        <Select
                                            onValueChange={handleRoleChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={"Select role"}>
                                                        {field.value.charAt(0).toUpperCase() + field.value.slice(1)}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role} value={role}>
                                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                );
                            }}
                        />
                        <FormSubmit className="w-full">Invite</FormSubmit>
                    </div>
                </form>
            </Form>
            <Tab currentUserInfo={currentUserInfo}/>
        </CustomDialog>
    );
};

export default InviteMember;
