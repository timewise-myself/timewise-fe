/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Image from "next/image";
import { format } from "date-fns";

interface Props {
  session: any;
  activities: any;
}

const Activities = ({ session, activities }: Props) => {
  return (
    <div className="overflow-auto space-y-2">
      {activities && activities.length > 0 ? (
        activities.map((activity: any) => (
          <div
            className="flex flex-row items-star justify-start gap-x-2 p-2 bg-sky-50 rounded-lg"
            key={activity.id}
          >
            <Image
              src={session?.user?.picture || "/images/banner/1.png"}
              alt="avatar"
              width={40}
              height={40}
              className="h-5 w-5 rounded-full object-cover"
            />
            <div className="flex flex-col items-start">
              <div className="flex flex-row gap-x-2">
                <p className="font-bold">{activity?.first_name}</p>
                <p>
                  {format(new Date(activity?.created_at), "dd/MM/yyyy HH:mm")}
                </p>{" "}
              </div>
              <p>Action: {activity?.action}</p>

              <div className="flex flex-row gap-x-2 text-sm">
                <p className="line-through">{activity?.old_value}</p>
                {"->"}
                <p>{activity?.new_value}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="w-full flex items-center font-bold text-md">
          No activities yet!
        </p>
      )}
    </div>
  );
};

export default Activities;
