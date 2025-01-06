import {useQuery} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {useStateContext} from "@/stores/StateContext";

export const useLinkedEmails = () => {
    const {data: session} = useSession();
    const {setStateLinkedEmails, setStateUserEmails} = useStateContext();

    const {data, isLoading} = useQuery({
        queryKey: ["linked-email"],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user/emails`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session?.user.access_token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch linked emails");
            }

            const result = await response.json();

            // Verify that the result matches the expected format
            if (Array.isArray(result) && result.every((item) => typeof item.email === "string")) {
                setStateLinkedEmails(result.map((item) => item.email));
                setStateUserEmails(result);
                return result.map((item) => item.email);
            } else {
                throw new Error("Invalid response format");
            }
        },
        enabled: !!session,
    });

    return {linkedEmails: data, isLoading};
};
