import { ActionState } from "@/lib/create-safe-action";
import { z } from "zod";
import { UpdateCardOrder } from "./schema";
import { Card } from "@/types/Board";

export type InputType = z.infer<typeof UpdateCardOrder>;
export type ReturnType = ActionState<InputType, Card[]>;
