"use client";
import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@components/ui/Button";

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

const FormSubmit = ({ children, disabled, className, variant }: Props) => {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button
        className={className}
        disabled={disabled || pending}
        type="submit"
        variant={
          variant as
            | "secondary"
            | "link"
            | "default"
            | "destructive"
            | "outline"
            | "ghost"
        }
      >
        {children}
      </Button>
    </div>
  );
};

export default FormSubmit;
