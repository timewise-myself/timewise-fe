import { ActionState } from "@/lib/create-safe-action";
import { z } from "zod";
import { CopyList } from "./schema";
import { List } from "@/types/Board";

export type InputType = z.infer<typeof CopyList>;
export type ReturnType = ActionState<InputType, List>;
