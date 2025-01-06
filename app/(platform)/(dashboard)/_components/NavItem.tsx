"use client";
import { cn } from "@/lib/utils";
import { AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarHeart, Layout, Users } from "lucide-react";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@/types/Board";

interface Props {
  isExpanded: boolean;
  isActive: boolean;
  workspace: Workspace;
  onExpand: (id: string) => void;
}

const NavItem = ({ workspace, onExpand }: Props) => {
  const router = useRouter();
  const pathName = usePathname();

  const routers = [
    {
      label: "Board",
      icon: <Layout className="h-3 w-3 mr-1" />,
      href: `/organization/${workspace.ID}`,
    },
    {
      label: "Calendar",
      icon: <CalendarHeart className="h-3 w-3 mr-1" />,
      href: `/organization/${workspace.ID}/calender`,
    },
    {
      label: "Settings",
      icon: <Users className="h-3 w-3 mr-1" />,
      href: `/organization/${workspace.ID}/members`,
    },
  ];

  const onClick = (href: string) => {
    router.push(href);
  };

  return (
    <AccordionItem value={String(workspace.ID)} className="border-none">
      <AccordionTrigger
        onClick={() => onExpand(String(workspace.ID))}
        className={cn(
          "w-full flex items-center gap-x-2 text-neutral-700 rounded-md transition text-start no-underline hover:no-underline"
          // isActive && !isExpanded && "bg-sky-500/10 text-sky-700"
        )}
      >
        <div className="flex items-center gap-x-2">
          {/*<div className="w-6 h-6 relative">*/}
          {/*  <Image*/}
          {/*    fill*/}
          {/*    src={"/images/banner/1.webp"}*/}
          {/*    alt="organization"*/}
          {/*    className="rounded-sm object-cover"*/}
          {/*  />*/}
          {/*</div>*/}
          <span className="text-sm font-semibold pt-1">
            {workspace.title}
          </span>
          {workspace.type === "personal" && (<span className="text-xs italic text-gray-500 pt-1.5">Personal</span>)}
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-neutral-700">
        {routers.map((route) => (
          <Button
            key={route.href}
            size="sm"
            onClick={() => onClick(route.href)}
            className={cn(
              "w-full text-xs justify-start",
              pathName === route.href && "bg-sky-500/10 text-sky-700"
            )}
            variant="ghost"
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

export default NavItem;

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="w-10 h-10 relative shrink-0">
        <Skeleton className="w-full h-full absolute" />
      </div>
      <Skeleton className=" h-10 w-full" />
    </div>
  );
};
