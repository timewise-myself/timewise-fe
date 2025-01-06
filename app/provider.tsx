"use client";
import {SessionProvider} from "next-auth/react";
import React from "react";
import {StateProvider} from "@/stores/StateContext";

interface Props {
  children: React.ReactNode;
}

const Provider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <StateProvider>{children}</StateProvider>
    </SessionProvider>
  );
};

export default Provider;