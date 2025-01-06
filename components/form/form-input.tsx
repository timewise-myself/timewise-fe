"use client";
import React from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { cn } from "@/lib/utils";
import { FormErrors } from "./form-error";

interface Props {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: Record<string, string[] | undefined>;
  className?: string;
  defaltValue?: string;
  onBlur?: () => void;
}

const FormInput = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      label,
      type = "text",
      placeholder,
      required,
      disabled,
      error,
      className,
      defaltValue,
      onBlur,
    },
    ref
  ) => {
    const { pending } = useFormStatus();
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          {label ? (
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-neutral-700"
            >
              {label}
            </Label>
          ) : null}
          <Input
            onBlur={onBlur}
            defaultValue={defaltValue}
            ref={ref}
            required={required}
            name={id}
            id={id}
            placeholder={placeholder}
            type={type}
            disabled={pending || disabled}
            className={cn("text-sm px-2 py-1 h-7", className)}
            aria-describedby={`${id}-error`}
          />
        </div>
        <FormErrors id={id} errors={error} />
      </div>
    );
  }
);
FormInput.displayName = "FormInput";

export default FormInput;
