"use client";

import { useEffect, useState } from "react";
import CardModal from "../modals";

export const ModalProvider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <CardModal />
    </>
  );
};
