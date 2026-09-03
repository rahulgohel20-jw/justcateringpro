import { Tooltip, Button, Spin } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
export const columns = (
  navigate,
  onThemeClick,
  handleApproveOtp,
  handleAssignUser,
  handleExtendClick,
  permissions,
  handleUpgradeModule,
  handleExcelDownload,
  excelLoadingId,
) => {
  const renderWithBlockStyle = (row, content) => {
    const isBlock = row.original.isBlock;

    return (
      <span className={isBlock ? "line-through text-red-500" : ""}>
        {content}
      </span>
    );
  };
  return [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <input
    //       type="checkbox"
    //       checked={table.getIsAllRowsSelected()}
    //       onChange={table.getToggleAllRowsSelectedHandler()}
    //       className="w-4 h-4 cursor-pointer"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <input
    //       type="checkbox"
    //       checked={row.getIsSelected()}
    //       onChange={row.getToggleSelectedHandler()}
    //       disabled={row.original.isBlock}
    //       className="w-4 h-4 cursor-pointer"
    //     />
    //   ),
    //   meta: { headerClassName: "w-[3%]", cellClassName: "w-[3%]" },
    // },
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
        const isBlock = row.original.isBlock;

        return renderWithBlockStyle(
          row,
          <button
            onClick={() => navigate(`/Superadmin-member/${userId}`)}
            className={` ${
              isDue ? "text-green-600" : "text-red-600"
            } ${isBlock ? "line-through text-red-500" : "font-medium hover:underline"}`}
            disabled={isBlock}
          >
            {value}
          </button>,
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[55%]", cellClassName: "w-[55%]" },
    },

    {
      accessorKey: "contactNo",
      header: "Mobile Number",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "database",
      header: "Database",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "theme",
      header: "Themes",
      cell: ({ row }) => {
        const userId = row.original.id;
        const isBlock = row.original.isBlock;

        return (
          <button
            onClick={() => onThemeClick(userId)}
            disabled={isBlock}
            className={`${isBlock ? "font-medium px-4 py-1 rounded text-gray-500 bg-gray-300" : "font-medium px-4 py-1 rounded text-white bg-blue-600"}`}
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
        const isBlock = row.original.isBlock;
        return (
          <button
            onClick={() => handleExtendClick(userId)}
            disabled={isBlock}
            className={`${isBlock ? "font-medium px-4 py-1 rounded text-gray-500 bg-gray-300" : "font-medium px-4 py-1 rounded text-white bg-success"}`}
          >
            Select Date
          </button>
        );
      },
      meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
    },
    {
      accessorKey: "upgrade",
      header: "Upgrade",
      cell: ({ row }) => {
        const userId = row.original.id;
        const isBlock = row.original.isBlock;

        return (
          <Tooltip title="Upgrade Modules">
            <button
              onClick={() => handleUpgradeModule(row.original.id)}
              disabled={isBlock}
              className={`font-medium px-3 py-1 rounded ${
                isBlock
                  ? "text-gray-500 bg-gray-300"
                  : "text-white bg-purple-600 hover:bg-purple-700"
              }`}
            >
              Upgrade
            </button>
          </Tooltip>
        );
      },
    },

    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row, getValue }) => renderWithBlockStyle(row, getValue()),
      meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ getValue, row }) => {
        const value = getValue();
        const isBlock = row.original.isBlock;
        return (
          <span
            className={`font-medium ${value ? "text-primary" : "text-danger"} ${isBlock ? "line-through text-danger" : ""}`}
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
        const isBlock = row.original.isBlock;
        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Call File">
              <button
                className="btn btn-sm btn-icon btn-clear"
                disabled={isBlock}
              >
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
        const isBlock = row.original.isBlock;

        return (
          <div className="flex items-center justify-center gap-1">
            {permissions.edit && (
              <Tooltip title="Edit User">
                <button
                  className="btn btn-sm btn-icon btn-clear"
                  disabled={isBlock}
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
                disabled={isBlock}
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
              <button
                className="btn btn-sm btn-icon btn-clear"
                disabled={isBlock}
              >
                <i className="ki-filled ki-note-2"></i>
              </button>
            </Tooltip>
            {permissions.view && (
              <Tooltip title="Download Excel">
                <Button
                  size="small"
                  icon={
                    excelLoadingId === row.original.id ? (
                      <Spin size="small" />
                    ) : (
                      <DownloadOutlined />
                    )
                  }
                  disabled={excelLoadingId === row.original.id}
                  onClick={() => handleExcelDownload(row.original.id)}
                ></Button>
              </Tooltip>
            )}
            <Tooltip title="Assign Database">
              <button
                className="btn btn-sm btn-icon btn-clear"
                disabled={isBlock}
                onClick={() => handleAssignUser(row.original)}
              >
                <i className="ki-filled ki-profile-circle text-warning"></i>
              </button>
            </Tooltip>
            {permissions.delete && (
              <Tooltip title="Delete">
                <button
                  className="btn btn-sm btn-icon text-danger"
                  disabled={isBlock}
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
                  disabled={isBlock}
                  onClick={() => handleApproveOtp(userId, "block")}
                >
                  <i className="ki-filled ki-minus-circle"></i>
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
  ];
};
