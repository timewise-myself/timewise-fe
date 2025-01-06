"use client";
import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/Button";
import { Board } from "@/types/Board";
import React, { ElementRef, useRef, useState } from "react";
/*import InviteMember from "../../../organization/[organizationId]/_components/InviteMember";*/

interface Props {
  data: Board;
}

const BoardTitleForm = ({ data }: Props) => {
  const [isEditing, setIsEditting] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState(data.title);

  // const { execute } = useAction(updateBoard, {
  //   onSuccess: (data) => {
  //     toast.success(`Board + "${data.title}" + " title updated successfully"`);
  //     setTitle(data.title);
  //     disableEditing();
  //   },
  //   onError: (error) => {
  //     toast.error(error);
  //   },
  // });

  const enableEditing = () => {
    setIsEditting(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  // const disableEditing = () => {
  //   setIsEditting(false);
  // };

  const onSubmit = () => {
    // const title = formData.get("title") as string;
    // execute({ title, id: data.id as string });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className="flex items-center gap-x-2 "
      >
        <FormInput
          ref={inputRef}
          id="title"
          onBlur={onBlur}
          defaltValue={title}
          className="text-lg font-bole px-[7px] py-1 h-7 bg-transparent
            focus-visible:outline-none focus-visible:ring-transparent border-none
            "
        />
      </form>
    );
  }

  return (
    <div>
      <Button
        onClick={enableEditing}
        variant={"transparent"}
        className="font-bold text-lg h-auto w-auto p-1 px-2"
      >
        {title}
      </Button>
      {/*<InviteMember />*/}
    </div>
  );
};

export default BoardTitleForm;
