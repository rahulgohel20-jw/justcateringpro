import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { GetAllDailyStockManage } from "../../../services/apiServices";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    DRAFT:     "bg-gray-50 text-gray-600 border-gray-200",
  };
  const cls = styles[status] ?? "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status || "—"}
    </span>
  );
};

// ── Columns ───────────────────────────────────────────────────────────────────
const columns = (onView,permission) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%] text-gray-500 font-medium",
    },
  },
  {
    accessorKey: "voucherNo",
    header: <FormattedMessage id="DSM.VOUCHER_NO" defaultMessage="Voucher No" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gray-800 font-semibold">
        {row.original.voucherNo || `DSM-${String(row.original.id).padStart(4, "0")}`}
      </span>
    ),
    meta: { headerClassName: "w-[30%]", cellClassName: "w-[30%]" },
  },
  {
    accessorKey: "manageDate",
    header: <FormattedMessage id="DSM.DATE" defaultMessage="Manage Date" />,
    cell: ({ row }) => {
      
      return <span className="text-sm text-gray-600">{row.original.manageDate}</span>;
    },
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  
 ...(permission?.view ? [{
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <button
        onClick={() => onView?.(row.original)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
        style={{ background: "linear-gradient(135deg,#0284c7,#0369a1)" }}
      >
        <i className="ki-filled ki-eye text-xs" />
        VIEW
      </button>
    ),
    meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
  }] : []),
];

// ── Page ──────────────────────────────────────────────────────────────────────
const DailyStockManage = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [tableData, setTableData]       = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading]           = useState(false);

  const userId   = localStorage.getItem("userId");
  const navigate = useNavigate();
  const intl     = useIntl();

  const permission = usePermission("Daily Stock Manage")

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res  = await GetAllDailyStockManage(userId);
      const data = (res?.data?.data || []).map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setTableData(data);
      setOriginalData(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load daily stock records.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setTableData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q.toLowerCase())
        )
      );
      setTableData(filtered.map((item, i) => ({ ...item, sr_no: i + 1 })));
    }
  };

 const handleView = (item) => {
  navigate(`/stock-management/daily-stock/add/${item.id}`);
};

  const handleAdd = () => {
    navigate("/stock-management/daily-stock/add");
  };

  return (
    <Fragment>
      <Container>

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pb-2 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <FormattedMessage
                id="USER.DAILY_STOCK_MANAGE.TITLE"
                defaultMessage="Physical Stock Management"
              />
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track daily physical movements, wastage and actual stock
            </p>
          </div>
            {permission.add && (
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#005BA8] hover:bg-[#004a8c] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            onClick={handleAdd}
          >
            <i className="ki-filled ki-plus text-base" />
            <FormattedMessage
              id="USER.DAILY_STOCK_MANAGE.ADD"
              defaultMessage="Add Physical Stock"
            />
          </button>
            )}
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={intl.formatMessage({
                id: "USER.DAILY_STOCK_MANAGE.SEARCH",
                defaultMessage: "Search by voucher number, date…",
              })}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
            />
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-[#005BA8] hover:text-[#005BA8] transition"
          >
            <i className="ki-filled ki-arrows-circle text-sm" />
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <TableComponent
            columns={columns(handleView,permission)}
            data={tableData}
            paginationSize={10}
            loading={loading}
          />
        </div>

      </Container>
    </Fragment>
  );
};

export default DailyStockManage;