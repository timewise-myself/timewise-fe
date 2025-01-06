import { ActionState } from "@/lib/create-safe-action";
import { List } from "@/types/Board";
import { z } from "zod";
import { CreateComment } from "./schema";

export type InputType = z.infer<typeof CreateComment>;
export type ReturnType = ActionState<InputType, List>;
