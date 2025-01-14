import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/types/Board";
import { z } from "zod";
import { CreateList } from "./schema";

export type InputType = z.infer<typeof CreateList>;
export type ReturnType = ActionState<InputType, List>;
