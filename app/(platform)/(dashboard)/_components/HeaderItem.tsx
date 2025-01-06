"use client";

import * as React from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";


// Create a list of navigation lists with default items
export const NAVIGATION_LIST = [
    {
        title: "Manage Workspaces",
        href: `/manage-workspaces/all`,
    },
];

const MenuNavbar = () => {

    return (
        <NavigationMenu className="md:block hidden z-[5] m750:max-w-[300px]">
            <NavigationMenuList className="m750:max-w-[300px]">
                {/* Render the Home section */}
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <a
                            href={NAVIGATION_LIST[0].href}
                            className="block text-text font-heading text-md font-bold p-3 hover:bg-accent hover:rounded-md"
                        >
                            {NAVIGATION_LIST[0].title}
                        </a>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export default MenuNavbar;
