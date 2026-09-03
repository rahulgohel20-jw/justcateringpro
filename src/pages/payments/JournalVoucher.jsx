import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./journalvoucherconstant";
import {
  getbyjournalvoucherbyuserid,
  deletejournalvoucher,
  genaratepdfjounalvoucher,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Modal, Tooltip } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { usePermission } from "../../hooks/usePermission";
import { FormattedMessage, useIntl } from "react-intl";

const JournalVoucher = () => {
  const intl = useIntl();
  const [tableData, setTableData] = useState([]);
const [searchTerm, setSearchTerm] = useState("");

  const pdfPlugin = defaultLayoutPlugin();

  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const navigate = useNavigate();
   const permissions = usePermission("Journal Voucher");

  const handleCreate = () => {
    navigate("/journal-voucher/add");
  };

  const handleEdit = (rowData) => {
    navigate("/journal-voucher/add", { state: { editData: rowData } });
  };

  const handleDelete = useCallback(async (voucherId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deletejournalvoucher(voucherId);

      await fetchJournalVouchers();

      Swal.fire({
        title: "Deleted!",
        text: "Journal Voucher has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete journal voucher.",
        icon: "error",
      });
    }
  }, []);
const handlePrint = async (voucherId) => {
  try {
    const userId = localStorage.getItem("userId");
    const response = await genaratepdfjounalvoucher(1, userId, voucherId);
    const pdfFileUrl = response?.data?.fileUrl;

    // Fetch the PDF as a blob and create a local object URL
    const blobResponse = await fetch(pdfFileUrl);
    const blob = await blobResponse.blob();
    const objectUrl = URL.createObjectURL(blob);

    setPdfUrl(objectUrl);
    setIsPdfModalVisible(true);
  } catch (error) {
    console.error("Error loading PDF:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load PDF.",
    });
  }
};
const filteredData = tableData.filter((row) => {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;
  return (
    String(row.voucherNo || "").toLowerCase().includes(term) ||
    String(row.voucherdate || "").toLowerCase().includes(term) ||
    String(row.total || "").toLowerCase().includes(term)
  );
});
 const tableColumns = [
    ...columns,
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {permissions.edit && (
            <Tooltip title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => handleEdit(row.original)}
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
                onClick={() => handleDelete(row.original.voucherId)}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
          <Tooltip title="Print">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Print"
              onClick={() => handlePrint(row.original.voucherId)}
            >
              <i className="ki-filled ki-printer text-success"></i>
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const fetchJournalVouchers = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const res = await getbyjournalvoucherbyuserid(userId);

      const vouchers = res?.data?.data || [];

      const data = vouchers.map((item, index) => ({
        srNo: index + 1,
        id: item.id,
        voucherId: item.id,
        voucherNo: item.voucherNo,
        voucherdate: item.voucherDate,
        narration: item.narration,
        userId: item.userId,
        details: item.details || [],
        total:
  item.details
    ?.filter((d) => d.creditDebit === "DR")
    .reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0,
      }));

      setTableData(data);
    } catch (err) {
      console.error("Failed to fetch journal vouchers:", err);
    }
  };

  useEffect(() => {
    fetchJournalVouchers();
  }, []);
  return (
    <Fragment>
      <Container>
        <div className="gap-2 mb-3">
<h1 className="text-3xl font-bold text-[#111827]">
  <FormattedMessage
    id="COMMON.JOURNAL_VOUCHER"
    defaultMessage="Journal Voucher"
  />
</h1>        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between mb-4">
        <div className="filItems relative">
  <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
  <input
    className="input pl-8"
    placeholder="Search"
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>
           {permissions.add && (
       <button
  className="btn btn-primary"
  onClick={handleCreate}
  title={intl.formatMessage({
    id: "COMMON.CREATE",
    defaultMessage: "Create",
  })}
>
  <Plus size={16} />
  <FormattedMessage
    id="COMMON.CREATE"
    defaultMessage="Create"
  />
</button>
           )}
        </div>

      <TableComponent
  columns={tableColumns}
  data={filteredData}   
  paginationSize={10}
/>
        <Modal
          title="Journal Voucher PDF"
          open={isPdfModalVisible}
          onCancel={() => {
            setIsPdfModalVisible(false);
             URL.revokeObjectURL(pdfUrl);
  setPdfUrl("");

          }}
          width="70%"
          footer={null}
        >
          <div style={{ height: "80vh" }}>
            {pdfUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>
      </Container>
    </Fragment>
  );
};

export default JournalVoucher;
