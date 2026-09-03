import { Tooltip } from "antd";
import AssignTheme from "../theme";
export const columns = (
  onEdit,
  handleApprove,
  navigate,
  onThemeClick,
  handleApproveOtp,
  permissions = {},
) => {
  return [
    {
      accessorKey: "userCode",
      header: "Vendor Code",
      cell: ({ getValue, row }) => {
        const value = getValue();
        const userId = row.original.id;
        return (
          <button
            onClick={() => navigate(`/Superadmin-member/${userId}`)}
            className="text-blue-600 hover:underline font-medium"
          >
            {value}
          </button>
        );
      },
      meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
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
      header: "Category Type",
      meta: { headerClassName: "w-[25%]", cellClassName: "w-[25%]" },
    },
    {
      accessorKey: "companysize",
      header: "Company Size",
      meta: { headerClassName: "w-[25%]", cellClassName: "w-[25%]" },
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
            onClick={() => handleApproveOtp(userId)}
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
          </div>
        );
      },
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
  ];
};
