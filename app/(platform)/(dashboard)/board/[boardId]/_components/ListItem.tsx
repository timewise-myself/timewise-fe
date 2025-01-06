import { ListWithCards } from "@/types/Board";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import React, { ElementRef, useRef, useState } from "react";
import ListHeader from "./ListHeader";
import CardItem from "./CardItem";
import { cn } from "@/lib/utils";
import AddSchedule from "../../../organization/[organizationId]/_components/add-schedule";

interface Props {
  data: ListWithCards;
  index: number;
}

export const ListItem = ({ index, data }: Props) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  if (!data || !data.id) {
    return <></>;
  }

  return (
    <Draggable draggableId={data.id.toString()} index={index}>
      {(provided) => (
          <li
              {...provided.draggableProps}
              ref={provided.innerRef}
              className="shrink-0 h-full w-[272px] select-none"
          >
            <div
                {...provided.dragHandleProps}
                className="w-full rounded-md bg-[#f1f2f4] shadow-md max-h-[94%] flex flex-col overflow-hidden"
            >
              {/* Fixed Header */}
              <ListHeader onAddCard={enableEditing} data={data} className="flex-none"/>

              {/* Scrollable Middle Section */}
              <div className="flex-grow overflow-y-auto">
                <Droppable droppableId={data.id} type="card">
                  {(provided) => (
                      <ol
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={cn(
                              "mx-1 px-1 py-0.5 flex flex-col gap-y-2",
                              data?.cards?.length > 0 ? "mt-2" : "mt-0"
                          )}
                      >
                        {data.schedules?.length > 0 ? (
                            data.schedules.map((schedule, index) => (
                                <CardItem
                                    key={schedule.id}
                                    index={index}
                                    data={schedule}
                                    isBlurred={schedule.extra_data === "IsLocked"}
                                />
                            ))
                        ) : (
                            <></>
                        )}
                        {provided.placeholder}
                      </ol>
                  )}
                </Droppable>
              </div>

              {/* Fixed Footer */}
              <AddSchedule
                  className="flex-none"
                  listId={data.id}
                  isEditing={isDialogOpen}
                  enableEditing={openDialog}
                  disableEditing={closeDialog}
                  isGlobalCalendar={false}
                  closeDialog={closeDialog}
                  openDialog={openDialog}
              />
            </div>

          </li>
      )}
    </Draggable>
  );
};

export default ListItem;
