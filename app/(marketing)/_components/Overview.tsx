import { Anvil, Apple, BadgePercent, BookAudio } from "lucide-react";

export function createMarkup(data: string) {
  return { __html: data };
}
const Overviews = [
  {
    backgroundColor: "#a8d9e8",
    icon: <BadgePercent className="w-10 h-10" />,
    title: "Schedules Management",
    description:
      " Allow for easy event creation, modification, and deletion via drag-and-drop. Consider using a library like FullCalendar for robust calendar functionalities that support these interactions.",
  },
  {
    backgroundColor: "#b3c9ff",

    icon: <Anvil className="w-10 h-10" />,
    title: "Improve UI/UX",
    description:
      "Enhance the visual feedback in the UI, such as adding animations when tasks are moved or updated, and visual cues for drag-and-drop actions.",
  },
  {
    backgroundColor: "#a8e8e7",
    icon: <Apple className="w-10 h-10" />,
    title: "AI Integration",
    description:
      "API for accessing meeting content if available. Use this data to feed into your AI summarization model.",
  },
  {
    backgroundColor: "#a8cfee",
    icon: <BookAudio className="w-10 h-10" />,
    title: "Calendar Features",
    description:
      "Break down UI into smaller components for better manageability and reusability. This includes individual components for cards, lists, and the calendar.",
  },
];

const Overview = () => {
  return (
    <>
      <div className="max-w-screen-xl py-10 ">
        <h1 className=" text-6xl font-bold text-shadow-xl p-2 text-center">
          Overview of TIMEWISE as AI-powered schedule platform
        </h1>
        <p className="text-gray-950 text-center text-xl leading-6 tracking-[0.14px] mt-3 ">
          Enhance the visual feedback in the UI, such as adding animations when
          tasks are moved or updated, and visual cues for drag-and-drop.
        </p>

        <div className="mt-7 md:grid md:grid-cols-4 gap-5 h-72 mb-10 overflow-x-auto ">
          {Overviews.map((item, index) => (
            <div
              key={index}
              className="cursor-pointer bg-sky-50 rounded-lg p-5 flex flex-col items-center space-y-4 hover:shadow-md hover:bg-gray-100 hover:text-white"
              style={{ backgroundColor: item.backgroundColor }}
            >
              {item.icon}
              <div
                className={
                  "text-gray-950 text-center text-lg font-bold h-13 tracking-[0.2px] normal-case flex items-center flex-grow-1 "
                }
                dangerouslySetInnerHTML={createMarkup(item.title)}
              />
              <p className="text-gray-950 text-center leading-5 tracking-[0.14px] flex flex-grow-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Overview;
