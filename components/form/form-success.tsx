import { CheckCircleIcon } from "lucide-react";
import React from "react";

interface Props {
  message?: string;
}

const FormSuccess = ({ message }: Props) => {
  return (
    <div className="bg-green-300 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CheckCircleIcon className="w-4 h-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
