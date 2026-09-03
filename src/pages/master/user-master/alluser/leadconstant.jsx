import { Tooltip } from "antd";
export const columns = (
  navigate,
  onThemeClick,
  handleApproveOtp,
  handleAssignUser,
  handleExtendClick,
  handleConvertClick,
  permissions,
) => {
  return [
    {
      accessorKey: "sr_no",
      header: "Sr No",
      meta: {
        headerClassName: "w-[4%]",
        cellClassName: "w-[4%]",
      },
    },
    {
      accessorKey: "userCode",
      header: "User Code",
      cell: ({ getValue, row }) => {
        const value = getValue();
        const userId = row.original.id;
        const isDue = row.original.dueAmount <= 0;

        return (
          <button
            onClick={() => navigate(`/Superadmin-member/${userId}`)}
            className={`font-medium hover:underline ${
              isDue ? "text-green-600" : "text-red-600"
            }`}
          >
            {value}
          </button>
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Company",
      meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      meta: { headerClassName: "w-[55%]", cellClassName: "w-[55%]" },
    },

    {
      accessorKey: "contactNo",
      header: "Mobile Number",
      meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "database",
      header: "Database",
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "theme",
      header: "Themes",
      cell: ({ row }) => {
        const userId = row.original.id;

        return (
          <button
            onClick={() => onThemeClick(userId)}
            className="font-medium px-4 py-1 rounded text-white bg-blue-600"
          >
            Select Theme
          </button>
        );
      },
      meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
    },
    {
      accessorKey: "extenddate",
      header: "Extended Days",
      cell: ({ row }) => {
        const userId = row.original.id;

        return (
          <button
            onClick={() => handleExtendClick(userId)}
            className="font-medium px-4 py-1 rounded text-white bg-success"
          >
            Select Date
          </button>
        );
      },
      meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
    },

    {
      accessorKey: "createdAt",
      header: "Created At",
      meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span
            className={`font-medium ${value ? "text-primary" : "text-danger"}`}
          >
            {value ? "Yes" : "No"}
          </span>
        );
      },
      meta: { headerClassName: "w-[6%]", cellClassName: "w-[6%]" },
    },
    {
      accessorKey: "call",
      header: "Call",
      meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Call File">
              <button className="btn btn-sm btn-icon btn-clear">
                <i className="ki-filled ki-call text-success"></i>
              </button>
            </Tooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "isApprove",
      header: "Approved",
      cell: ({ row }) => {
        const value = row.original.isApprove;
        const userId = row.original.id;

        if (value) {
          return (
            <span className="font-medium px-4 py-1 rounded text-white bg-green-600">
              Approved
            </span>
          );
        }

        return (
          <button
            onClick={() => handleApproveOtp(userId, "approve")}
            className="font-medium px-4 py-1 rounded text-white bg-blue-600"
          >
            Approve
          </button>
        );
      },
      meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const userId = row.original.id;
        const email = row.original.email;

        return (
          <div className="flex items-center justify-center gap-1">
            {permissions.edit && (
              <Tooltip title="Edit User">
                <button
                  className="btn btn-sm btn-icon btn-clear"
                  onClick={() => {
                    navigate(`/Superadmin-member-edit/${userId}`);
                  }}
                >
                  <i className="ki-filled ki-notepad-edit text-primary"></i>
                </button>
              </Tooltip>
            )}

            <Tooltip title="User logs">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => {
                  navigate("/superadmin-logs", {
                    state: { email: email },
                  });
                }}
              >
                <i className="ki-filled ki-user text-success"></i>
              </button>
            </Tooltip>

            <Tooltip title="Letter">
              <button className="btn btn-sm btn-icon btn-clear">
                <i className="ki-filled ki-note-2"></i>
              </button>
            </Tooltip>
            <Tooltip title="Assign Database">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => handleAssignUser(row.original)}
              >
                <i className="ki-filled ki-profile-circle text-warning"></i>
              </button>
            </Tooltip>
            {permissions.delete && (
              <Tooltip title="Delete">
                <button
                  className="btn btn-sm btn-icon text-danger"
                  onClick={() => handleApproveOtp(userId, "delete")}
                >
                  <i className="ki-filled ki-trash"></i>
                </button>
              </Tooltip>
            )}

            {permissions.delete && (
              <Tooltip title="Block">
                <button
                  className="btn btn-sm btn-icon text-danger"
                  onClick={() => handleApproveOtp(userId, "block")}
                >
                  <i className="ki-filled ki-minus-circle"></i>
                </button>
              </Tooltip>
            )}
            <Tooltip title="Convert">
              <button
                className="btn  btn-icon text-white bg-primary p-1 w-[70px]"
                onClick={() => handleConvertClick(userId)}
              >
                Convert
              </button>
            </Tooltip>
          </div>
        );
      },
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
  ];
};
