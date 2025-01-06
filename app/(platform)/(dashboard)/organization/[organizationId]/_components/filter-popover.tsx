/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import {
  CalendarHeart,
  Circle,
  Clock,
  ListFilter,
  UserRoundSearch,
} from "lucide-react";

interface Props {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedMembers: string[];
  setSelectedMember: React.Dispatch<React.SetStateAction<string[]>>;
  due: string;
  setDue: React.Dispatch<React.SetStateAction<string>>;
  dueComplete: boolean;
  setDueComplete: React.Dispatch<React.SetStateAction<boolean>>;
  overdue: boolean;
  setOverdue: React.Dispatch<React.SetStateAction<boolean>>;
  notDue: boolean;
  setNotDue: React.Dispatch<React.SetStateAction<boolean>>;
  isPopoverOpen: boolean;
  setIsPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  listMembers: any;
}

const FilterPopover = memo(
  ({
    search,
    setSearch,
    selectedMembers,
    setSelectedMember,
    due,
    setDue,
    dueComplete,
    setDueComplete,
    overdue,
    setOverdue,
    notDue,
    setNotDue,
    isPopoverOpen,
    setIsPopoverOpen,
    listMembers,
  }: Props) => {
    const handleOverdueChange = useCallback(() => {
      setOverdue((prev) => !prev);
    }, [setOverdue]);

    const handleDueChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setDue(event.target.value);
      },
      [setDue]
    );

    const handleDueCompleteChange = useCallback(() => {
      setDueComplete((prev) => !prev);
    }, [setDueComplete]);

    const handleMemberChange = useCallback(
      (email: string) => {
        setSelectedMember((prev) => {
          if (prev.includes(email)) {
            return prev.filter((member) => member !== email);
          }
          return [...prev, email];
        });
      },
      [setSelectedMember]
    );

    const handleClearFilters = useCallback(() => {
      setSearch("");
      setDue("");
      setDueComplete(false);
      setOverdue(false);
      setNotDue(false);
      setSelectedMember([]);
    }, [
      setSearch,
      setDue,
      setDueComplete,
      setOverdue,
      setNotDue,
      setSelectedMember,
    ]);

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className="bg-transparent flex flex-row items-center font-bold gap-x-2 w-fit cursor-pointer
            p-2 rounded-lg text-black hover:bg-gray-100"
          >
            <ListFilter size={24} />
            <p>Filter</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="space-y-2 w-full flex items-center justify-center">
                <h4 className="font-bold leading-none">Filter</h4>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="search" className="font-bold">
                  Keyword
                </Label>
                <Input
                  id="search"
                  placeholder="Enter name of schedule"
                  className="col-span-2 h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="member" className="font-bold">
                  Member
                </Label>
                <div className="flex flex-col items-start space-y-2">
                  {Array.isArray(listMembers) &&
                    listMembers.map((members: any) => (
                      <div
                        className="flex flex-row items-center gap-x-2"
                        key={members.id}
                      >
                        <Input
                          type="checkbox"
                          id={`member-${members.id}`}
                          checked={selectedMembers.includes(members.email)}
                          onChange={() => handleMemberChange(members.email)}
                          className="w-4 h-4"
                        />
                        <UserRoundSearch size={16} />
                        <label
                          htmlFor={`member-${members.id}`}
                          className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {members.email}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Label htmlFor="date" className="font-bold">
                  Date
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id="notDue"
                    onChange={() => setNotDue((prev) => !prev)}
                    checked={notDue}
                    className="w-4 h-4"
                  />
                  <CalendarHeart size={16} />
                  <label
                    htmlFor="notDue"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Not due
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id="overdue"
                    onChange={handleOverdueChange}
                    checked={overdue}
                    className="w-4 h-4"
                  />
                  <Clock size={16} className="text-red-500" />
                  <label
                    htmlFor="overdue"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Overdue
                  </label>
                </div>
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="due"
                    className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left w-full"
                  >
                    Due in
                  </label>
                  <div className="flex space-x-2 items-start justify-start w-full">
                    <div className="flex flex-col items-start justify-start">
                      <label className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="day"
                          name="due"
                          value="day"
                          checked={due === "day"}
                          onChange={handleDueChange}
                          className="w-4 h-4"
                        />
                        <Clock className="text-blue-500 w-4 h-4" />
                        <span>Today</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="week"
                          name="due"
                          value="week"
                          checked={due === "week"}
                          onChange={handleDueChange}
                          className="w-4 h-4"
                        />
                        <Clock className="text-yellow-500 w-4 h-4" />
                        <span>This Week</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="month"
                          name="due"
                          value="month"
                          checked={due === "month"}
                          onChange={handleDueChange}
                          className="w-4 h-4"
                        />
                        <Clock className="text-green-500 w-4 h-4" />
                        <span>This Month</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={dueComplete}
                    className="w-4 h-4"
                    id="dueComplete"
                    onChange={handleDueCompleteChange}
                  />
                  <Circle size={16} className="text-green-500" />
                  <label
                    htmlFor="dueComplete"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Due Complete
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleClearFilters} className="text-white">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

export default FilterPopover;
