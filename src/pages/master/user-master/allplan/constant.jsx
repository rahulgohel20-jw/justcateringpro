import { underConstruction } from "@/underConstruction";
import {  Tooltip } from "antd";
export const planColumns = [
  {
    id: "customerName",
    header: "Customer Name",
    accessorKey: "customerName",
  },
  {
    id: "planName",
    header: "Plan Name",
    accessorKey: "planName",
  },
  {
    id: "planPrice",
    header: "Plan Price",
    accessorKey: "planPrice",
    cell: (info) =>
      info.getValue() !== "-" ? `₹${info.getValue()}` : "-",
  },
  {
    id: "billingCycle",
    header: "Billing Cycle",
    accessorKey: "billingCycle",
  },
  {
    id: "planDescription",
    header: "Description",
    accessorKey: "planDescription",
  },
  {
    id: "isPopular",
    header: "Popular",
    accessorKey: "isPopular",
 cell: ({ getValue }) => {
    const value = getValue();
    return (
      <span
        className={`font-medium ${
          value ? "text-primary" : "text-danger"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original; // full row data (plan)
      return (
        <div className="flex gap-2">
          <Tooltip className="cursor-pointer" title="Edit Member">
            
              <button className="btn btn-sm btn-icon btn-clear" title="Edit">
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            
          </Tooltip>
          <Tooltip title="Delete">
            {/* <Link to="/menu-allocation"> */}
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Delete"
              onClick={underConstruction}
            >
              <i className="ki-filled ki-trash  text-danger"></i>
            </button>
            {/* </Link> */}
          </Tooltip>
        </div>
      );
    },
  },
];
