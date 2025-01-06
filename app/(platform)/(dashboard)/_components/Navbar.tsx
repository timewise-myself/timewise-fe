import {Plus} from "lucide-react";
import React from "react";
import MobileSidebar from "./MobileSidebar";
import Logo from "@/components/ui/Logo";
import {Button} from "@/components/ui/Button";
import FormPopOver from "@/components/form/form-popover";
import HeaderItem from "./HeaderItem";
import MenuAccountList from "./MenuAccountSetting";
import {EnrichedSession, auth} from "@/auth";
import Notification from "@/app/(platform)/(dashboard)/_components/Notification";

const Navbar = async () => {
    const session = await auth();
    return (
        <>
            <nav className="px-4 py-2 w-full border-b shadow-sm bg-gray-50 flex items-center">
                <MobileSidebar/>
                <div className="flex items-center gap-x-4">
                    <div className="hidden md:flex">
                        <Logo hasText={false}/>
                    </div>
                    <HeaderItem/>

                    <FormPopOver>
                        <Button
                            className="rounded-sm block md:hidden h-auto py-1.5 px-2  bg-sky-700 text-white
            hover:bg-gray-800 duration-300"
                        >
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </FormPopOver>
                </div>
                <div className="ml-auto flex items-center gap-x-2">
                    <Notification/>
                    <MenuAccountList session={session as EnrichedSession}/>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
