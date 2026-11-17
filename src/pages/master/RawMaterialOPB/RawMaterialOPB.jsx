import { Fragment, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Container } from "@/components/container";
import { Select } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GetRawMaterialcategory,
  AddOPB,
  GetOPBItems,
  AddLogs,
  GetAllRawMaterial,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Save } from "lucide-react";
import { usePermission } from "../../../hooks/usePermission";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

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

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

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
          id: 0,
          user: getUserEmail(),
          eventId: 0,
        };
        await AddLogs(logPayload);
      } catch (logErr) {
        console.error("Failed to save log:", logErr);
      }
    },
    [],
  );

  const FetchRawMaterial = async (page = currentPage, search = searchQuery) => {
    try {
      setLoading(true);
      const res = await GetOPBItems(
        categoryFilter || 0,
        page,
        ITEMS_PER_PAGE,
        userId,
        search.trim(),
      );
      const resData = res?.data || {};
      setRawOriginalData(resData.data || []);
      setTotalRecords(resData.totalRecords || 0);
    } catch {
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

  // Pre-load raw materials to populate dictionary
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await GetAllRawMaterial(true, Id, 1, 1000);
        if (cancelled) return;
        const list = res?.data?.data?.["Raw Material Details"] || [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "rawMaterialName",
        ]);
        setDictWords(words);
      } catch (err) {
        console.error("Failed to load spelling dictionary:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [Id]);

  useEffect(() => {
    if (rawOriginalData && rawOriginalData.length > 0) {
      const words = extractDictWords(rawOriginalData, [
        "rawMaterialName",
        "categoryName",
      ]);
      if (words.length > 0) {
        setDictWords((prev) => Array.from(new Set([...prev, ...words])));
      }
    }
  }, [rawOriginalData]);

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

  // Suggestions generation
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (searchQuery || "").trim().toLowerCase();
    if (q.length < 2 || dictWords.length === 0) {
      setSpellSuggestions([]);
      setShowSpell(false);
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, dictWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchQuery(word);
    setShowSpell(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev < spellSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev > 0 ? prev - 1 : spellSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

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
        if (dirtyIdsRef.current.has(id)) return;
        if (updated[id]) return;

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
    const payload = Array.from(dirtyIdsRef.current).map((rawMaterialId) => {
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

        dirtyIdsRef.current.clear();
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
            <div className="relative w-[240px]" ref={searchBoxRef}>
              <input
                className="input w-full h-[40px] pl-10"
                placeholder={intl.formatMessage({
                  id: "RAW_MATERIAL.SEARCH",
                  defaultMessage: "Raw Material Search...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              <i className="ki-filled ki-magnifier text-md text-primary absolute top-1/2 left-3 -translate-y-1/2"></i>
              {showSpell && spellSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                    Suggestions:
                  </div>
                  <ul>
                    {spellSuggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySpellSuggestion(s);
                        }}
                        onMouseEnter={() => setSpellIndex(i)}
                        className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                          }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            {permissions.add && (
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

              {/* ── Pagination ── */}
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
