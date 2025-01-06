import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Props {
  children: React.ReactNode;
  description: string | React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  sideOffSet?: number;
}

const HintTool = ({
  children,
  description,
  side = "bottom",
  sideOffSet = 0,
}: Props) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent
          sideOffset={sideOffSet}
          side={side}
          className="text-xs max-w-[220px] break-words"
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HintTool;
