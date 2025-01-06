import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import Image from "next/image";

interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
  btnSubmitContent?: string;
  btnContentIcon?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const CustomDialog = ({
  title,
  description,
  children,
  btnContentIcon,
  isOpen,
  onClose,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={isOpen ? onClose : undefined}>
      <DialogTrigger asChild>
        <Button
          asChild
          type="button"
          size="icon"
          variant="ghost"
          className="ml-auto cursor-pointer"
        >
          <div className="w-fit p-2 text-lg font-semibold space-x-2 flex items-center">
            <p>{btnContentIcon}</p>
            <Plus className="w-4 h-4" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="font-bold text-lg box-border p-5 sm:max-w-[600px] bg-white space-y-1">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {/*<Image*/}
          {/*  width={800}*/}
          {/*  height={500}*/}
          {/*  src="/images/banner/3.png"*/}
          {/*  alt="workspace"*/}
          {/*  className="h-[300px]"*/}
          {/*/>*/}
        </DialogHeader>
        {children}
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default CustomDialog;
