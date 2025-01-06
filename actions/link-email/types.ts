import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/types/Board";
import { z } from "zod";
import { LinkEmail } from "./schema";

export type InputType = z.infer<typeof LinkEmail>;
export type ReturnType = ActionState<InputType, List>;
