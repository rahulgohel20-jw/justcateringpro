import { Fragment, useEffect, useState, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import CreateBankPayment from "./CreateBankPayment";
import { columns } from "./constant";
import { Getpaymentvendordata, DeletePayments , pdffordebitpaymentinaccount  } from "@/services/apiServices";
import Swal from "sweetalert2";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
import { DataGridColumnHeader } from "@/components";
import { usePermission } from "../../hooks/usePermission";
import { FormattedMessage, useIntl } from "react-intl";

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const ExportPdfModal = ({ isOpen, onClose }) => {
  const [isCompanyDetails, setIsCompanyDetails] = useState(true);
  const [isPayable, setIsPayable] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

 const handleExport = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem("userId");
    const res = await pdffordebitpaymentinaccount(
      isCompanyDetails ? 1 : 0,
      isPayable ? 1 : 0,
      userId
    );

    const fileUrl = res?.data?.url;
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      Swal.fire({
        title: "No file returned",
        text: "The report didn't return a downloadable file.",
        icon: "warning",
      });
    }

    onClose();
  } catch (err) {
    console.error("Export PDF failed:", err);
    Swal.fire({
      title: "Error!",
      text: "Failed to generate PDF. Please try again.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
        <h2 className="text-lg font-semibold text-[#111827] mb-1">
          Export PDF
        </h2>
        <p className="text-sm text-gray-500 mb-2">
          Choose what to include in the report.
        </p>

        <div className="divide-y divide-gray-100">
          <Toggle
            checked={isCompanyDetails}
            onChange={setIsCompanyDetails}
            label="Company Details"
          />
          {/* <Toggle
            checked={isPayable}
            onChange={setIsPayable}
            label="Payable"
          /> */}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn btn-light"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
};


const BankPayment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const permissions = usePermission("Debit"); 
    const [searchTerm, setSearchTerm] = useState("");
const [isExportModalOpen, setIsExportModalOpen] = useState(false);   
  const filteredData = tableData.filter((row) =>
    (row.accountname || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalOpen = (rowData = null) => {
    setEditData(rowData);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (paymentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await DeletePayments(paymentId);
      setTableData((prev) => prev.filter((row) => row.paymentId !== paymentId));

      Swal.fire({
        title: "Deleted!",
        text: "Receipt has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the receipt. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  }, []);

 const tableColumns = [
    ...columns,
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {permissions.edit && (
            <Tooltip title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => handleModalOpen(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
          {permissions.delete && (
            <Tooltip title="Delete">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => handleDelete(row.original.paymentId)}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const fetchPayment = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await Getpaymentvendordata(-1, true, userId, -1);
      const payments = res.data.data.payments;
      

const data = payments
  .map((item, index) => ({
    id: index + 1,
    mainId: item.id,
    paymentId: item.id,
    bankname: item.bankName,
    cashname: item.cashName, 
      cashId: item.cashId,
    bankId: item.bankId,
    voucherdate: item.date,
    voucherno: item.invoiceCode,
    total: item.payAmount,
    modeofpayment: item.payMode,
    settlementAmount: item.settlementAmount,
    accountname: item.vendorName,
    vendorId: item.vendorId,
    eventId: item.eventId,
    referenceId: item.referenceId,
    remarks: item.remarks,
    vendorCat: item.vendorCat,
  }))
  .reverse();

setTableData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, []);

  return (
    <Fragment>
      <Container>
        <div className="gap-2 mb-3">
<h1 className="text-3xl font-bold text-[#111827]">
  <FormattedMessage
    id="COMMON.PAYMENTS"
    defaultMessage="Payments"
  />
</h1>        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between mb-4">
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
            <input className="input pl-8" placeholder="Search" type="text"
              value={searchTerm}                               
              onChange={(e) => setSearchTerm(e.target.value)}  />
          </div>
        <div className="flex items-center gap-3">
  {permissions.add && (
    <>
      <button
  className="btn btn-danger"
  onClick={() => setIsExportModalOpen(true)}
  title="Export PDF"
>
  <i className="ki-filled ki-file-down me-1"></i>
  <FormattedMessage
    id="COMMON.EXPORT_PDF"
    defaultMessage="Export PDF"
  />
</button>
<button
  className="btn btn-primary"
  onClick={() => handleModalOpen(null)}
  title="Create"
>
  <i className="ki-filled ki-plus me-1"></i>
  <FormattedMessage
    id="COMMON.CREATE"
    defaultMessage="Create"
  />
</button>
    </>
  )}
</div>
        </div>

        <TableComponent
          columns={tableColumns}
          data={filteredData}
          paginationSize={10}
        />
      </Container>

      <CreateBankPayment
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={fetchPayment}
        editData={editData}
      />
       <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </Fragment>
  );
};

export default BankPayment;
