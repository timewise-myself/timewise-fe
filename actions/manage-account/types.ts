import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/types/Board";
import { z } from "zod";
import { ManageAccount } from "./schema";

export type InputType = z.infer<typeof ManageAccount>;
export type ReturnType = ActionState<InputType, List>;
