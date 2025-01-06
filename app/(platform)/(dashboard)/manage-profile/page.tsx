"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import React from "react";

import AccountInformation from "./_components/account-information";
import LinkedEmail from "./_components/linked-email";
import { getAccountInformation } from "@/lib/fetcher";

const ManageAccountPage = () => {
  const { data: session } = useSession();

  const { data: accountInformation } = useQuery({
    queryKey: ["accountInformation"],
    queryFn: async () => {
      const data = await getAccountInformation(session);
      return data;
    },
    enabled: !!session,
  });

  return (
    <Tabs defaultValue="account" className="w-[700px] mt-20">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Profile</TabsTrigger>
        <TabsTrigger value="linked-email">Linked Emails</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountInformation accountInformation={accountInformation} />
      </TabsContent>
      <TabsContent value="linked-email">
        <LinkedEmail />
      </TabsContent>
    </Tabs>
  );
};

export default ManageAccountPage;
