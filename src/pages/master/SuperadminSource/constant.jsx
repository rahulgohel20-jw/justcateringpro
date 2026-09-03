import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import Swal from "sweetalert2";

export const columns = (handleDelete, handleEdit) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    meta: {
      headerClassName: "w-[6%]",
      cellClassName: "w-[6%]",
    },
  },
  {
    accessorKey: "SourceName",
    header: (
      <FormattedMessage
        id="USER.MASTER.COUPON_CODE"
        defaultMessage="Source Name"
      />
    ),
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "action",
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
            handleDelete(row.original.leadSourceId);
          }
        });
      };

      return (
        <div className="flex items-center gap-1">
          <Tooltip className="cursor-pointer" title="Edit Source">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => handleEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip title="Delete Source">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={handleDeleteClick}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
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
