import React from "react";
/*import Info from "../_components/Info";*/
import ViewMember from "./_components/ViewMember";
import {Separator} from "@components/ui/separator";
import WorkspaceInfo
    from "@/app/(platform)/(dashboard)/organization/[organizationId]/members/_components/WorkspaceInfo";
import WorkspaceActions
    from "@/app/(platform)/(dashboard)/organization/[organizationId]/members/_components/WorkspaceActions";

const MemberPage = () => {
    return (
        <div className="">
            <div className="h-screen flex flex-col bg-white">
                <WorkspaceInfo />
                <ViewMember/>
                <WorkspaceActions/>
            </div>
        </div>
    );
};

export default MemberPage;
