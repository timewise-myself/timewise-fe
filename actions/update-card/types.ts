import * as z from "zod";
import { UpdateCard } from "./schema";
import { Card } from "@/types/Board";
import { ActionState } from "@/lib/create-safe-action";

export type InputType = z.infer<typeof UpdateCard>;
export type ReturnType = ActionState<InputType, Card>;
