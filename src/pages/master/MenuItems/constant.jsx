import { Tooltip, Popconfirm, message } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onstatus, onVideo) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[6%]",
      cellClassName: "w-[6%]",
    },
  },
  {
    accessorKey: "image",
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />,
    cell: ({ row }) => {
      const handleSelectFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Call upload function coming from row
        row.original.uploadImage(row.original.id, file);
      };

      return (
        <div className="relative w-20 h-20 group">
          <img
            src={row.original.image || "/no-image.png"}
            alt="Image"
            className="w-16 h-16 object-cover rounded-md border"
          />

          <label className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-all">
            <i className="ki-filled ki-cloud-add text-white text-xs"></i>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectFile}
            />
          </label>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  {
    accessorKey: "name",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "category",
    header: (
      <FormattedMessage
        id="MASTER.MENU_ITEM_CATEGORY"
        defaultMessage=" Category"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "subCategory",
    header: (
      <FormattedMessage
        id="MASTER.MENU_ITEM_SUBCATEGORY"
        defaultMessage="  Sub Category"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "cost",
    header: (
      <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Price (100 Pax)" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "sequence",
    header: <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Sequence" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "status",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <Popconfirm
          title={`Are you sure you want to ${
            row.original.status ? "Deactivate" : "Activate"
          } this menu item?`}
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            onstatus(row.original.id, row.original.status);
            message.success("✅ Status updated successfully!");
          }}
        >
          <div className="flex items-center gap-1 cursor-pointer">
            <label className="switch switch-lg">
              <input type="checkbox" checked={row.original.status} readOnly />
            </label>
          </div>
        </Popconfirm>
      );
    },

    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
 {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Tooltip title="Edit Contact">
          <button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}>
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
        </Tooltip>

        {row.original.video && (
          <Tooltip title="Watch Video">
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onVideo(row.original.video)}>
              <i className="ki-filled ki-youtube text-danger"></i>
            </button>
          </Tooltip>
        )}

        <Tooltip title="Delete">
          <button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.id)}>
            <i className="ki-filled ki-trash text-danger"></i>
          </button>
        </Tooltip>
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];

export const categoryData = [];

export const defaultData = [];
