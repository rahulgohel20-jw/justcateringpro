import { useState } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

const checklistItems = [
  "Create role and permission. Go to the settings > Click on Role and Permission > Add Role",
  "Add CRM members",
  "Add Pipelines and stages. Go to settings > Customize > Click on Pipelines",
  "Try predefined pipeline templates",
  "Connect your own WhatsApp number to send notification & reminder from your company's number",
  "Define product units and product category",
  "Define lead source type",
  "Customize your own lead form by adding custom field",
  "Create Tags for leads",
  "Invite users",
  "Assign leads",
  "Create follow-up tasks",
  "Track activity logs",
  "Use filters in lead table",
  "Add support tickets",
  "Connect email service",
  "Setup company profile",
  "Enable notifications",
  "Access mobile app",
  "Explore analytics dashboard",
];

export const ProgressChecklistPage = () => {
  const [completedItems, setCompletedItems] = useState([]);

  const toggleComplete = (index) => {
    setCompletedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const progressPercent = Math.round(
    (completedItems.length / checklistItems.length) * 100
  );

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Progress Checklist" }]} />
        </div>

        <div className="mb-3 flex items-center gap-2.5">
          <p className="text-sm font-semibold text-gray-900">Your Progress:</p>
          <p className="text-sm font-semibold text-gray-900">
            {completedItems.length}/{checklistItems.length}
          </p>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {progressPercent}%
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white border rounded-lg shadow-sm">
          {checklistItems.map((item, index) => {
            const isDone = completedItems.includes(index);
            return (
              <div className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 transition">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  key={index}
                  onClick={() => toggleComplete(index)}
                >
                  {isDone ? (
                    <CheckSquare className="text-success" size={20} />
                  ) : (
                    <Square className="text-gray-400" size={20} />
                  )}
                  <span
                    className={`text-sm text-gray-900 ${
                      isDone ? "line-through" : ""
                    }`}
                  >
                    {index + 1}. {item}
                  </span>
                </div>
                <div
                  className="btn btn-sm btn-light p-0 w-7 h-7 flex items-center justify-center"
                  title="Watch Video"
                >
                  <i className="ki-filled ki-to-right ps-0.5"></i>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Fragment>
  );
};

export default ProgressChecklistPage;
