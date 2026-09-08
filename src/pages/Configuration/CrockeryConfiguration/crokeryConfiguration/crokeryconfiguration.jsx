// CrokeyClutly.jsx

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { TableComponent } from "@/components/table/TableComponent";
import {
  GetRawMaterialcategory,
  Getunit,
  geteventrmDisposable,
  addeventrmDisposable,
  reportpdfforrmdisposable,
  GetEventMasterById,
  GenerateCrockerySOT,
  CheckCrockerySOT,
} from "@/services/apiServices";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { getLangConfig } from "@/utils/langConfig";
import { FormattedMessage, useIntl } from "react-intl";

const initialData = [];

const resolveLocalizedCategoryName = (obj, lang) => {
  if (!obj) return "";
  if (lang === "gu") return obj.nameGujarati || obj.nameEnglish || "N/A";
  if (lang === "hi") return obj.nameHindi || obj.nameEnglish || "N/A";
  return obj.nameEnglish || "N/A";
};

const resolveLocalizedRawMaterialName = (obj, lang) => {
  if (!obj) return "";
  if (lang === "gu") {
    return (
      obj.rawMaterialNameGujarati ||
      obj.rawMaterialNameGuj ||
      obj.rawMaterialNameEnglish ||
      "N/A"
    );
  }
  if (lang === "hi") {
    return (
      obj.rawMaterialNameHindi ||
      obj.rawMaterialNameHin ||
      obj.rawMaterialNameEnglish ||
      "N/A"
    );
  }
  return obj.rawMaterialNameEnglish || "N/A";
};

const CrokeyClutly = () => {
  const location = useLocation();
  const intl = useIntl();
  const userId = localStorage.getItem("userId");
  const eventId = location.state?.eventId;
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(initialData);
  const [units, setUnits] = useState([]);
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [isSelectMenuReport, setIsSelectMenuReport] = useState(false);
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const pdfPlugin = defaultLayoutPlugin();
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [eventData, setEventData] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const tabScrollRef = useRef(null);
  const [showPdfConfigModal, setShowPdfConfigModal] = useState(false);
  const [isCompanyDetails, setIsCompanyDetails] = useState(false);
  const [isWithImage, setIsWithImage] = useState(false);
  const [isWithPrice, setIsWithPrice] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const ALL_CATEGORY_VALUE = "all";
  const [reportCategoryId, setReportCategoryId] = useState(ALL_CATEGORY_VALUE);
  const [isAllItemsReport, setIsAllItemsReport] = useState(true);
  const categoryDropdownRef = useRef(null);
  const langConfig = getLangConfig();

  const languageOptions = [
    {
      value: "english",
      label: intl.formatMessage({
        id: "COMMON.ENGLISH",
        defaultMessage: "English",
      }),
    },
    {
      value: "hindi",
      label: intl.formatMessage({
        id: "COMMON.HINDI",
        defaultMessage: "Hindi",
      }),
    },
    { value: "regional", label: langConfig.script },
  ];

  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );
  const rawTabCategoriesRef = useRef([]);
  const rawAllCategoriesRef = useRef([]);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);

    const intervalId = setInterval(() => {
      const current = localStorage.getItem("lang") || "en";
      if (current !== currentLanguage) {
        setCurrentLanguage(current);
      }
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  const getLocalizedCategoryName = (obj) =>
    resolveLocalizedCategoryName(obj, currentLanguage);
  const getLocalizedRawMaterialName = (obj) =>
    resolveLocalizedRawMaterialName(obj, currentLanguage);

  // ================= UNSAVED CHANGES TRACKING =================
  const [isDirty, setIsDirty] = useState(false);

  // ================= CROCKERY SOT =================
  const [isSotLocked, setIsSotLocked] = useState(false);
  const [sotLoading, setSotLoading] = useState(false);

  const scrollTabs = (direction) => {
    if (tabScrollRef.current) {
      tabScrollRef.current.scrollBy({
        left: direction * 150,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      try {
        setEventLoading(true);
        const res = await GetEventMasterById(eventId);
        const event = res?.data?.data?.["Event Details"]?.[0];
        if (event) setEventData(event);
      } catch (err) {
        console.error("Failed to fetch event data:", err);
      } finally {
        setEventLoading(false);
      }
    };
    fetchEventData();
  }, [eventId]);

  // ================= FETCH DISPOSABLE DATA =================
  const fetchDisposable = useCallback(async () => {
    if (!eventId || !activeTab) return;

    try {
      const res = await geteventrmDisposable(eventId, activeTab, userId);

      const categories = res?.data?.data?.categories || [];

      const items = categories.flatMap((cat, catIdx) =>
        (cat.items || []).map((item, itemIdx) => ({
          ...item,
          _rowKey: `${item.rawMaterialId ?? "na"}-${cat.id ?? cat.categoryId ?? catIdx}-${itemIdx}`,
        })),
      );

      setData(Array.isArray(items) ? items : []);
      setIsDirty(false);
    } catch (error) {
      console.error(
        "Error fetching disposable data:",
        error?.response?.data || error,
      );

      setData([]);
      setIsDirty(false);
    }
  }, [eventId, activeTab, userId]);

  useEffect(() => {
    fetchDisposable();
  }, [fetchDisposable]);

  // ================= FETCH UNITS =================
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await Getunit(userId);

        const unitData = res?.data?.data?.["Unit Details"] || [];
        setUnits(unitData);
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };

    fetchUnits();
  }, [userId]);

  // ================= FETCH CATEGORY TABS =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await GetRawMaterialcategory(userId);
        const categoryData =
          res?.data?.data?.["Raw Material Category Details"] || [];

        const filteredTabs = categoryData.filter((item) =>
          [2, 4].includes(item?.rawMaterialCatType?.id),
        );

        rawTabCategoriesRef.current = filteredTabs;

        const mappedTabs = filteredTabs
          .map((item) => ({
            value: item.id,
            label: getLocalizedCategoryName(item),
            sequence: item.sequence,
          }))
          .sort((a, b) => a.sequence - b.sequence);

        setTabs(mappedTabs);

        if (mappedTabs.length > 0) {
          setActiveTab(mappedTabs[0].value);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [userId]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await GetRawMaterialcategory(userId);
        const categoryData =
          res?.data?.data?.["Raw Material Category Details"] || [];

        rawAllCategoriesRef.current = categoryData;

        const mapped = categoryData
          .map((item) => ({
            value: item.id,
            label: getLocalizedCategoryName(item),
            sequence: item.sequence,
          }))
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

        setCategoryOptions(mapped);
      } catch (error) {
        console.error("Error fetching raw material categories:", error);
        setCategoryOptions([]);
      }
    };

    fetchAllCategories();
  }, [userId]);

  useEffect(() => {
    if (rawTabCategoriesRef.current.length > 0) {
      const relabeledTabs = rawTabCategoriesRef.current
        .map((item) => ({
          value: item.id,
          label: getLocalizedCategoryName(item),
          sequence: item.sequence,
        }))
        .sort((a, b) => a.sequence - b.sequence);
      setTabs(relabeledTabs);
    }

    if (rawAllCategoriesRef.current.length > 0) {
      const relabeledOptions = rawAllCategoriesRef.current
        .map((item) => ({
          value: item.id,
          label: getLocalizedCategoryName(item),
          sequence: item.sequence,
        }))
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      setCategoryOptions(relabeledOptions);
    }
  }, [currentLanguage]);

  // ================= HANDLE VALUE CHANGE =================
  const handleValueChange = useCallback((rowKey, field, value) => {
    setData((prev) =>
      prev.map((item) =>
        item._rowKey === rowKey
          ? { ...item, [field]: value === "" ? "" : Number(value) }
          : item,
      ),
    );
    setIsDirty(true);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.rawMaterialNameEnglish
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  // ================= CHECK CROCKERY SOT STATUS =================
  const checkCrockerySotStatus = useCallback(async () => {
    if (!eventId || !userId) return;
    try {
      const res = await CheckCrockerySOT(eventId, userId);
      const locked = res?.data;
      console.log("Crockery SotLocked (actual)", locked);
      setIsSotLocked(locked);
    } catch (error) {
      console.error("Error checking Crockery SOT status:", error);
      setIsSotLocked(true);
    }
  }, [eventId, userId]);

  useEffect(() => {
    checkCrockerySotStatus();
  }, [checkCrockerySotStatus]);

  const saveDisposableSilently = async () => {
    try {
      const payload = {
        eventId: Number(eventId),
        rawMaterialCatId: Number(activeTab),
        userId: Number(userId),
        items: data.map((item) => ({
          qty: Number(item.qty || 0),
          rawMaterialId: Number(item.rawMaterialId || 0),
          totalRate: Number(item.qty || 0) * Number(item.supRate || 0),
          unitId: Number(item.unitId || 0),
        })),
      };

      const res = await addeventrmDisposable(payload);
      return res?.data?.success !== false;
    } catch (error) {
      console.error("Silent save error:", error?.response?.data || error);
      return false;
    }
  };

  const handleSave = async () => {
    let success = false;
    try {
      setSaveLoading(true);
      setSaveProgress(0);

      const interval = setInterval(() => {
        setSaveProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      const payload = {
        eventId: Number(eventId),
        rawMaterialCatId: Number(activeTab),
        userId: Number(userId),
        items: data.map((item) => ({
          qty: Number(item.qty || 0),
          rawMaterialId: Number(item.rawMaterialId || 0),
          totalRate: Number(item.qty || 0) * Number(item.supRate || 0),
          unitId: Number(item.unitId || 0),
        })),
      };

      console.log("Save payload:", payload);

      const res = await addeventrmDisposable(payload);

      clearInterval(interval);
      setSaveProgress(100);

      await new Promise((r) => setTimeout(r, 400));
      await Swal.fire({
        icon: "success",
        title: intl.formatMessage({
          id: "CROCKERY.SAVED_SUCCESSFULLY",
          defaultMessage: "Saved Successfully",
        }),
        text:
          res?.data?.msg ||
          intl.formatMessage({
            id: "CROCKERY.DATA_SAVED_SUCCESS",
            defaultMessage: "Data saved successfully",
          }),
        confirmButtonColor: "#3085d6",
      });

      setIsDirty(false);
      success = true;

      fetchDisposable();
    } catch (error) {
      console.error("Save Error:", error?.response?.data || error);
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "COMMON.SAVE_FAILED",
          defaultMessage: "Save Failed",
        }),
        text:
          error?.response?.data?.msg ||
          intl.formatMessage({
            id: "COMMON.SOMETHING_WENT_WRONG",
            defaultMessage: "Something went wrong",
          }),
        confirmButtonColor: "#d33",
      });
      success = false;
    } finally {
      setSaveLoading(false);
      setSaveProgress(0);
    }
    return success;
  };

  // ================= HANDLE TAB CHANGE =================
  const handleTabChange = useCallback(
    async (tabValue) => {
      if (tabValue === activeTab) return;

      if (!isDirty) {
        setActiveTab(tabValue);
        return;
      }

      const saveDisabled = saveLoading || isSotLocked === true;

      const result = await Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "CROCKERY.UNSAVED_CHANGES_TITLE",
          defaultMessage: "Unsaved Changes",
        }),
        text: saveDisabled
          ? intl.formatMessage({
              id: "CROCKERY.UNSAVED_CHANGES_SAVE_UNAVAILABLE",
              defaultMessage:
                "You have unsaved changes, but saving is unavailable right now. You can discard them and switch, or stay on this tab.",
            })
          : intl.formatMessage({
              id: "CROCKERY.UNSAVED_CHANGES_CONFIRM_SAVE",
              defaultMessage:
                "You have unsaved changes in this tab. Do you want to save before switching?",
            }),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: intl.formatMessage({
          id: "CROCKERY.SAVE_AND_SWITCH",
          defaultMessage: "Save & Switch",
        }),
        denyButtonText: intl.formatMessage({
          id: "CROCKERY.DISCARD_AND_SWITCH",
          defaultMessage: "Discard & Switch",
        }),
        cancelButtonText: intl.formatMessage({
          id: "CROCKERY.STAY_ON_TAB",
          defaultMessage: "Stay on Tab",
        }),
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        didOpen: () => {
          if (saveDisabled) {
            const confirmBtn = Swal.getConfirmButton();
            if (confirmBtn) {
              confirmBtn.disabled = true;
              confirmBtn.style.opacity = "0.5";
              confirmBtn.style.cursor = "not-allowed";
              confirmBtn.title = isSotLocked
                ? intl.formatMessage({
                    id: "CROCKERY.SOT_ALREADY_GENERATED_TAB",
                    defaultMessage: "SOT already generated for this tab",
                  })
                : intl.formatMessage({
                    id: "CROCKERY.SAVE_IN_PROGRESS",
                    defaultMessage: "Save in progress, please wait",
                  });
            }
          }
        },
        preConfirm: () => {
          if (saveDisabled) {
            return false;
          }
          return true;
        },
      });

      if (result.isConfirmed && !saveDisabled) {
        const saved = await handleSave();
        if (saved) {
          setActiveTab(tabValue);
        }
      } else if (result.isDenied) {
        setIsDirty(false);
        setActiveTab(tabValue);
      }
    },
    [activeTab, isDirty, saveLoading, isSotLocked, handleSave],
  );

  // ================= GENERATE CROCKERY SOT =================
  const handleGenerateCrockerySOT = async () => {
    if (!eventId) {
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "CROCKERY.MISSING_EVENT",
          defaultMessage: "Missing Event",
        }),
        text: intl.formatMessage({
          id: "CROCKERY.EVENT_ID_REQUIRED_SOT",
          defaultMessage: "Event ID is required to generate SOT.",
        }),
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      setSotLoading(true);

      const saved = await saveDisposableSilently();
      if (!saved) {
        Swal.fire({
          icon: "error",
          title: intl.formatMessage({
            id: "COMMON.SAVE_FAILED",
            defaultMessage: "Save Failed",
          }),
          text: intl.formatMessage({
            id: "CROCKERY.SAVE_BEFORE_SOT_FAILED",
            defaultMessage:
              "Could not save data before generating SOT. Please try again.",
          }),
          confirmButtonColor: "#d33",
        });
        return;
      }

      const payload = {
        eventId: parseInt(eventId),
        userId: parseInt(userId),
      };

      const response = await GenerateCrockerySOT(payload);

      if (response?.data?.success === true) {
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({
            id: "CROCKERY.SOT_GENERATED",
            defaultMessage: "SOT Generated",
          }),
          text: intl.formatMessage({
            id: "CROCKERY.SOT_GENERATED_TEXT",
            defaultMessage: "Data saved and SOT generated successfully.",
          }),
          timer: 2000,
          showConfirmButton: false,
        });
        fetchDisposable();
        checkCrockerySotStatus();
      } else {
        Swal.fire({
          icon: "warning",
          title: intl.formatMessage({
            id: "CROCKERY.SOT_NOT_GENERATED",
            defaultMessage: "SOT Not Generated",
          }),
          text:
            response?.data?.msg ||
            intl.formatMessage({
              id: "COMMON.SOMETHING_WENT_WRONG_RETRY",
              defaultMessage: "Something went wrong. Please try again.",
            }),
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Crockery SOT generation failed:", error);
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "COMMON.FAILED",
          defaultMessage: "Failed",
        }),
        text:
          error?.response?.data?.msg ||
          intl.formatMessage({
            id: "CROCKERY.SOT_GENERATE_FAILED_RETRY",
            defaultMessage: "Could not generate SOT. Please try again.",
          }),
        confirmButtonColor: "#d33",
      });
    } finally {
      setSotLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!eventId) {
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "CROCKERY.MISSING_EVENT",
          defaultMessage: "Missing Event",
        }),
        text: intl.formatMessage({
          id: "CROCKERY.EVENT_ID_REQUIRED_REPORT",
          defaultMessage: "Event ID is required to generate the report.",
        }),
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      setPdfLoading(true);
      setShowPdfConfigModal(false);

      const lang =
        selectedLanguage === "english"
          ? 0
          : selectedLanguage === "hindi"
            ? 1
            : 2;

      const isAllItems = isAllItemsReport ? 1 : 0;
      const rawCategoryId =
        isAllItemsReport || reportCategoryId === ALL_CATEGORY_VALUE
          ? -1
          : reportCategoryId;

      const res = await reportpdfforrmdisposable(
        eventId,
        isCompanyDetails ? 1 : 0,
        isWithPrice ? 1 : 0,
        userId,
        lang,
        rawCategoryId,
        isAllItems,
        isWithImage ? 1 : 0,
      );

      const url =
        res?.data?.fileUrl ||
        res?.data?.report_path ||
        res?.data?.data?.fileUrl ||
        res?.data?.data?.report_path;

      if (!url) {
        throw new Error(
          res?.data?.msg ||
            intl.formatMessage({
              id: "CROCKERY.PDF_URL_NOT_FOUND",
              defaultMessage: "PDF URL not found in response",
            }),
        );
      }

      setPdfUrl(url);
      setIsPdfModalVisible(true);
    } catch (error) {
      console.error("PDF Export Error:", error);
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "CROCKERY.EXPORT_FAILED",
          defaultMessage: "Export Failed",
        }),
        text:
          error?.response?.data?.msg ||
          error?.message ||
          intl.formatMessage({
            id: "COMMON.SOMETHING_WENT_WRONG",
            defaultMessage: "Something went wrong",
          }),
        confirmButtonColor: "#d33",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // ================= TABLE COLUMNS =================
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        id: "id",
        header: () => (
          <span>
            <FormattedMessage id="COMMON.ID" defaultMessage="ID" />
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">{row.index + 1}</span>
        ),
      },

      // ================= RAW MATERIAL =================
      {
        accessorKey: "rawMaterialNameEnglish",
        id: "rawMaterialNameEnglish",
        header: () => (
          <span>
            <FormattedMessage
              id="CROCKERY.RAW_MATERIAL_NAME"
              defaultMessage="Raw Material Name"
            />
          </span>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={item.imageUrl || "/placeholder-image.png"}
                alt={getLocalizedRawMaterialName(item)}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder-image.png";
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">
                  {getLocalizedRawMaterialName(item)}
                </span>
                <span className="text-xs text-gray-400">
                  <FormattedMessage
                    id="CROCKERY.ID_LABEL"
                    defaultMessage="ID: {id}"
                    values={{ id: item.rawMaterialId }}
                  />
                </span>
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: "supRate",
        id: "supRate",
        header: () => (
          <span>
            <FormattedMessage
              id="CROCKERY.SUP_RATE"
              defaultMessage="Sup Rate"
            />
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {row.original.supRate || 0}
          </span>
        ),
      },

      // ================= QTY =================
      {
        accessorKey: "qty",
        id: "qty",
        header: () => (
          <span>
            <FormattedMessage id="COMMON.QTY" defaultMessage="Qty" />
          </span>
        ),
        cell: ({ row }) => (
          <input
            type="tel"
            value={row.original.qty || ""}
            onChange={(e) =>
              handleValueChange(row.original._rowKey, "qty", e.target.value)
            }
            className="w-[90px] border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        ),
      },

      {
        accessorKey: "unitNameEnglish",
        id: "unitNameEnglish",
        header: () => (
          <span>
            <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />
          </span>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {row.original.unitNameEnglish || "-"}
          </span>
        ),
      },

      // ================= TOTAL =================
      {
        accessorKey: "total",
        id: "total",
        header: () => (
          <span>
            <FormattedMessage
              id="CROCKERY.TOTAL_AMOUNT"
              defaultMessage="Total Amount"
            />
          </span>
        ),
        cell: ({ row }) => {
          const total = (
            Number(row.original.qty || 0) * Number(row.original.supRate || 0)
          ).toFixed(2);

          return (
            <span className="font-semibold text-green-600">₹ {total}</span>
          );
        },
      },
    ],
    [handleValueChange, currentLanguage],
  );

  const filteredCategoryOptions = useMemo(() => {
    const allOption = {
      value: ALL_CATEGORY_VALUE,
      label: intl.formatMessage({
        id: "CROCKERY.ALL_CATEGORIES",
        defaultMessage: "All Categories",
      }),
    };

    if (!categorySearchTerm.trim()) {
      return [allOption, ...categoryOptions];
    }

    const matches = categoryOptions.filter((cat) =>
      cat.label.toLowerCase().includes(categorySearchTerm.toLowerCase()),
    );

    return allOption.label.toLowerCase().includes(categorySearchTerm.toLowerCase())
      ? [allOption, ...matches]
      : matches;
  }, [categoryOptions, categorySearchTerm, intl]);

  useEffect(() => {
    const handler = (e) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ================= TOTAL PRICE =================
  const totalPrice = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => acc + Number(item.qty || 0) * Number(item.supRate || 0),
      0,
    );
  }, [filteredData]);

  return (
    <div className="p-6  h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-gray-900 text-2xl font-bold">
          <FormattedMessage
            id="CROCKERY.TITLE"
            defaultMessage="Crockery Configuration"
          />
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          <FormattedMessage
            id="CROCKERY.SUBTITLE"
            defaultMessage="Manage crockery and raw material configuration"
          />
        </p>
      </div>

      {eventData && (
        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between p-4 gap-3 md:gap-4 lg:gap-6">
            {/* ROW 1 — Event ID */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="COMMON.EVENT_ID"
                    defaultMessage="Event ID:"
                  />
                </span>
                <span className="text-sm font-medium text-primary underline cursor-pointer">
                  {eventData?.eventNo || "-"}
                </span>
              </div>
            </div>

            {/* Party Name */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-user text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="COMMON.PARTY_NAME"
                    defaultMessage="Party Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.party?.nameEnglish || "-"}
                </span>
              </div>
            </div>

            {/* Event Name */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-geolocation-home text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="COMMON.EVENT_NAME"
                    defaultMessage="Event Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventType?.nameEnglish || "-"}
                </span>
              </div>
            </div>

            {/* Event Date & Time */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="CROCKERY.EVENT_DATE_TIME"
                    defaultMessage="Event Date & Time:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventStartDateTime || "-"}
                </span>
              </div>
            </div>

            {/* FORCE NEW ROW */}
            <div className="w-full h-0"></div>

            {/* ROW 2 LEFT — Event Venue */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="CROCKERY.EVENT_VENUE"
                    defaultMessage="Event Venue:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.venue?.nameEnglish || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm w-full">
        <button
          onClick={() => scrollTabs(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all shrink-0 text-lg"
        >
          ‹
        </button>

        {/* Scrollable Tab List */}
        <div
          ref={tabScrollRef}
          className="flex items-center gap-2 overflow-x-auto scroll-smooth flex-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0
          ${
            activeTab === tab.value
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
            >
              {tab.label}
              {activeTab === tab.value && isDirty ? " •" : ""}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scrollTabs(1)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 transition-all shrink-0 text-lg"
        >
          ›
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative w-full lg:w-[320px]">
            <i className="ki-filled ki-magnifier absolute top-1/2 -translate-y-1/2 left-3 text-gray-400"></i>
            <input
              type="text"
              placeholder={intl.formatMessage({
                id: "CROCKERY.SEARCH_MATERIAL",
                defaultMessage: "Search material...",
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateCrockerySOT}
              disabled={sotLoading || isSotLocked === true}
              title={
                isSotLocked === true
                  ? intl.formatMessage({
                      id: "CROCKERY.SOT_ALREADY_GENERATED",
                      defaultMessage: "SOT already generated",
                    })
                  : intl.formatMessage({
                      id: "CROCKERY.GENERATE_SOT",
                      defaultMessage: "Generate SOT",
                    })
              }
              className={`text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  isSotLocked === true
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-700 hover:bg-orange-800 disabled:opacity-60 disabled:cursor-not-allowed"
                }`}
            >
              {sotLoading ? (
                <FormattedMessage
                  id="COMMON.GENERATING"
                  defaultMessage="Generating..."
                />
              ) : (
                <FormattedMessage
                  id="CROCKERY.GENERATE_SOT"
                  defaultMessage="Generate SOT"
                />
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading || isSotLocked === true}
              className="bg-primary hover:bg-primary-active disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              {saveLoading ? (
                <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
              ) : (
                <FormattedMessage
                  id="COMMON.SAVE_CHANGES"
                  defaultMessage="Save Changes"
                />
              )}
            </button>

            <button
              onClick={() => {
                setReportCategoryId(ALL_CATEGORY_VALUE);
                setIsAllItemsReport(true);
                setIsWithImage(false);

                setShowPdfConfigModal(true);
              }}
              disabled={pdfLoading}
              className={`flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0
    ${pdfLoading ? "bg-red-300 cursor-not-allowed" : "bg-primary "}`}
            >
              {pdfLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <FormattedMessage
                    id="COMMON.GENERATING"
                    defaultMessage="Generating..."
                  />
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                    <path d="M8.5 14h1.2c.8 0 1.3.5 1.3 1.2 0 .8-.5 1.3-1.3 1.3H9.3v1.2H8.5V14zm.8 1.9h.3c.4 0 .6-.2.6-.6 0-.4-.2-.6-.6-.6h-.3v1.2zM11.5 14h1.1c1 0 1.6.6 1.6 1.8 0 1.2-.6 1.9-1.6 1.9h-1.1V14zm.8 3h.3c.5 0 .8-.4.8-1.2 0-.8-.3-1.1-.8-1.1h-.3v2.3zM15.2 14h2.3v.7h-1.5v1h1.4v.7h-1.4v1.3h-.8V14z" />
                  </svg>
                  <FormattedMessage
                    id="COMMON.EXPORT_PDF"
                    defaultMessage="Export PDF"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <TableComponent
            columns={columns}
            data={filteredData}
            paginationSize={50}
            hidePagination={false}
            defaultSorting={[{ id: "material", desc: false }]}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#f8fafc] border-t border-gray-200 shrink-0">
          <div className="text-sm font-medium text-gray-700">
            <FormattedMessage
              id="CROCKERY.TOTAL_PRICE"
              defaultMessage="Total Price :"
            />
            <span className="ml-2 text-lg font-bold text-primary">
              ₹ {totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={saveLoading || isSotLocked === true}
            className="bg-primary hover:bg-primary-active disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            {saveLoading ? (
              <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
            ) : (
              <FormattedMessage
                id="COMMON.SAVE_CHANGES"
                defaultMessage="Save Changes"
              />
            )}
          </button>
        </div>
      </div>

      {/* ===== PDF VIEWER MODAL ===== */}
      <Modal
        title={
          <FormattedMessage
            id="CROCKERY.REPORT_PREVIEW"
            defaultMessage="Report Preview"
          />
        }
        open={isPdfModalVisible}
        onCancel={() => setIsPdfModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {pdfUrl && (
          <div style={{ height: "75vh" }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
            </Worker>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <FormattedMessage
            id="CROCKERY.REPORT_CONFIGURATION"
            defaultMessage="Report Configuration"
          />
        }
        open={showPdfConfigModal}
        onCancel={() => setShowPdfConfigModal(false)}
        footer={null}
        width={550}
      >
        <div className="space-y-5 py-2">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              <FormattedMessage
                id="CROCKERY.SELECT_LANGUAGE"
                defaultMessage="Select Language"
              />
            </label>
            <div className="flex border rounded-lg overflow-hidden shadow-sm">
              {languageOptions.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setSelectedLanguage(lang.value)}
                  className={`flex-1 py-2.5 font-medium transition ${
                    selectedLanguage === lang.value
                      ? "bg-[#005BA8] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown with search */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              <FormattedMessage
                id="CROCKERY.CATEGORY"
                defaultMessage="Category"
              />
            </label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white text-left flex items-center justify-between"
              >
                <span
                  className={
                    reportCategoryId ? "text-gray-800" : "text-gray-400"
                  }
                >
                  {reportCategoryId === ALL_CATEGORY_VALUE ? (
                    <FormattedMessage
                      id="CROCKERY.ALL_CATEGORIES"
                      defaultMessage="All Categories"
                    />
                  ) : (
                    categoryOptions.find((c) => c.value === reportCategoryId)
                      ?.label || (
                      <FormattedMessage
                        id="CROCKERY.SELECT_CATEGORY_PLACEHOLDER"
                        defaultMessage="-- Select Category --"
                      />
                    )
                  )}
                </span>
                <i
                  className="ki-filled ki-down text-gray-400"
                  style={{
                    fontSize: 12,
                    transition: "transform .15s",
                    transform: isCategoryDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      autoFocus
                      placeholder={intl.formatMessage({
                        id: "CROCKERY.SEARCH_CATEGORY",
                        defaultMessage: "Search category...",
                      })}
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredCategoryOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        <FormattedMessage
                          id="CROCKERY.NO_CATEGORIES_FOUND"
                          defaultMessage="No categories found"
                        />
                      </div>
                    ) : (
                      filteredCategoryOptions.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setReportCategoryId(cat.value);
                            setIsCategoryDropdownOpen(false);
                            setCategorySearchTerm("");
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            reportCategoryId === cat.value
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                <FormattedMessage
                  id="CROCKERY.COMPANY_DETAILS"
                  defaultMessage="Company Details"
                />
              </p>
              <p className="text-xs text-gray-500">
                <FormattedMessage
                  id="CROCKERY.COMPANY_DETAILS_DESC"
                  defaultMessage="Include company info on the report"
                />
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCompanyDetails((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isCompanyDetails ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  isCompanyDetails ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                <FormattedMessage
                  id="CROCKERY.WITH_PRICE"
                  defaultMessage="With Price"
                />
              </p>
              <p className="text-xs text-gray-500">
                <FormattedMessage
                  id="CROCKERY.WITH_PRICE_DESC"
                  defaultMessage="Include item prices on the report"
                />
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWithPrice((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isWithPrice ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  isWithPrice ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                <FormattedMessage
                  id="CROCKERY.WITH_IMAGE"
                  defaultMessage="With Image"
                />
              </p>
              <p className="text-xs text-gray-500">
                <FormattedMessage
                  id="CROCKERY.WITH_IMAGE_DESC"
                  defaultMessage="Include item images on the report"
                />
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWithImage((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isWithImage ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  isWithImage ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                <FormattedMessage
                  id="CROCKERY.ALL_ITEMS"
                  defaultMessage="All Items"
                />
              </p>
              <p className="text-xs text-gray-500">
                <FormattedMessage
                  id="CROCKERY.ALL_ITEMS_DESC"
                  defaultMessage="Include items from every category, not just the selected one"
                />
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAllItemsReport((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isAllItemsReport ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  isAllItemsReport ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowPdfConfigModal(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfLoading}
              className="px-5 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60"
            >
              {pdfLoading ? (
                <FormattedMessage
                  id="COMMON.GENERATING"
                  defaultMessage="Generating..."
                />
              ) : (
                <FormattedMessage
                  id="CROCKERY.GENERATE_REPORT"
                  defaultMessage="Generate Report"
                />
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CrokeyClutly;