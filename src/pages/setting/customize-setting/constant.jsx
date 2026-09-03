import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "type",
    header: <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "billing_cycle",
    header: <FormattedMessage id="COMMON.BILLING_CYCLE" defaultMessage="Billing Cycle" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
  accessorKey: "status",
  header: <FormattedMessage id="SETTING.STATUS" defaultMessage="Status" />,
  cell: ({ getValue }) => {
    const value = getValue();
    return (
      <span className={value === "Active" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
        {value}
      </span>
    );
  },
  meta: {
    headerClassName: "w-[8%]",
    cellClassName: "w-[8%]",
  },
},

  {
    accessorKey: "start_date",
    header: <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_START_DATE" defaultMessage="Start Date" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "end_date",
    header: <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_END_DATE" defaultMessage="End Date" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];

export const defaultData = [];
