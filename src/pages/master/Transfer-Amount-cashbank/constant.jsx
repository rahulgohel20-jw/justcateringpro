import { Badge, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import Swal from "sweetalert2";

export const getColumns = (onEdit, onDelete, permissions) => [
  {
    id: "srNo",
    header: "SR NO.",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "date",
    header: "DATE",
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => {
      const from = row.original.fromType;
      const to = row.original.toType;
      const type = `${from} → ${to}`;

      const color =
        from === "CASH" && to === "CASH"
          ? "blue"
          : from === "CASH" && to === "BANK"
            ? "green"
            : from === "BANK" && to === "CASH"
              ? "orange"
              : "purple";

      return <Badge color={color} text={type} />;
    },
  },
  {
    accessorKey: "fromAccountName",
    header: "FROM ACCOUNT",
  },
  {
    accessorKey: "toAccountName",
    header: "TO ACCOUNT",
  },
  {
    accessorKey: "notes",
    header: "NOTES",
  },
  {
    accessorKey: "amount",
    header: "AMOUNT",
    cell: ({ row }) => (
      <span className="text-green-600 font-semibold">
        ₹{row.original.amount?.toLocaleString()}
      </span>
    ),
  },
  {
    id: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      const handleDeleteClick = () => {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            onDelete(row.original.id);
          }
        });
      };

      return (
        <div className="flex items-center gap-1">
          {permissions?.edit && (
            <Tooltip title="Edit Transfer">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}

          {permissions?.delete && (
            <Tooltip title="Delete Transfer">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={handleDeleteClick}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
];

export const defaultData = [];
