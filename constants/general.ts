import {Lock, LockOpen, LucideProps} from "lucide-react";
import {ForwardRefExoticComponent, RefAttributes} from "react";

interface VisibilityOptions {
    label: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export const VisibilityConst: { public: VisibilityOptions; private: VisibilityOptions } = {
    public: {
        label: "Public",
        icon: LockOpen,
    },
    private: {
        label: "Private",
        icon: Lock,
    },
};

export const StatusConst: { 'not yet': string; 'in progress': string; done: string } = {
    'not yet': 'Not Yet',
    'in progress': 'In Progress',
    done: 'Done',
};