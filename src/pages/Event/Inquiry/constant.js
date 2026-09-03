export const columns = (permissions) => [
  {
    id: "sr_no",
    accessorKey: "sr_no",
    header: "Sr No",
  },
  {
    id: "guestName",
    accessorKey: "guestName",
    header: "Guest Name",
  },
  {
    id: "mobileNo",
    accessorKey: "mobileNo",
    header: "Mobile No",
  },
  {
    id: "emailId",
    accessorKey: "emailId",
    header: "Email",
  },
  {
    id: "function",
    accessorKey: "function",
    header: "Function",
  },
  {
    id: "inquiryDate",
    accessorKey: "inquiryDate",
    header: "Inquiry Date",
  },
  {
    id: "tentativeDate",
    accessorKey: "tentativeDate",
    header: "Tentative Date",
  },
  {
    id: "referralSource",
    accessorKey: "referralSource",
    header: "Referral Source",
  },

  ...(permissions?.edit || permissions?.delete
    ? [
        {
          id: "actions",
          header: "Action",
          cell: ({ row }) => row.original.actions,
        },
      ]
    : []),
];