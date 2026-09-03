import React from "react";


export const ASSIGNED_FUNCTIONS_DATA = [
  {
    id: 1,
    name: "Traditional Sangeet",
    ref: "#SG-902",
    time: "18:00 – 23:00",
    venue: "Grand Ballroom",
    guests: 450,
    manager: "Swapnil",
  },
  {
    id: 2,
    name: "Formal Dinner Gala",
    ref: "#DG-104",
    time: "18:00 – 23:00",
    venue: "Grand Ballroom",
    guests: 450,
    manager: "Zainab",
  },
  {
    id: 3,
    name: "Networking Mixer",
    ref: "#NM-331",
    time: "17:00 – 19:30",
    venue: "Sky Lounge",
    guests: 200,
    manager: "Aarya",
  },
  {
    id: 4,
    name: "Keynote Session",
    ref: "#KS-042",
    time: "09:00 – 11:00",
    venue: "Auditorium A",
    guests: 1200,
    manager: "Rahul",
  },
];


export const ASSIGNED_FUNCTIONS_COLUMNS = [
  {
    accessorKey: "functionName",
    id: "functionName",
    header: () => <span>Function Name</span>,
    cell: ({ row }) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>
          {row.original.functionName}
        </span>
        <span style={{ fontSize: 12, color: "#1855a3" }}>
          #{row.original.eventFunctionId}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "startDate",
    id: "startDate",
    header: () => <span>Start Time</span>,
    cell: ({ getValue }) => (
      <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
        {getValue()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "endDate",
    id: "endDate",
    header: () => <span>End Time</span>,
    cell: ({ getValue }) => (
      <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
        {getValue()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "venue",
    id: "venue",
    header: () => <span>Venue</span>,
    cell: ({ getValue }) => (
      <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>
        {getValue()}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "pax",
    id: "pax",
    header: () => <span>Guests</span>,
    cell: ({ getValue }) => (
      <span style={{
        background: "#f1f3f6", borderRadius: 20, padding: "3px 12px",
        fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", display: "inline-block",
      }}>
        {getValue()}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "managers",
    id: "managers",
    header: () => <span>Manager</span>,
    cell: ({ getValue }) => (
      <span style={{
        background: "#f1f3f6", borderRadius: 20, padding: "3px 10px",
        fontSize: 13, color: "var(--color-text-primary)", display: "inline-block",
      }}>
        {getValue()}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "action",
    id: "action",
    header: () => <span>Action</span>,
    cell: () => null, 
    enableSorting: false,
  },
];


export const ASSIGNED_FUNCTIONS_DEFAULT_SORTING = [{ id: "name", desc: false }];


export const ASSIGNED_FUNCTIONS_TOOLBAR = {
  search: {
    enabled: false,
  },
  viewToggle: true,
  filter: true,
};
