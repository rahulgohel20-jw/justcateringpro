// AcceptMultipleSOT.jsx
import { Fragment, useState, useEffect, useMemo } from "react";
import { Container } from "@/components/container";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { ChevronDown, ChevronRight, Save , Trash} from "lucide-react";
import Swal from "sweetalert2";
import { addUpdateMultipleSotData, GetAllSupllierVendors , deleteSotDetails , AddLogs   } from "@/services/apiServices";

const UNIT_TO_GRAMS = {
  GM: 1,
  GRAM: 1,

  KG: 1000,
  KILO: 1000,

  MG: 0.001,
  MILLIGRAM: 0.001,
};
const toBaseUnit = (value, unit) => {
  const factor = UNIT_TO_GRAMS[unit?.toUpperCase()] ?? 1;
  return (Number(value) || 0) * factor;
};

const fromBaseUnit = (value, unit) => {
  const factor = UNIT_TO_GRAMS[unit?.toUpperCase()] ?? 1;
  return factor ? value / factor : value;
};

const AcceptMultipleSOT = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const apiResponse = location.state?.data || [];
  const sotIds      = location.state?.sotIds || [];

  const [allRows, setAllRows]           = useState([]);
  const [agencies, setAgencies]         = useState([]);
  const [tabs, setTabs]                 = useState([]);
  const [activeTab, setActiveTab]       = useState(null);
  const [search, setSearch]             = useState("");
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const [loading, setLoading]           = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [deletedEvents, setDeletedEvents] = useState([]); 

  const userId = localStorage.getItem("userId");

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
const sendLog = async (status, rows = []) => {
  try {
    const sotNoList = sotIds.length ? sotIds.join(", ") : "-";
    const totalSots = sotIds.length;
    const totalItems = rows.length;
    const totalAcceptedQty = rows.reduce(
      (sum, r) => sum + (Number(r.acceptedQty) || 0),
      0,
    );
    const categoriesTouched = [
      ...new Set(rows.map((r) => r.catName).filter(Boolean)),
    ].join(", ");

    const description =
      status === "ACCEPT_SUCCESS"
        ? `Multiple SOTs Accepted — SOT IDs: ${sotNoList} | Total SOTs: ${totalSots} | ` +
          `Items: ${totalItems} | Total Accepted Qty: ${totalAcceptedQty} | ` +
          `Categories: ${categoriesTouched || "N/A"} | Updated By: ${getUserEmail() || "Unknown User"}`
        : `Multiple SOT Accept FAILED — SOT IDs: ${sotNoList} | Total SOTs: ${totalSots} | ` +
          `Attempted By: ${getUserEmail() || "Unknown User"}`;

    await AddLogs({
      description,
      eventType:
        status === "ACCEPT_SUCCESS" ? "SOT_Accept_Success" : "SOT_Accept_Error",
      id: 0,
      eventId: 0, // ✅ no single eventId in a multi-SOT context
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};
useEffect(() => {
  const details = apiResponse.flatMap((entry) => entry?.details || []);

  const rows = details.map((d, i) => {
    const events = (d.eventWiseSotDetails || []).map((ewd) => ({
      ...ewd,
      qty:            ewd.qty ?? d.qty,
    acceptedQty:    ewd.acceptedQty != null ? ewd.acceptedQty : (ewd.qty ?? d.qty),
      returnQty:      ewd.returnQty ?? 0,
      unitName:       ewd.unitName ?? d.unitName,
    }));

    const availableStockUnitName = d.availableStockUnitName ?? d.unitName;

    const initialStockBase =
      toBaseUnit(d.availableStock, availableStockUnitName) +
      toBaseUnit(d.acceptedQty, d.unitName);
console.log({
  availableStock: d.availableStock,
  availableStockUnitName: d.availableStockUnitName,
  acceptedQty: d.acceptedQty,
  unitName: d.unitName,
});
    return {
      rowKey:                 `${d.rawMaterialId}-${i}`,
      rawMaterialId:          d.rawMaterialId,
      itemName:               d.rawMaterialName,
      catId:                  d.rawMaterialCatId,
      catName:                d.rawMaterialCatName,
      qty:                    d.qty,
     acceptedQty: d.acceptedQty != null ? d.acceptedQty : d.qty,
      returnQty:              d.returnQty,
      availableStock:         d.availableStock,
      availableStockUnitName,
      initialStockBase, 
      unitName:               d.unitName,
      partyId:                d.partyId || "",
      partyName:              d.partyName || "",
      eventWiseSotDetails:    events,
    };
  });

  setAllRows(rows);

  const seen = new Map();
  rows.forEach((r) => {
    if (!seen.has(r.catId)) seen.set(r.catId, r.catName);
  });
  const tabList = Array.from(seen.entries()).map(([catId, catName]) => ({ catId, catName }));
  setTabs(tabList);
  setActiveTab(tabList[0]?.catId ?? null);

  fetchAgencies();
}, [apiResponse]);

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

  const toggleExpand = (rowKey) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(rowKey) ? next.delete(rowKey) : next.add(rowKey);
      return next;
    });
  };

  const handleRowAgencyChange = (rowKey, partyId) => {
    const agency = agencies.find((a) => String(a.id) === String(partyId));
    setAllRows((prev) =>
      prev.map((row) =>
        row.rowKey === rowKey
          ? { ...row, partyId, partyName: agency?.nameEnglish || "" }
          : row
      )
    );
  };

const recomputeRow = (row, events) => {
  const usedBase = events.reduce((sum, ewd) => {
    return sum + toBaseUnit(Number(ewd.acceptedQty || 0), ewd.unitName);
  }, 0);

  const newAvailableStockBase = Number(row.initialStockBase) - usedBase;

  return {
    ...row,
    eventWiseSotDetails: events,
    acceptedQty: fromBaseUnit(usedBase, row.unitName),
    availableStock: fromBaseUnit(
      newAvailableStockBase,
      row.availableStockUnitName
    ),
  };
};
  
 const handleNestedQtyChange = (rowKey, sotDetailId, value) => {
  if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;

  setAllRows((prev) =>
    prev.map((row) => {
      if (row.rowKey !== rowKey) return row;

      const events = row.eventWiseSotDetails.map((ewd) =>
        ewd.sotDetailId === sotDetailId ? { ...ewd, acceptedQty: value } : ewd
      );

      return recomputeRow(row, events);
    })
  );
};

  const getStockColorClass = (value) =>
    value < 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold";

  const getTabRows = () => allRows.filter((r) => r.catId === activeTab);
  const getFilteredRows = () =>
    getTabRows().filter((r) => r.itemName?.toLowerCase().includes(search.toLowerCase()));

  const activeTabName = tabs.find((t) => t.catId === activeTab)?.catName ?? "";
  const filteredRows = useMemo(getFilteredRows, [allRows, activeTab, search]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const details = allRows.map((row) => ({
        rawMaterialId:      row.rawMaterialId,
        rawMaterialName:    row.itemName,
        rawMaterialCatId:   row.catId,
        rawMaterialCatName: row.catName,
        qty:                Number(row.qty),
        acceptedQty:        Number(row.acceptedQty), 
        returnQty:          Number(row.returnQty) || 0,
        availableStock:     Number(row.availableStock) || 0, 
        unitId:             row.unitId,
        unitName:           row.unitName,
        partyId:            Number(row.partyId) || 0,
        partyName:          row.partyName || "",
        eventWiseSotDetails: row.eventWiseSotDetails.map((ewd) => ({
          sotId:          ewd.sotId,
          sotDetailId:    ewd.sotDetailId,
          eventId:        ewd.eventId,
          eventName:      ewd.eventName,
          qty:            Number(ewd.qty),
          acceptedQty:    Number(ewd.acceptedQty),
          returnQty:      Number(ewd.returnQty) || 0,
          availableStock: Number(ewd.availableStock) || 0,
          unitId:         ewd.unitId,
          unitName:       ewd.unitName,
        })),
      }));

      const payload = [{ userId: Number(userId), details }];
      const res = await addUpdateMultipleSotData(payload);

      if (res?.data?.success) {
        await sendLog("ACCEPT_SUCCESS", allRows);
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: res?.data?.msg || "All selected SOTs accepted.",
          confirmButtonColor: "#16a34a",
        }).then(() => navigate(-1));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to accept selected SOTs.",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (e) {
      console.error(e);
      await sendLog("ACCEPT_ERROR", allRows);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRow = (rowKey) => {
  const row = allRows.find((r) => r.rowKey === rowKey);
  if (!row) return;

  Swal.fire({
    title: "Remove this item?",
    html: `<b>${row.itemName}</b> and all its event lines (${row.eventWiseSotDetails.length}) will be removed from this SOT.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  }).then(async (r) => {
    if (!r.isConfirmed) return;

    try {
      const sotDetailIds = row.eventWiseSotDetails.map((ewd) => ewd.sotDetailId);
      const res = await deleteSotDetails(sotDetailIds); // ✅ all event ids under this item, in one call

      if (!res?.data?.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to remove this item.",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      setAllRows((prev) => prev.filter((r) => r.rowKey !== rowKey));

      // ✅ log every event under this item, not just one
      setDeletedEvents((prev) => [
        ...prev,
        ...row.eventWiseSotDetails.map((ewd) => ({
          itemName: row.itemName,
          eventName: ewd.eventName,
        })),
      ]);

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: res?.data?.msg || "Item removed.",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      console.error("[handleDeleteRow] Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove this item. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  });
};
  const handleDeleteEvent = (rowKey, sotDetailId, eventName, itemName) => {
  Swal.fire({
    title: "Remove this event line?",
    html: `<b>${itemName}</b> — <span style="color:#dc2626">${eventName}</span> will be removed from this SOT.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
  }).then(async (r) => {
    if (!r.isConfirmed) return;

    try {
      const res = await deleteSotDetails([sotDetailId]);

      if (!res?.data?.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to remove this event line.",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      setAllRows((prev) =>
        prev.map((row) => {
          if (row.rowKey !== rowKey) return row;
          const remainingEvents = row.eventWiseSotDetails.filter(
            (ewd) => ewd.sotDetailId !== sotDetailId
          );
          return recomputeRow(row, remainingEvents);
        })
      );

      setDeletedEvents((prev) => [...prev, { itemName, eventName }]);

      Swal.fire({
        icon: "success",
        title: "Removed!",
        text: res?.data?.msg || "Event line removed.",
        confirmButtonColor: "#16a34a",
      });
    } catch (err) {
      console.error("[handleDeleteEvent] Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to remove this event line. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  });
};
  return (
    <Fragment>
      <Container>

        {/* ── Header ── */}
        <div className="bg-white border rounded-xl shadow-sm mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Items</p>
              <p className="font-semibold text-gray-800 text-sm">{allRows.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Categories</p>
              <p className="font-semibold text-gray-800 text-sm">{tabs.length}</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-5 py-3">
            <p className="text-sm text-gray-500">
              Review and assign suppliers before accepting the SOTs.
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
                Accept SOT
              </button>
            </div>
          </div>
        </div>

{loading ? (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <Spin size="large" />
    <p className="text-sm text-gray-500">Loading SOT details…</p>
  </div>
) : (
  <>
        {/* ── Category Tabs ── */}
        {loading ? (
          <div className="flex items-center gap-2 mb-4">
            <Spin size="small" />
            <span className="text-sm text-gray-500">Loading suppliers…</span>
          </div>
        ) : (
          <div className="flex gap-2 mb-4 flex-wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.catId;
              const itemCount = allRows.filter((r) => r.catId === tab.catId).length;
              return (
                <button
                  key={tab.catId}
                  onClick={() => { setActiveTab(tab.catId); setSearch(""); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#005BA8] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#005BA8] hover:text-[#005BA8]"
                  }`}
                >
                  {tab.catName}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Search ── */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">
            {activeTabName}
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({filteredRows.length} items)
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
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Item Name</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Qty</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Accepted Qty</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Agency</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600">Available Stock</th>
                 <th className="text-left px-3 py-2 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const isOpen = expandedRows.has(row.rowKey);
                return (
                  <Fragment key={row.rowKey}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleExpand(row.rowKey)}
                          className="text-gray-500 hover:text-[#005BA8]"
                        >
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{row.itemName}</td>
                      <td className="px-3 py-2">{row.qty}</td>
                      <td className="px-3 py-2">{row.unitName}</td>
                      <td className="px-3 py-2">{row.acceptedQty}</td>
                      
                      <td className="px-3 py-2">
                        <select
                          value={row.partyId}
                          onChange={(e) => handleRowAgencyChange(row.rowKey, e.target.value)}
                          className="w-40 px-2 py-1 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20"
                        >
                          <option value="">Select agency</option>
                          {agencies.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nameEnglish}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`px-3 py-2 ${getStockColorClass(row.availableStock)}`}>
                        {row.availableStock} ({row.availableStockUnitName})
                      </td>
                       <td className="px-3 py-2">
            <button
              onClick={() => handleDeleteRow(row.rowKey)}
              className="text-white bg-red-600 hover:bg-red-700 p-1.5 rounded-md transition-colors"
            >
              <Trash size={14} />
            </button>
          </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={8} className="bg-blue-50 px-3 py-3">
                          <table className="w-full text-xs border border-orange-100 rounded-lg overflow-hidden">
                           <thead className="bg-blue-100">
  <tr>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Event Name</th>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Qty</th>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Unit</th>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Accepted Qty</th>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Return Qty</th>
    <th className="text-left px-3 py-2 font-semibold text-gray-700">Action</th> {/* ✅ new */}
  </tr>
</thead>
<tbody>
  {row.eventWiseSotDetails.map((ewd) => (
    <tr key={ewd.sotDetailId} className="border-t border-orange-100">
      <td className="px-3 py-2">{ewd.eventName}</td>
      <td className="px-3 py-2">{ewd.qty}</td>
      <td className="px-3 py-2">{ewd.unitName}</td>
      <td className="px-3 py-2">
        <input
          type="tel"
          value={ewd.acceptedQty}
          onChange={(e) =>
            handleNestedQtyChange(row.rowKey, ewd.sotDetailId, e.target.value)
          }
          className="w-24 px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20"
        />
      </td>
      <td className="px-3 py-2">{ewd.returnQty}</td>
     
      <td className="px-3 py-2">
        <button
          onClick={() =>
            handleDeleteEvent(row.rowKey, ewd.sotDetailId, ewd.eventName, row.itemName)
          }
          className="text-white bg-red-600 hover:bg-red-700 p-1.5 rounded-md transition-colors"
        >
          <Trash size={14} />
        </button>
      </td>
    </tr>
  ))}
</tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
  </>
)}
      </Container>
    </Fragment>
  );
};

export default AcceptMultipleSOT;