import { DataGridColumnHeader } from "@/components";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
export const columns = [
  {
    accessorKey: "voucherno",
    header: ({ column }) => (
      <DataGridColumnHeader title="Voucher No" column={column} />
    ),
  },
  {
    accessorKey: "voucherdate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Voucher Date" column={column} />
    ),
  },
  {
    accessorKey: "bankname",
    header: ({ column }) => (
      <DataGridColumnHeader title="Bank Name" column={column} />
    ),
  },
  {
    accessorKey: "accountname",
    header: ({ column }) => (
      <DataGridColumnHeader title="Account Name" column={column} />
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total" column={column} />
    ),
  },
  {
    accessorKey: "transno",
    header: ({ column }) => (
      <DataGridColumnHeader title="Trans No" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Print">
            <Link to="/companydetails">
              <button className="btn btn-sm btn-icon btn-clear" title="View">
                <i className="ki-filled ki-printer text-success"></i>
              </button>
            </Link>
          </Tooltip>
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => cell.row.original.handleModalOpen()}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button className="btn btn-sm btn-icon btn-clear" title="Delete">
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
export const defaultData = [
  {
    id: 1,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 2,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 3,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 4,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 5,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 6,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
  {
    id: 7,
    voucherno: "BP0011",
    voucherdate: "22106/26",
    bankname: "HDFC",
    accountname: "Gopal Caterers",
    total: 1500,
    transno: "545829583451-EPAYMENT",
  },
];
