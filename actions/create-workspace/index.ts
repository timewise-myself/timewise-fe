"use server";

import { getSession } from "next-auth/react";
import { CreateWorkspace } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();

  if (!session) {
    return {
      error: "Unauthorized!",
    };
  }

  const { title, description, email } = data;
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/api/v1/workspace/create-workspace`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.access_token}`,
        },
        body: JSON.stringify({
          description,
          email: email,
          is_deleted: false,
          key: "",
          title,
          type: "workspace",
        }),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      error: "Failed to create workspace",
    };
  }
};

export const createWorkspace = createSafeAction(CreateWorkspace, handler);
