"use client";
import React, { useState } from "react";
import Image from "next/image";

export const productivityList = [
  {
    title: "Board",
    description:
      "Organize your projects visually with our interactive boards. Drag and drop tasks as they progress through stages, and customize columns to fit your workflow. Perfect for teams looking to visualize project milestones and individual responsibilities.",
    img: "/images/board-management.webp",
    bgColor: "#d0f4f8",
  },
  {
    title: "Calendar",
    description:
      "Keep track of deadlines, meetings, and events with our integrated calendar. Sync with external calendars to ensure you never miss an important date. Use our drag-and-drop interface to reschedule tasks and events effortlessly.",
    img: "/images/calendar-management.webp",
    bgColor: "#d6e7fb",
  },
  {
    title: "Summary Content",
    description:
      "Manage daily tasks with efficiency. Set priorities, deadlines, and assignees. Receive notifications for upcoming deadlines and changes to task status. Utilize filters to view tasks by date, project, or priority.",
    img: "/images/task-management.webp",
    bgColor: "#fefbd1",
  },
];

const Banner = () => {
  const [itemIndex, setItemIndex] = useState(0);
  return (
    <div className="px-[10%] py-10 bg-gradient-to-r from-sky-50 to-sky-100 space-y-3">
      <h1 className=" text-6xl font-bold text-shadow-xl ">
        A Productivity Software
      </h1>
      <h2 className=" text-xl max-w-[600px] font-bold">
        See why TimeWise flexible, user-friendly Kanban boards are the top
        choice for teams seeking more customization and control.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] space-x-[200px] ">
        <div className="flex flex-col justify-between py-4 leading-normal">
          {productivityList.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer p-3 rounded-md ${
                index === itemIndex
                  ? "bg-gray-200 md:border-l-4 md:border-[#00c7e5]"
                  : ""
              }`}
              style={{
                backgroundColor:
                  index === itemIndex ? item.bgColor : "transparent",
              }}
              onClick={() => setItemIndex(index)}
            >
              <h5 className="mb-2 text-lg  tracking-tight font-bold">
                {item.title}
              </h5>
              <p className="mb-3  text-gray-700">{item.description} </p>
            </div>
          ))}
        </div>
        <Image
          src={`/images/banner/${itemIndex + 3}.png`}
          alt=""
          width={1000}
          height={1000}
          quality={100}
          className="w-[600px] h-[500px] object-contain rounded-t-lg"
        />
      </div>
    </div>
  );
};

export default Banner;
