import { Switch, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { Select } from "antd";

export const columns = (
  handleEditRow,
  handleDeleteRow,
  selectionHandlers = {},
  godownOptions = [],
  onVenueChange = () => {},
  onVisibleChange = () => {},
  showVisibleColumn = true,
) => {
  const {
    onSelectAll = () => {},
    onRowSelect = () => {},
    isRowSelected = () => false,
    isAllSelected = false,
  } = selectionHandlers;

  const baseColumns = [
    {
      accessorKey: "select",
      header: () => (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={isRowSelected(row.original)}
          onChange={(e) => onRowSelect(row.original, e.target.checked)}
          className="cursor-pointer"
        />
      ),
      meta: {
        headerClassName: "w-[4%]",
        cellClassName: "w-[4%]",
      },
    },
    {
      accessorKey: "sr_no",
      header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
      meta: {
        headerClassName: "w-[4%]",
        cellClassName: "w-[4%]",
      },
    },
    {
      accessorKey: "category",
      header: (
        <FormattedMessage id="COMMON.CATEGORY" defaultMessage="Category" />
      ),
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
      accessorKey: "weight",
      header: (
        <FormattedMessage
          id="MASTER.MENU_ITEM_WEIGHT"
          defaultMessage="Weight"
        />
      ),
      meta: {
        headerClassName: "w-[8%]",
        cellClassName: "w-[8%]",
      },
    },
    {
      accessorKey: "unit",
      header: <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />,
      meta: {
        headerClassName: "w-[8%]",
        cellClassName: "w-[8%]",
      },
    },
    {
      accessorKey: "rate",
      header: <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />,
      meta: {
        headerClassName: "w-[8%]",
        cellClassName: "w-[8%]",
      },
    },
    {
      accessorKey: "venue",
      header: <FormattedMessage id="COMMON.VENUE" defaultMessage="Venue" />,
      cell: ({ row }) => {
        const venueId = row.original.venueId;
        const isLoadingGodowns = godownOptions.length === 0;
        const normalizedId =
          venueId === null || venueId === undefined ? 0 : Number(venueId);

        return (
          <Select
            placeholder={isLoadingGodowns ? "Loading..." : "Select Venue"}
            className="w-full"
            value={isLoadingGodowns ? undefined : normalizedId}
            options={godownOptions}
            loading={isLoadingGodowns}
            onChange={(value, option) => {
              const resolvedId =
                value === null || value === undefined ? 0 : Number(value);
              const resolvedName =
                resolvedId === 0 ? "At Venue" : (option?.label ?? "");
              onVenueChange(row.original.sr_no, resolvedId, resolvedName);
            }}
            size="small"
          />
        );
      },
      meta: {
        headerClassName: "w-[12%]",
        cellClassName: "w-[12%]",
      },
    },
  ];

  if (showVisibleColumn) {
    baseColumns.push({
      accessorKey: "isVisible",
      header: (
        <FormattedMessage id="COMMON.VISIBLE" defaultMessage="Visible" />
      ),
      cell: ({ row }) => {
        const rowData = row.original;
        const checked = rowData.isVisible !== false; // default true if undefined
        return (
          <Tooltip title={checked ? "Visible" : "Hidden"}>
            <Switch
              size="small"
              checked={checked}
              onChange={(val) => onVisibleChange(rowData.sr_no, val)}
            />
          </Tooltip>
        );
      },
      meta: {
        headerClassName: "w-[8%]",
        cellClassName: "w-[8%]",
      },
    });
  }

  baseColumns.push({
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit" className="cursor-pointer">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => handleEditRow(rowData)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => handleDeleteRow(rowData)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  });

  return baseColumns;
};

export const defaultData = [];