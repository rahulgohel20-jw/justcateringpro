import { Table, Input, Button, DatePicker } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FormattedMessage, useIntl } from "react-intl";

dayjs.extend(customParseFormat);

const ItemTable = ({ rows, onInputChange, onAddRow, onDeleteRow, isOfferRateUser = false, onRateBlur = () => {} , hideTaxColumns = false, }) => {
  const parseDateValue = (dateValue) => {
    if (!dateValue) return null;

    let parsed = dayjs(dateValue);
    if (parsed.isValid()) {
      return parsed;
    }

    parsed = dayjs(dateValue, "DD-MM-YYYY HH:mm", true);
    if (parsed.isValid()) {
      return parsed;
    }

    parsed = dayjs(dateValue, "DD-MM-YYYY", true);
    if (parsed.isValid()) {
      return parsed;
    }

    parsed = dayjs(dateValue, "YYYY-MM-DD HH:mm:ss", true);
    if (parsed.isValid()) {
      return parsed;
    }

    parsed = dayjs(dateValue, "YYYY-MM-DD", true);
    if (parsed.isValid()) {
      return parsed;
    }

    console.log("❌ Could not parse date:", dateValue);
    return null;
  };

  const intl = useIntl();

  const columns = [
    {
      title: (
        <FormattedMessage id="COMMON.FUNCTION" defaultMessage="Function" />
      ),
      dataIndex: "name",
      render: (text, record, index) => (
        <Input
          placeholder={intl.formatMessage({
            id: "COMMON.NAME",
            defaultMessage: "Name",
          })}
          value={record.name}
          disabled={!record.isCustom && !record.isNewRow}
          onChange={(e) => onInputChange(index, "name", e.target.value)}
          className="border-none shadow-none"
        />
      ),
    },
    {
      title: (
        <FormattedMessage
          id="COMMON.DATE_AND_TIME"
          defaultMessage="Date & Time"
        />
      ),
      dataIndex: "date",
      render: (text, record, index) => {
        const dateValue = parseDateValue(record.date);

        return (
          <DatePicker
            showTime={{
              use12Hours: true,
              format: "hh:mm A",
            }}
            format="DD-MM-YYYY hh:mm A"
            disabled={!record.isCustom && !record.isNewRow}
            value={dateValue}
            onChange={(date) =>
              onInputChange(index, "date", date ? date.toISOString() : "")
            }
            className="w-full"
          />
        );
      },
    },
    {
      title: <FormattedMessage id="COMMON.PERSON" defaultMessage="Person" />,
      dataIndex: "person",
      render: (text, record, index) => (
        <Input
          type="tel"
          value={record.person}
          onChange={(e) => onInputChange(index, "person", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
    {
      title: <FormattedMessage id="COMMON.EXTRA" defaultMessage="Extra" />,
      dataIndex: "extra",
      render: (text, record, index) => {
        // ✅ Hide Extra field ONLY for new rows (before save)
        if (record.isNewRow) {
          return <span className="text-gray-400 text-center">-</span>;
        }

        // ✅ Show Extra field for all other rows (saved custom rows, event function rows)
        return (
          <Input
            type="tel"
            value={record.extra}
            disabled={false}
            onChange={(e) => onInputChange(index, "extra", e.target.value)}
            className="text-center border-none shadow-none"
          />
        );
      },
    },
     ...(isOfferRateUser
      ? [
          {
            title: <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />,
            dataIndex: "offeredRate",
            render: (text, record, index) => (
              <Input
                type="tel"
                readOnly
                value={record.offeredRate}
                disabled={false}
                onChange={(e) =>
                  onInputChange(index, "offeredRate", e.target.value)
                }
                className="text-center border-none shadow-none"
              />
            ),
          },
        ]
      : []),
    {
      title: isOfferRateUser ? (
        <FormattedMessage id="COMMON.OFFER_RATE" defaultMessage="Offer Rate" />
      ) : (
        <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />
      ),
      dataIndex: "rate",
      render: (text, record, index) => (
        <Input
          type="tel"
                onBlur={() => onRateBlur(index)}

          value={record.rate}
          disabled={false}
          onChange={(e) => onInputChange(index, "rate", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
   ...(!hideTaxColumns
      ? [ {
      title: <FormattedMessage id="COMMON.TAX_PERCENT" defaultMessage="Tax %" />,
      dataIndex: "extraTaxPct",
      render: (text, record, index) => (
        <Input
          type="tel"
          min="0"
          max="100"
          value={record.extraTaxPct ?? "0"}
          disabled={false}
          onChange={(e) => onInputChange(index, "extraTaxPct", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
    {
      title: (
        <FormattedMessage
          id="COMMON.EXTRA_AMOUNT"
          defaultMessage="Extra Amount (₹)"
        />
      ),
      dataIndex: "taxRate",
      render: (text, record, index) => (
        <Input
          type="tel"
          min="0"
          value={record.taxRate ?? "0"}
          disabled={false}
          onChange={(e) => onInputChange(index, "taxRate", e.target.value)}
          className="text-center border-none shadow-none"
        />
      ),
    },
     ]   : []),
    {
      title: <FormattedMessage id="COMMON.AMOUNT" defaultMessage="Amount" />,
      dataIndex: "amount",
    render: (_, record) => {
  const amount = Number(record.amount) || 0;
  return amount.toFixed(1);
},
    },
    {
      title: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
      key: "actions",
      render: (_, record) =>
        record.isCustom || record.isNewRow ? (
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-500" />}
            onClick={() => onDeleteRow(record.key)}
          />
        ) : null,
    },
  ];

  return (
    <div className="min-w-full mb-7">
      <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
        <FormattedMessage
          id="COMMON.FUNCTION_TABLE"
          defaultMessage="Function "
        />
      </h4>
      <Table
        dataSource={rows}
        columns={columns}
        pagination={false}
        bordered
        className="[&_.ant-table-thead>tr>th]:bg-white [&_.ant-table-cell]:text-center"
      />
      <div className="flex items-start mt-3">
        <button
          className="btn btn-sm btn-primary"
          onClick={onAddRow}
          title={intl.formatMessage({
            id: "COMMON.ADD_NEW_ROW",
            defaultMessage: "Add New Row",
          })}
        >
          <i className="ki-filled ki-plus"></i>{" "}
          <FormattedMessage
            id="COMMON.ADD_NEW_ROW"
            defaultMessage="Add New Row"
          />
        </button>
      </div>
    </div>
  );
};

export default ItemTable;