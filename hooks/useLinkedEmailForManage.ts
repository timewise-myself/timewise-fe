/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {useStateContext} from "@/stores/StateContext";

export const useLinkedEmailsForManage = (params: any) => {
  const { data: session } = useSession();
  const { setStateLinkedEmails } = useStateContext();

  const { data, isLoading } = useQuery({
    queryKey: ["linked-email", params],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/account/user/emails?status=${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
          },
        }
      );
      if (!response.ok) {
        return [];
      }

      const result = await response.json();

      // Verify that the result matches the expected format
      if (Array.isArray(result) && result.every((item) => typeof item.email === "string")) {
        setStateLinkedEmails(result.map((item) => item.email));
        return result.map((item) => item.email);
      } else {
        throw new Error("Invalid response format");
      }
    },
    enabled: !!session,
  });

  return { linkedEmails: data, isLoading };
};
