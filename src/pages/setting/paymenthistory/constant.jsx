import { useMemo } from "react";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const usePaymentColumns = (onEdit, onDelete, lang) => {
  const getStatusColor = (status) =>
    status === "Success" ? "text-green-600" : "text-red-600";

  return useMemo(
    () => [
      {
        accessorKey: "PaymentID",
        header: (
          <FormattedMessage
            id="COMMON.PAYMENT_ID"
            defaultMessage="Payment ID"
          />
        ),
        meta: { headerClassName: "w-[6%]", cellClassName: "w-[6%]" },
      },
      {
        accessorKey: "Name",
        header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
        meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
        cell: ({ row }) => {
          const { nameEnglish, nameHindi, nameGujarati } = row.original;
          switch (lang) {
            case "hi":
              return nameHindi || nameEnglish || "-";
            case "gu":
              return nameGujarati || nameEnglish || "-";
            default:
              return nameEnglish || "-";
          }
        },
      },
      {
        accessorKey: "Subscription",
        header: (
          <FormattedMessage
            id="COMMON.SUBSCRIPTION"
            defaultMessage="Subscription"
          />
        ),
        meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
      },
      {
        accessorKey: "Date",
        header: <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />,
        meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
      },
      {
        accessorKey: "Amount",
        header: <FormattedMessage id="COMMON.AMOUNT" defaultMessage="Amount" />,
        meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
      },
      {
        accessorKey: "PaymentType",
        header: (
          <FormattedMessage
            id="COMMON.PAYMENT_TYPE"
            defaultMessage="Payment Type"
          />
        ),
        meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
      },
      {
        accessorKey: "Status",
        header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
        cell: ({ row }) => (
          <span className={getStatusColor(row.original.Status)}>
            {row.original.Status}
          </span>
        ),
        meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
      },
    ],
    [onEdit, onDelete, lang]
  );
};
