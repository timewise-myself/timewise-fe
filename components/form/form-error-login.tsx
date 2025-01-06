import { X } from "lucide-react";
import React from "react";

interface Props {
  message?: string;
}

const FormErrorLogin = ({ message }: Props) => {
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600">
      <X className="w-4 h-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormErrorLogin;
