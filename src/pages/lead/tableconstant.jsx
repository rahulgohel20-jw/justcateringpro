import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import { useState } from "react";
import { LeadQuickView } from "@/components/lead/LeadQuickView";
export const tablecolumns = [
  {
    accessorKey: "user_full_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Name" column={column} />
    ),
  },
  {
    accessorKey: "contact_person",
    header: ({ column }) => (
      <DataGridColumnHeader title="Contact Person" column={column} />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Amount" column={column} />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataGridColumnHeader title="Date" column={column} />
    ),
  },
  {
    accessorKey: "assign_to",
    header: ({ column }) => (
      <DataGridColumnHeader title="Assign To" column={column} />
    ),
  },
  {
    accessorKey: "stage",
    header: ({ column }) => (
      <DataGridColumnHeader title="Stage" column={column} />
    ),
  },

  {
    accessorKey: "status",
    header: "Action",
    cell: () => {
      const [IsLeadShow, setIsLeadShow] = useState(false);
      return (
        <>
          <div className="flex items-center gap-2">
            <Tooltip title="View">
              <button
                className="btn btn-sm btn-icon btn-clear text-primary border border-[#E3E3E3]"
                title="View"
                onClick={() => setIsLeadShow(true)}
              >
                <i className="ki-filled ki-eye"></i>
              </button>
            </Tooltip>
            <Tooltip title="More">
              <button
                className="btn btn-sm btn-icon btn-clear text-primary border border-[#E3E3E3]"
                title="More"
              >
                <i className="ki-filled ki-dots-vertical"></i>
              </button>
            </Tooltip>
          </div>

          {IsLeadShow && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsLeadShow(false)}
              />
              <div className="ml-auto w-96 bg-white shadow-lg h-full relative z-50">
                <LeadQuickView
                  onClose={() => setIsLeadShow(false)}
                  dropdown={true}
                />
              </div>
            </div>
          )}
        </>
      );
    },
  },
];

export const defaultTableData = [
  {
    id: 1,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 2,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 3,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 4,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 5,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 6,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 7,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 8,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 9,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 10,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 11,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 12,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 13,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 14,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 15,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
  {
    id: 16,
    user_full_name: "Swapnil Ghodeswar",
    contact_person: "Ravi",
    amount: 250,
    date: "2023-11-01",
    assign_to: "George Lewis",
    stage: "Hot Lead",
  },
];
