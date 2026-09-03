import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Swal from "sweetalert2";
import {
  GetAllSupllierVendors,
  AddReturnSOT,
  AddLogs,
  sotidbygetbyid,
} from "@/services/apiServices";
import { Save } from "lucide-react";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};

const ReturnSOT = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only need the id from navigation now — full data is fetched fresh below
  const navData = location.state?.data || location.state?.editData || {};
  const sotId = navData?.id;

  const [poData, setPoData] = useState(navData);
  const [allRows, setAllRows] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const userId = localStorage.getItem("userId");

  const sendLog = async (status, rows = []) => {
    try {
      const sotNo = poData?.sotNo || "-";
      const eventName = poData?.eventName || "-";
      const eventId = poData?.eventId || 0;
      const totalItems = rows.length;
      const totalReturnQty = rows.reduce(
        (sum, r) => sum + (Number(r.returnQty) || 0),
        0,
      );
      const itemsWithReturns = rows.filter((r) => Number(r.returnQty) > 0);
      const namesPreview =
        itemsWithReturns.length > 0
          ? itemsWithReturns
              .slice(0, 5)
              .map((r) => `${r.itemName}(x${r.returnQty})`)
              .join(", ") +
            (itemsWithReturns.length > 5
              ? ` +${itemsWithReturns.length - 5} more`
              : "")
          : "N/A";

      const description =
        status === "RETURN_SUCCESS"
          ? `SOT Returned — SOT No: ${sotNo} | Event: ${eventName} (ID: ${eventId}) | ` +
            `Items Returned: ${itemsWithReturns.length}/${totalItems} | Total Return Qty: ${totalReturnQty} | ` +
            `Items: ${namesPreview} | Returned By: ${getUserEmail() || "Unknown User"}`
          : `SOT Return FAILED — SOT No: ${sotNo} | Event: ${eventName} (ID: ${eventId}) | ` +
            `Attempted By: ${getUserEmail() || "Unknown User"}`;

      await AddLogs({
        description,
        eventType:
          status === "RETURN_SUCCESS" ? "SOT_Return_Success" : "SOT_Return_Error",
        id: 0,
        eventId: Number(eventId) || 0,
        user: getUserEmail(),
      });
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  };

  // Build rows + category tabs from a SOT's details array
  const buildFromDetails = useCallback((data) => {
    if (!data?.details?.length) {
      setAllRows([]);
      setTabs([]);
      setActiveTab(null);
      return;
    }

    const rows = data.details.map((d, i) => ({
      id: i + 1,
      detailId: d.id,
      rawMaterialId: d.rawMaterialId,
      itemName: d.rawMaterialName,
      catId: d.rawMaterialCatId,
      categoryName: d.rawMaterialCatName,
      supplierId: d.partyId || "",
      supplierName: d.partyName || "",
      unitId: d.unitId,
      qty: d.qty,
      acceptedQty: d.acceptedQty,
      returnQty: d.returnQty ?? 0,
      unit: d.unitName,
      availableStock: d.availableStock,
    }));

    setAllRows(rows);

    const seen = new Map();
    data.details.forEach((d) => {
      if (!seen.has(d.rawMaterialCatId))
        seen.set(d.rawMaterialCatId, d.rawMaterialCatName);
    });

    const tabList = Array.from(seen.entries()).map(([catId, catName]) => ({
      catId,
      catName,
    }));

    setTabs(tabList);
    setActiveTab(tabList[0]?.catId ?? null);
  }, []);

  const fetchSotById = useCallback(async (id) => {
    setPageLoading(true);
    try {
      const res = await sotidbygetbyid(id);
      if (res?.data?.success && res?.data?.data) {
        setPoData(res.data.data);
        buildFromDetails(res.data.data);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to fetch SOT details.",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      console.error("fetchSotById failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch SOT details. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setPageLoading(false);
    }
  }, [buildFromDetails]);

  useEffect(() => {
    if (sotId) {
      fetchSotById(sotId);
    } else if (navData?.details?.length) {
      buildFromDetails(navData);
    }

    fetchAgencies();
  }, [sotId]);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await GetAllSupllierVendors(userId);
      setAgencies(res?.data?.data?.["Party Details"] || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (detailId, field, value) => {
    setAllRows((prev) =>
      prev.map((row) =>
        row.detailId === detailId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        sotId: poData.id,
        userId: Number(userId),
        details: allRows.map((row) => ({
          sotDetailId: row.detailId,
          returnQty: Number(row.returnQty ?? 0),
        })),
      };

      await AddReturnSOT(payload);

      await sendLog("RETURN_SUCCESS", allRows);

      Swal.fire({
        icon: "success",
        title: "Returned!",
        text: "SOT returned successfully.",
        confirmButtonColor: "#16a34a",
      }).then(() => navigate(-1));
    } catch (e) {
      console.error("AddReturnSOT failed:", e?.response?.data || e?.message || e);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.response?.data?.message || "Failed to return. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTabRows = () => allRows.filter((r) => r.catId === activeTab);

  const getFilteredRows = () =>
    getTabRows().filter((r) =>
      r.itemName?.toLowerCase().includes(search.toLowerCase())
    );

  const activeTabName = tabs.find((t) => t.catId === activeTab)?.catName ?? "";

  if (pageLoading) {
    return (
      <Fragment>
        <Container>
          <div className="flex items-center justify-center py-24">
            <Spin size="large" />
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        {/* ── Page Header ── */}
        <div className="bg-white border rounded-xl shadow-sm mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b">
            {[
              { label: "SOT No", value: poData?.sotNo },
              { label: "Event Name", value: poData?.eventName },
              { label: "Event ID", value: poData?.eventId },
              { label: "Status", value: poData?.status },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-5 py-3 border-b bg-gray-50">
            {[
              {
                label: "Created At",
                value: poData?.createdAt
                  ? new Date(poData.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—",
              },
              { label: "Total Items", value: poData?.details?.length ?? 0 },
              { label: "Total Categories", value: tabs.length },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-5 py-3">
            <p className="text-sm text-gray-500">
              Enter return quantities for each item before submitting.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-[#005BA8] hover:bg-[#004a8c] disabled:opacity-60 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {isSaving ? <Spin size="small" /> : <Save size={16} />}
                Return SOT
              </button>
            </div>
          </div>
        </div>

        {/* ── Category Tabs ── */}
        {loading ? (
          <div className="flex items-center gap-2 mb-4">
            <Spin size="small" />
            <span className="text-sm text-gray-500">Loading…</span>
          </div>
        ) : (
          <div className="flex gap-2 mb-4 flex-wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.catId;
              const itemCount = allRows.filter((r) => r.catId === tab.catId).length;
              return (
                <button
                  key={tab.catId}
                  onClick={() => {
                    setActiveTab(tab.catId);
                    setSearch("");
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#005BA8] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#005BA8] hover:text-[#005BA8]"
                  }`}
                >
                  {tab.catName}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Search + Tab Label ── */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            {activeTabName}
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({getTabRows().length} items)
            </span>
          </p>

          <div className="relative max-w-xs w-full">
            <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search items in this category…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <TableComponent
            columns={columns(handleChange, agencies)}
            data={getFilteredRows()}
            paginationSize={10}
            loading={loading}
          />
        </div>
      </Container>
    </Fragment>
  );
};

export default ReturnSOT;