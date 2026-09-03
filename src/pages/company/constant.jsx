import { DataGridColumnHeader } from "@/components";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
export const columns = [
  
  {
  accessorKey: "company",
  header: ({ column }) => (
    <DataGridColumnHeader title="Company" column={column} />
  ),
  cell: ({ cell }) => {
    const company = cell.getValue();
    return (
      <div className="flex items-center gap-2">
        {/* Show only on mobile */}
        <i className="ki-filled ki-user text-primary text-lg sm:hidden"></i>
        {/* Always show company name */}
        <span>{company}</span>
      </div>
    );
  },
}

,
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataGridColumnHeader title="Address" column={column} />
    ),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataGridColumnHeader title="City" column={column} />
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataGridColumnHeader title="State" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="View">
            <Link to="/companydetails">
              <button className="btn btn-sm btn-icon btn-clear" title="View">
                <i className="ki-filled ki-eye text-success"></i>
              </button>
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => cell.row.original.handleModalOpen()}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button className="btn btn-sm btn-icon btn-clear" title="Delete">
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
export const defaultData = [
  {
    id: 1,
    company_name: "Hope Foundation",
    address: "123 Kindness Lane",
    city: "New York",
    state: "NY",
  },
  {
    id: 2,
    company_name: "Care & Share Trust",
    address: "456 Giving Street",
    city: "Los Angeles",
    state: "CA",
  },
  {
    id: 3,
    company_name: "Helping Hands Org",
    address: "789 Support Avenue",
    city: "Chicago",
    state: "IL",
  },
  {
    id: 4,
    company_name: "Bright Future NGO",
    address: "101 Dream Road",
    city: "Houston",
    state: "TX",
  },
  {
    id: 5,
    company_name: "Kind Heart Society",
    address: "202 Hope Blvd",
    city: "Phoenix",
    state: "AZ",
  },
  {
    id: 6,
    company_name: "Smile Givers",
    address: "303 Smile Street",
    city: "Philadelphia",
    state: "PA",
  },
  {
    id: 7,
    company_name: "Compassion Crew",
    address: "404 Love Lane",
    city: "San Antonio",
    state: "TX",
  },
  {
    id: 8,
    company_name: "Change Makers",
    address: "505 Change Circle",
    city: "San Diego",
    state: "CA",
  },
  {
    id: 9,
    company_name: "Charity First",
    address: "606 Charity Way",
    city: "Dallas",
    state: "TX",
  },
  {
    id: 10,
    company_name: "Open Arms Trust",
    address: "707 Welcome Ave",
    city: "San Jose",
    state: "CA",
  },
  {
    id: 11,
    company_name: "United Hearts",
    address: "808 Unity Road",
    city: "Austin",
    state: "TX",
  },
  {
    id: 12,
    company_name: "Peace Path",
    address: "909 Peace Street",
    city: "Jacksonville",
    state: "FL",
  },
  {
    id: 13,
    company_name: "Bridge of Hope",
    address: "100 Hope Bridge",
    city: "Fort Worth",
    state: "TX",
  },
  {
    id: 14,
    company_name: "Healing Touch",
    address: "111 Healing Blvd",
    city: "Columbus",
    state: "OH",
  },
  {
    id: 15,
    company_name: "The Giving Tree",
    address: "121 Tree Lane",
    city: "Charlotte",
    state: "NC",
  },
  {
    id: 16,
    company_name: "Light the Way",
    address: "131 Light Street",
    city: "San Francisco",
    state: "CA",
  },
  {
    id: 17,
    company_name: "New Life Trust",
    address: "141 Renewal Road",
    city: "Indianapolis",
    state: "IN",
  },
  {
    id: 18,
    company_name: "Lend A Hand Org",
    address: "151 Help Ave",
    city: "Seattle",
    state: "WA",
  },
  {
    id: 19,
    company_name: "Sunshine Society",
    address: "161 Sun Blvd",
    city: "Denver",
    state: "CO",
  },
  {
    id: 20,
    company_name: "Hope Harbor",
    address: "171 Safe Harbor Dr",
    city: "Washington",
    state: "DC",
  },
  {
    id: 21,
    company_name: "Wings of Care",
    address: "181 Flight Way",
    city: "Boston",
    state: "MA",
  },
  {
    id: 22,
    company_name: "Beacon Trust",
    address: "191 Beacon Lane",
    city: "El Paso",
    state: "TX",
  },
  {
    id: 23,
    company_name: "Heartful Hands",
    address: "201 Heart Street",
    city: "Nashville",
    state: "TN",
  },
  {
    id: 24,
    company_name: "Rise Together",
    address: "211 Rise Road",
    city: "Detroit",
    state: "MI",
  },
  {
    id: 25,
    company_name: "Comfort Givers",
    address: "221 Comfort Blvd",
    city: "Memphis",
    state: "TN",
  },
  {
    id: 26,
    company_name: "Faith Forward",
    address: "231 Faith Circle",
    city: "Baltimore",
    state: "MD",
  },
  {
    id: 27,
    company_name: "Rescue Reach",
    address: "241 Rescue Ave",
    city: "Louisville",
    state: "KY",
  },
  {
    id: 28,
    company_name: "Unity Foundation",
    address: "251 Unity Blvd",
    city: "Milwaukee",
    state: "WI",
  },
  {
    id: 29,
    company_name: "Empathy Network",
    address: "261 Care Road",
    city: "Albuquerque",
    state: "NM",
  },
  {
    id: 30,
    company_name: "Giving Grace",
    address: "271 Grace Street",
    city: "Tucson",
    state: "AZ",
  },
];
