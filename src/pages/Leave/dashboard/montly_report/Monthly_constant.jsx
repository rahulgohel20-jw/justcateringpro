// Monthly Report Table Constants

export const monthlyReportData = [
  {
    name: "Aarya Kansara",
    present: 12,
    leave: 2,
    absent: 5,
    workDuration: "90:00:00",
    reportingManager: "Manan Gandhi",
  },
  {
    name: "Dev Soni",
    present: 10,
    leave: 3,
    absent: 7,
    workDuration: "75:00:00",
    reportingManager: "Manan Gandhi",
  },
  {
    name: "Keval Soni",
    present: 9,
    leave: 1,
    absent: 8,
    workDuration: "70:00:00",
    reportingManager: "Manan Gandhi",
  },
  {
    name: "Manan Gandhi",
    present: 15,
    leave: 0,
    absent: 3,
    workDuration: "100:00:00",
    reportingManager: "Not Assigned",
  },
  {
    name: "Ritesh Sharma",
    present: 13,
    leave: 2,
    absent: 3,
    workDuration: "85:00:00",
    reportingManager: "Manan Gandhi",
  },
];

export const monthlyReportColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "present", header: "Present" },
  { accessorKey: "leave", header: "Leave" },
  { accessorKey: "absent", header: "Absent" },
  { accessorKey: "workDuration", header: "Work duration" },
  { accessorKey: "reportingManager", header: "Reporting Manager" },
];
