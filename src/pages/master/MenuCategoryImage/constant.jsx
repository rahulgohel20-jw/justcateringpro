import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (
  onEdit,
  onDelete,   
  // onStatus,   // uncomment when status API is ready
  handleView,
  permissions,
) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "imageUrl",   // ✅ was "imagePath"
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
    cell: ({ row }) => {
      return row.original.imageUrl ? (
        <img
          src={row.original.imageUrl}   // ✅ was row.original.imagePath
          alt={row.original.categoryName}
          className="w-16 h-16 object-cover rounded-md border"
        />
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      );
    },
  },
{
  accessorKey: "categoryName",
  header: (
    <FormattedMessage
      id="CATEGORY_IMAGE.CATEGORY_NAME"
      defaultMessage="Category Name"
    />
  ),
},

{
  accessorKey: "isCatImg",
  header: (
    <FormattedMessage
      id="CATEGORY_IMAGE.CATEGORY_TYPE"
      defaultMessage="Category Type"
    />
  ),
  cell: ({ row }) => (
    <span
      className={`badge badge-sm ${
        row.original.isCatImg ? "badge-success" : "badge-primary"
      }`}
    >
      {row.original.isCatImg ? (
        <FormattedMessage
          id="CATEGORY_IMAGE.CATEGORY_IMAGE"
          defaultMessage="Category Image"
        />
      ) : (
        <FormattedMessage
          id="CATEGORY_IMAGE.BACKGROUND_IMAGE"
          defaultMessage="Background Image"
        />
      )}
    </span>
  ),
},
  
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
    cell: ({ row }) => (
  <div className="flex items-center gap-1">
    <Tooltip className="cursor-pointer" title="View">
      <button
        className="btn btn-sm btn-icon btn-clear"
        onClick={() => handleView(row.original)}
      >
        <i className="ki-filled ki-eye text-success"></i>
      </button>
    </Tooltip>

    <Tooltip className="cursor-pointer" title="Edit">
      <button
        className="btn btn-sm btn-icon btn-clear"
        onClick={() => onEdit(row.original)}
      >
        <i className="ki-filled ki-notepad-edit text-primary"></i>
      </button>
    </Tooltip>

    <Tooltip className="cursor-pointer" title="Delete">
      <button
        className="btn btn-sm btn-icon btn-clear"
        onClick={() => onDelete(row.original.id)}  
      >
        <i className="ki-filled ki-trash text-danger"></i>
      </button>
    </Tooltip>
  </div>
),
  },
];