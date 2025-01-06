/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import AddLinkEmail, { linkEmail } from "./add-link-email";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLinkedEmailsForManage } from "@/hooks/useLinkedEmailForManage";
import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/manage-account/modal-confirm";

const emailStatusOptions = ["linked", "pending", "rejected"];

// Unlink email API call
export const unlinkEmail = async (params: any, accessToken: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user/emails/unlink?email=${params}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    if (!response.ok) throw new Error("Failed to unlink email");
    return await response.json();
};

// Delete rejected email API call
const deleteEmail = async (params: any, accessToken: string) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user/emails/clear-rejected?email=${params}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        }
    );
    if (!response.ok) throw new Error("Failed to delete email");
    return await response.json();
};

const LinkedEmail = () => {
    const [emailStatus, setEmailStatus] = useState<string>("linked");
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
    const [actionType, setActionType] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { linkedEmails, isLoading } = useLinkedEmailsForManage(emailStatus);
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const userEmail = session?.user.email;

    const { mutate: unlinkEmailMutation } = useMutation({
        mutationFn: async (email: any) => {
            if (!session?.user.access_token) throw new Error("No session or access token available");
            return unlinkEmail(email, session.user.access_token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["linked-email", emailStatus] });
            toast.success("Email unlinked successfully");
        },
        onError: (error: any) => toast.error(error.message || "Failed to unlink email"),
    });

    const { mutate: deleteEmailMutation } = useMutation({
        mutationFn: async (email: any) => {
            if (!session?.user.access_token) throw new Error("No session or access token available");
            return deleteEmail(email, session.user.access_token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["linked-email", emailStatus] });
            toast.success("Email deleted successfully");
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete email"),
    });

    const { mutate: resendEmailMutation } = useMutation({
        mutationFn: async (email: any) => {
            if (!session?.user.access_token) throw new Error("No session or access token available");
            return linkEmail({ email }, session);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["linked-email", emailStatus] });
            toast.success("Email resent successfully");
        },
        onError: (error: any) => toast.error(error.message || "Failed to resend email"),
    });

    const handleAction = (email: string, action: string) => {
        setSelectedEmail(email);
        setActionType(action);
        setIsModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedEmail) return;
        if (actionType === "Unlink") unlinkEmailMutation(selectedEmail);
        else if (actionType === "Delete") deleteEmailMutation(selectedEmail);
        else if (actionType === "Resend") resendEmailMutation(selectedEmail);
        setIsModalOpen(false);
    };

    const filteredEmails = linkedEmails?.filter((email: string) => {
        if (emailStatus === "rejected" && email === userEmail) return false;
        else if (emailStatus === "pending" && email === userEmail) return false;
        return true;
    });

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg font-semibold">Manage Linked Emails</CardTitle>
                <div className="flex gap-4 mt-4 sm:mt-0">
                    <select
                        className="border border-gray-300 rounded-md p-2 shadow-sm focus:ring-2 focus:ring-blue-500"
                        value={emailStatus}
                        onChange={(e) => setEmailStatus(e.target.value)}
                    >
                        {emailStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                    <AddLinkEmail />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p>Loading emails...</p>
                ) : filteredEmails?.length === 0 ? (
                    <p>No {emailStatus} emails found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email Address</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmails?.map((email: string) => (
                                <TableRow key={email}>
                                    <TableCell className="font-medium">{email}</TableCell>
                                    <TableCell>
                                        {emailStatus === "linked" ? (
                                            email === userEmail ? (
                                                <span className="text-gray-500">Primary Email</span>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="text-red-500"
                                                    onClick={() => handleAction(email, "Unlink")}
                                                >
                                                    Unlink
                                                </Button>
                                            )
                                        ) : emailStatus === "rejected" ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="text-red-500"
                                                    onClick={() => handleAction(email, "Delete")}
                                                >
                                                    Delete
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="text-blue-500 ml-2"
                                                    onClick={() => handleAction(email, "Resend")}
                                                >
                                                    Resend
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">Pending Approval</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">{filteredEmails?.length || 0}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            </CardContent>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAction}
                action={actionType || ""}
            />
        </Card>
    );
};

export default LinkedEmail;
