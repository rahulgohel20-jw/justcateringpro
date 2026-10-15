import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

const getLogo = (item) =>
  item?.logo || item?.logoPath || item?.profilePic || item?.imagePath || "";

export const columns = (onEdit, onUploadLogo, permissions, uploading) => [
  {
    accessorKey: "logo",
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Profile Pic" />,
    cell: ({ row }) => {
      const src = getLogo(row.original);
      return src ? (
        <img
          src={src}
          alt={row.original.companyName}
          className="w-16 h-16 object-cover rounded-full border"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">
          No img
        </div>
      );
    },
  },
  {
    accessorKey: "companyName",
    header: (
      <FormattedMessage id="DECOR_PROFILE.COMPANY_NAME" defaultMessage="Company Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.companyName || "-"}</span>
    ),
  },
  {
    accessorKey: "companyEmail",
    header: (
      <FormattedMessage id="DECOR_PROFILE.COMPANY_EMAIL" defaultMessage="Company Email" />
    ),
  },
  {
    accessorKey: "officeNo",
    header: (
      <FormattedMessage id="DECOR_PROFILE.OFFICE_NO" defaultMessage="Office No." />
    ),
    cell: ({ row }) =>
      row.original.officeNo
        ? `${row.original.countryCode || ""} ${row.original.officeNo}`.trim()
        : "-",
  },
  {
    accessorKey: "gstNumber",
    header: (
      <FormattedMessage id="DECOR_PROFILE.GST_NUMBER" defaultMessage="GST No." />
    ),
  },
  {
    accessorKey: "panNumber",
    header: (
      <FormattedMessage id="DECOR_PROFILE.PAN_NUMBER" defaultMessage="PAN No." />
    ),
  },
  {
    accessorKey: "cinNumber",
    header: (
      <FormattedMessage id="DECOR_PROFILE.CIN_NUMBER" defaultMessage="CIN No." />
    ),
  },
  {
    accessorKey: "hsnNumber",
    header: (
      <FormattedMessage id="DECOR_PROFILE.HSN_NUMBER" defaultMessage="HSN No." />
    ),
  },
  {
    accessorKey: "address",
    header: (
      <FormattedMessage id="DECOR_PROFILE.ADDRESS" defaultMessage="Address" />
    ),
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[220px]">
        {row.original.address || "-"}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {permissions.edit && (
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}
        {permissions.edit && (
          <Tooltip title="Upload profile pic">
            <button
              className="btn btn-sm btn-icon btn-clear disabled:opacity-50"
              title="Upload profile pic"
              disabled={uploading}
              onClick={onUploadLogo}
            >
              <i className="ki-filled ki-picture text-primary"></i>
            </button>
          </Tooltip>
        )}
      </div>
    ),
  },
];