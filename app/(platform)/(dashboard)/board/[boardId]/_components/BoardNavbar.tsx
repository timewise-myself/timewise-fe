/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import BoardTitleForm from "./BoardTitleForm";
import BoardOptions from "./BoardOptions";

interface Props {
  data: any;
}

const BoardNavbar = ({ data }: Props) => {
  return (
    <div>
      <div
        className="w-full h-14 z-[40] bg-black/50 fixed top-14 flex items-center
      px-6 gap-x-4 text-white"
      >
        <BoardTitleForm data={data} />
        <div className="ml-auto">
          <BoardOptions />
        </div>
      </div>
    </div>
  );
};

export default BoardNavbar;
