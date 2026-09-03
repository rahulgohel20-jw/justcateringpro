// Daily Report Data
export const dailyReportData = [
  {
    name: "Aarya Kansara",
    status: "Absent",
    loginTime: "X",
    logoutTime: "X",
    totalDuration: "X",
  },
  {
    name: "Dev Soni",
    status: "Absent",
    loginTime: "—",
    logoutTime: "—",
    totalDuration: "—",
  },
  {
    name: "Keval Soni",
    status: "Absent",
    loginTime: "—",
    logoutTime: "—",
    totalDuration: "—",
  },
  {
    name: "Manan Gandhi",
    status: "Absent",
    loginTime: "—",
    logoutTime: "—",
    totalDuration: "—",
  },
  {
    name: "Ritesh Sharma",
    status: "Absent",
    loginTime: "—",
    logoutTime: "—",
    totalDuration: "—",
  },
];

export const dailyReportColumns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="text-red-500 font-medium">{row.original.status}</span>
    ),
  },
  {
    accessorKey: "loginTime",
    header: "Login time",
    cell: () => <span className="text-red-500 text-xl">✖</span>,
  },
  {
    accessorKey: "logoutTime",
    header: "Logout Time",
    cell: () => <span className="text-red-500 text-xl">✖</span>,
  },
  {
    accessorKey: "totalDuration",
    header: "Total Duration",
    cell: () => <span className="text-red-500 text-xl">✖</span>,
  },
];
    
