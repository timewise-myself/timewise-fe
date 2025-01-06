import * as React from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// Define the type for ListItem props
interface ListItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    title: string;
    children?: React.ReactNode;
}

export const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            "hover:bg-accent hover:rounded-md block text-text select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:border-border dark:hover:border-darkBorder",
                            className
                        )}
                        {...props}
                    >
                        <div className="text-base font-heading leading-none">{title}</div>
                        <p className="text-muted-foreground font-base line-clamp-2 text-sm leading-snug">
                            {children}
                        </p>
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);

ListItem.displayName = "ListItem";

export default ListItem;
