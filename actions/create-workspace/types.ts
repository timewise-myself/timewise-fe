import { ActionState } from "@/lib/create-safe-action";
import { z } from "zod";
import { CreateWorkspace } from "./schema";
export type InputType = z.infer<typeof CreateWorkspace>;
export type ReturnType = ActionState<
  InputType,
  {
    title: string;
    description: string;
  }
>;
