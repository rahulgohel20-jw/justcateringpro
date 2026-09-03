import { Fragment, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Container } from "@/components/container";
import { Select } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GetRawMaterialcategory,
  AddOPB,
  SearchRawMaterial,
  GetOPBItems,
  AddLogs, // ✅ Add this
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Save } from "lucide-react";
import { usePermission } from "../../../hooks/usePermission";

// ✅ Mirror exact pattern from CreateEventPage
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

const getLogDescription = (status) => {
  switch (status) {
    case "SAVE_OPB_SUCCESS":
      return "Raw Material Opening Balance saved successfully";
    case "SAVE_OPB_ERROR":
      return "Failed to save Raw Material Opening Balance";
    default:
      return "Raw Material OPB action performed";
  }
};

const getEventType = (status) => {
  switch (status) {
    case "SAVE_OPB_SUCCESS":
      return "OPB_Save";
    case "SAVE_OPB_ERROR":
      return "OPB_Error";
    default:
      return "OPB";
  }
};

const RawMaterialOPB = () => {
  const intl = useIntl();
  const Id = localStorage.getItem("userId");
  const permissions = usePermission("Raw Material OPB");

  const field = useMemo(() => {
    const lang = localStorage.getItem("lang");
    return (
      { en: "nameEnglish", hi: "nameHindi", gu: "nameGujarati" }[lang] ||
      "nameEnglish"
    );
  }, []);

  const ITEMS_PER_PAGE = 100;

  const [rawOriginalData, setRawOriginalData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [opbValues, setOpbValues] = useState({});
  const userId = localStorage.getItem("userId");
  const dirtyIdsRef = useRef(new Set());
  const rawMaterialsCacheRef = useRef({});

  const FetchSearchRawMaterial = async (searchTerm, page = currentPage) => {
    if (!searchTerm.trim()) {
      FetchRawMaterial(page);
      return;
    }

    try {
      setLoading(true);

      const res = await SearchRawMaterial(
        true,
        Id,
        page,
        ITEMS_PER_PAGE,
        searchTerm,
      );

      const data = res?.data?.data || {};

      setRawOriginalData(data["Raw Material Details"] || []);
      setTotalRecords(data.totalItems || 0);
    } catch (err) {
      setRawOriginalData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const sendLog = useCallback(
  async (status, payloadItems = []) => {
    try {
      const totalItems = payloadItems.length;
      const itemNames = payloadItems
        .map((item) => rawMaterialsCacheRef.current[item.rawMaterialId]?.raw_material_name)
        .filter(Boolean);

      const namesPreview =
        itemNames.length > 0
          ? itemNames.slice(0, 5).join(", ") +
            (itemNames.length > 5 ? ` +${itemNames.length - 5} more` : "")
          : "N/A";

      const description =
        status === "SAVE_OPB_SUCCESS"
          ? `Raw Material Opening Balance saved — Items: ${totalItems} | Names: ${namesPreview} | Updated By: ${getUserEmail() || "Unknown User"}`
          : status === "SAVE_OPB_ERROR"
            ? `Raw Material Opening Balance save FAILED | Attempted By: ${getUserEmail() || "Unknown User"}`
            : "Raw Material OPB action performed";

      const logPayload = {
        description,
        eventType: getEventType(status),
        id:  0,
        user: getUserEmail(),
        eventId : 0,
        
      };
      await AddLogs(logPayload);
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  },
  [userId],
);

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const FetchRawMaterial = async (page = currentPage, search = searchQuery) => {
    try {
      setLoading(true);
      const res = await GetOPBItems(
        categoryFilter || 0,
        page,
        ITEMS_PER_PAGE,
        userId,
        search.trim(), // ← pass itemName
      );
      const resData = res?.data || {};
      setRawOriginalData(resData.data || []);
      setTotalRecords(resData.totalRecords || 0);
    } catch (err) {
      setRawOriginalData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const FetchCategories = () => {
    GetRawMaterialcategory(Id)
      .then((res) => {
        const list = res?.data?.data?.["Raw Material Category Details"] || [];
        setCategories(list);
      })
      .catch(console.error);
  };

  useEffect(() => {
    FetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery]);

  // Debounce search + category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      FetchRawMaterial(currentPage, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, categoryFilter, searchQuery]);

 useEffect(() => {
  if (rawOriginalData.length === 0) return;

  rawOriginalData.forEach((raw) => {
    rawMaterialsCacheRef.current[raw.rawMaterialId] = {
      raw_material_name: raw.rawMaterialName || "-",
      raw_material_category: raw.categoryName || "-",
      unit: raw.unitName || "-",
    };
  });

  setOpbValues((prev) => {
    const updated = { ...prev };
    rawOriginalData.forEach((raw) => {
      const id = raw.rawMaterialId;
      // Never clobber a value the user already edited, on this page or any other
      if (dirtyIdsRef.current.has(id)) return;
      if (updated[id]) return; // already prefilled once, leave as-is

      let expiryDate = "";
      if (raw.expiryDate) {
        const [day, month, year] = raw.expiryDate.split("/");
        if (day && month && year) {
          expiryDate = `${year}-${month}-${day}`;
        }
      }

      updated[id] = {
        opening_bal: raw.opbStock ?? "",
        min_qty: raw.minStock ?? "",
        expiry_date: expiryDate,
        supplier_rate: raw.supplierRate ?? "",
      };
    });
    return updated;
  });
}, [rawOriginalData]);


  useEffect(() => {
    let filtered = [...rawOriginalData];

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.rawMaterialName?.toLowerCase().includes(lower),
      );
    }

    const mapped = filtered.map((raw, index) => ({
      sr_no: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
      raw_material_id: raw.rawMaterialId,
      raw_material_name: raw.rawMaterialName || "-",
      raw_material_category: raw.categoryName || "-",
      unit: raw.unitName || "-",
      opbStock: raw.opbStock,
      minStock: raw.minStock,
      expiryDate: raw.expiryDate,
      createdAt: raw.createdAt,
      supplierRate: raw.supplierRate,
    }));

    setDisplayData(mapped);
  }, [rawOriginalData, searchQuery, currentPage, field]);

  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

 const handleOPBChange = (id, key, value) => {
  dirtyIdsRef.current.add(id);
  setOpbValues((prev) => ({
    ...prev,
    [id]: { ...prev[id], [key]: value },
  }));
};


const handleSave = async () => {
  const payload = Array.from(dirtyIdsRef.current)
    .map((rawMaterialId) => {
      const vals = opbValues[rawMaterialId] || {};

      let expiryDate = "";
      if (vals.expiry_date) {
        const [year, month, day] = vals.expiry_date.split("-");
        if (day && month && year) {
          expiryDate = `${day}/${month}/${year}`;
        }
      }

      return {
        rawMaterialId: Number(rawMaterialId),
        opbStock: parseFloat(vals.opening_bal) || 0,
        minStock: parseFloat(vals.min_qty) || 0,
        expiryDate,
        supplierRate: parseFloat(vals.supplier_rate) || 0,
      };
    });

  if (payload.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Nothing to Save",
      text: "Please edit at least one field for any item.",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  try {
    setSaving(true);

    const response = await AddOPB({ items: payload });

    if (response?.data?.success === true || response?.success === true) {
      await sendLog("SAVE_OPB_SUCCESS", payload);

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Opening balances saved for ${payload.length} item(s).`,
        timer: 1800,
        showConfirmButton: false,
      });

      dirtyIdsRef.current.clear(); // clear only after a successful save
      FetchRawMaterial(currentPage);
    } else {
      throw new Error(response?.data?.msg || "Save failed");
    }
  } catch (error) {
    await sendLog("SAVE_OPB_ERROR", payload);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to save. Please try again.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setSaving(false);
  }
};

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="RAW_MATERIAL.OPB_TITLE"
              defaultMessage="Raw Material Opening Balance (OPB)"
            />
          </h1>{" "}
        </div>

        <div className="filters flex flex-wrap items-end justify-between gap-3 mb-3">
          {/* LEFT SIDE */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="relative w-[240px]">
              <input
                className="input w-full h-[40px] pl-10"
                placeholder={intl.formatMessage({
                  id: "RAW_MATERIAL.SEARCH",
                  defaultMessage: "Raw Material Search...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="ki-filled ki-magnifier text-md text-primary absolute top-1/2 left-3 -translate-y-1/2"></i>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label>
                <FormattedMessage
                  id="RAW_MATERIAL.CATEGORY"
                  defaultMessage="Category"
                />
              </label>

              <Select
                className="w-[240px]"
                showSearch
                allowClear
                placeholder="All Categories"
                optionFilterProp="label"
                value={categoryFilter}
                onChange={(value) => {
                  setCategoryFilter(value ?? 0);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 0, label: "All Categories" },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat[field],
                  })),
                ]}
                style={{ height: 40 }}
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-end me-3">
            {permissions.add &&(
            <button
              className="btn btn-success h-[40px] px-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={saving || loading}
            >
              <Save size={16} />
              {saving ? (
                <FormattedMessage
                  id="COMMON.SAVING"
                  defaultMessage="Saving..."
                />
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card">
          <div className="table-responsive">
            <div className="relative">
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-[#005BA8] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                </div>
              )}

              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      <FormattedMessage
                        id="TABLE.CATEGORY"
                        defaultMessage="Category"
                      />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.ITEM_NAME"
                        defaultMessage="Item Name"
                      />
                    </th>
                    <th>
                      <FormattedMessage id="TABLE.UNIT" defaultMessage="Unit" />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.OPENING_BAL"
                        defaultMessage="Opening Balance"
                      />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.MIN_QTY"
                        defaultMessage="Min Qty"
                      />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.PRICE"
                        defaultMessage="Price"
                      />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.CREATED_DATE"
                        defaultMessage="Created Date"
                      />
                    </th>
                    <th>
                      <FormattedMessage
                        id="TABLE.EXPIRY_DATE"
                        defaultMessage="Expiry Date"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    displayData.map((row) => {
                      const vals = opbValues[row.raw_material_id] || {};
                      return (
                        <tr key={row.raw_material_id}>
                          <td>{row.sr_no}</td>
                          <td>{row.raw_material_category}</td>
                          <td className="font-semibold">
                            {row.raw_material_name}
                          </td>
                          <td>{row.unit}</td>

                          {/* Opening Balance */}
                          <td>
                            <input
                              type="tel"
                              min={0}
                              placeholder="0"
                              value={vals.opening_bal ?? ""}
                              onChange={(e) =>
                                handleOPBChange(
                                  row.raw_material_id,
                                  "opening_bal",
                                  e.target.value,
                                )
                              }
                              className="w-24 text-center px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                            />
                          </td>

                          {/* Min Qty */}
                          <td>
                            <input
                              type="tel"
                              min={0}
                              placeholder="0"
                              value={vals.min_qty ?? ""}
                              onChange={(e) =>
                                handleOPBChange(
                                  row.raw_material_id,
                                  "min_qty",
                                  e.target.value,
                                )
                              }
                              className="w-28 text-center px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                            />
                          </td>
                          <td>
                            <input
                              type="tel"
                              min={0}
                              placeholder="0"
                              value={vals.supplier_rate ?? ""}
                              onChange={(e) =>
                                handleOPBChange(
                                  row.raw_material_id,
                                  "supplier_rate",
                                  e.target.value,
                                )
                              }
                              className="w-28 text-center px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all"
                            />
                          </td>
                          <td>{row.createdAt || "-"}</td>

                          {/* Expiry Date */}
                          <td>
                            <input
                              type="date"
                              value={vals.expiry_date ?? ""}
                              onChange={(e) =>
                                handleOPBChange(
                                  row.raw_material_id,
                                  "expiry_date",
                                  e.target.value,
                                )
                              }
                              className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* ── Pagination (identical to RawMaterial.jsx) ── */}
              <div className="flex justify-end gap-2 p-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="py-1 px-3 rounded-lg bg-[#005BA8] text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm flex items-center">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="py-1 px-3 rounded-lg bg-[#005BA8] text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default RawMaterialOPB;
