import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onStatus) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "contact_type",
    header: (
      <FormattedMessage
        id="USER.MASTER.CONTACT_TYPE"
        defaultMessage="Contact Type"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center  gap-1">
          <Popconfirm
            title="Are you sure to change this status?"
            onConfirm={() =>
              onStatus(
                row.original.contacttypeid,
                row.original.isActive ? false : true
              )
            }
            onCancel={() => console.log("Cancelled")}
            okText="Yes"
            cancelText="No"
          >
            <label className="switch switch-lg">
              <input
                type="checkbox"
                value="1"
                name="check"
                defaultChecked={row.original.isActive}
                readOnly
                checked={row.original.isActive}
              />
            </label>
          </Popconfirm>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];

export const defaultData = [
  { sr_no: 1, contact_name: "Friend" },
  { sr_no: 2, contact_name: "Colleague" },
  { sr_no: 3, contact_name: "Relative" },
  { sr_no: 4, contact_name: "Business Manager" },
  { sr_no: 5, contact_name: "Friend" },
  { sr_no: 6, contact_name: "Friend" },
  { sr_no: 7, contact_name: "Colleague" },
  { sr_no: 8, contact_name: "Sales Man" },
];
