import React from "react";

interface CustomModalProps {
  eventId: string | null;
}

const ScheduleDetailsDrawer: React.FC<CustomModalProps> = ({ eventId }) => {
  return (
      <div>
        <div>CustomModal</div>
        <div>Event ID: {eventId}</div>
      </div>
  );
};

export default ScheduleDetailsDrawer;