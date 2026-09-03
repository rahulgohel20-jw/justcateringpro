import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";

import {
  GetrawMaterialCatIdbytypeid,
  GETcrockerycutlerygetByRawMaterialCat,
  Addupdatecrockerycutlery,
} from "@/services/apiServices";
import { utensilColumns } from "./utensilColumns";
import { gasBatlaColumns } from "./gasBatlaColumns";
import Swal from "sweetalert2";
import styles from "./CrockeryConfiguration.module.css";

const RANGE_FIELDS = [
  "r_0_to_100",
  "r_101_to_200",
  "r_201_to_300",
  "r_301_to_400",
  "r_401_to_500",
  "r_501_to_600",
  "r_601_to_700",
  "r_701_to_800",
  "r_801_to_900",
  "r_901_to_1000",
  "r_1001_to_1100",
  "r_1101_to_1200",
  "r_1201_to_1300",
  "r_1301_to_1400",
  "r_1401_to_1500",
  "r_1501_to_1600",
  "r_1601_to_1700",
  "r_1701_to_1800",
  "r_1801_to_1900",
  "r_1901_to_2000",
];

const normalizeRow = (row) => {
  const normalized = { ...row };
  RANGE_FIELDS.forEach((field) => {
    normalized[field] = row[field] == null ? "" : row[field];
  });
  return normalized;
};

const serializeRow = (row, activeTab, userId) => ({
  id: row.id || 0,
  rawMaterialCategoryId: activeTab.id,
  rawMaterialId: row.rawMaterialId,
  rawMaterialNameEnglish: row.rawMaterialNameEnglish,
  rawMaterialNameHindi: row.rawMaterialNameHindi,
  rawMaterialNameGujarati: row.rawMaterialNameGujarati,
  userId: Number(userId),
  ...Object.fromEntries(
    RANGE_FIELDS.map((field) => [
      field,
      row[field] === "" || row[field] == null ? 0 : Number(row[field]),
    ]),
  ),
});

// ─── Unsaved Changes Modal ────────────────────────────────────────────────────
const UnsavedChangesModal = ({
  onSaveAndSwitch,
  onSwitchWithoutSaving,
  onCancel,
  isSaving,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-[550px] mx-4 flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-orange-300 flex items-center justify-center">
        <span className="text-orange-400 text-3xl font-bold">!</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">Unsaved Changes</h2>
      <p className="text-gray-500 text-center text-sm">
        You have unsaved changes. Do you want to save before switching
        functions?
      </p>
      <div className="flex gap-3 mt-2 w-full justify-center">
        <button
          onClick={onSaveAndSwitch}
          disabled={isSaving}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-l rounded-lg disabled:opacity-60 transition-colors"
        >
          {isSaving ? "Saving..." : "Save & Switch"}
        </button>
        <button
          onClick={onSwitchWithoutSaving}
          disabled={isSaving}
          className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-l rounded-lg disabled:opacity-60 transition-colors"
        >
          Switch Without Saving
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-l rounded-lg disabled:opacity-60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CrockeryConfiguration = () => {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabDataMap, setTabDataMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // ─── Unsaved Changes State ────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState(null); // tab user wants to switch to
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [modalSaveLoading, setModalSaveLoading] = useState(false);

  const activeTabKeyRef = useRef(null);
  const originalDataRef = useRef({}); // stores last-saved/fetched data per tab key

  const getColumnsForTab = (tabNameEnglish) => {
    const key = tabNameEnglish.toUpperCase().trim();
    if (key === "GAS") return gasBatlaColumns;
    return utensilColumns;
  };

  // ─── Fetch Tabs on Mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const res = await GetrawMaterialCatIdbytypeid(2, userId);
        const apiTabs =
          res?.data?.data?.["Raw Material Category Details"] || [];

        const formattedTabs = apiTabs.map((item) => ({
          key: item.id,
          label: item.nameEnglish,
          id: item.id,
          columns: getColumnsForTab(item.nameEnglish),
        }));

        setTabs(formattedTabs);
        if (formattedTabs.length > 0) setActiveTab(formattedTabs[0]);

        const initialMap = {};
        formattedTabs.forEach((tab) => {
          initialMap[tab.key] = [];
        });
        setTabDataMap(initialMap);
      } catch (err) {
        console.error("Error fetching tabs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTabs();
  }, []);

  // ─── Fetch Table Data on Tab Change ──────────────────────────────────────
  useEffect(() => {
    if (!activeTab) return;

    const fetchingForTabKey = activeTab.key;
    activeTabKeyRef.current = fetchingForTabKey;
    let isCancelled = false;

    const fetchTableData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const res = await GETcrockerycutlerygetByRawMaterialCat(
          activeTab.id,
          userId,
        );

        if (isCancelled || activeTabKeyRef.current !== fetchingForTabKey)
          return;

        const rawData = res?.data?.data || [];
        const tableData = rawData.map(normalizeRow);

        // Store original (clean) snapshot for dirty-check
        originalDataRef.current[fetchingForTabKey] = JSON.stringify(tableData);

        setTabDataMap((prev) => ({ ...prev, [fetchingForTabKey]: tableData }));
        setIsDirty(false); // fresh data = clean state
      } catch (err) {
        if (isCancelled) return;
        console.error("Error fetching table data:", err);
      } finally {
        if (!isCancelled && activeTabKeyRef.current === fetchingForTabKey)
          setLoading(false);
      }
    };

    fetchTableData();
    return () => {
      isCancelled = true;
    };
  }, [activeTab?.key]);

  // ─── Tab Switch (with dirty check) ───────────────────────────────────────
  const handleTabChange = useCallback(
    (tab) => {
      if (tab.key === activeTab?.key) return;

      if (isDirty) {
        setPendingTab(tab);
        setShowUnsavedModal(true);
      } else {
        setActiveTab(tab);
      }
    },
    [activeTab?.key, isDirty],
  );

  // ─── Modal Actions ────────────────────────────────────────────────────────
  const handleSaveAndSwitch = async () => {
    try {
      setModalSaveLoading(true);
      const userId = localStorage.getItem("userId");
      const currentData = tabDataMap[activeTab.key] || [];
      const payload = currentData.map((row) =>
        serializeRow(row, activeTab, userId),
      );

      const response = await Addupdatecrockerycutlery(payload);

      if (response?.data?.success) {
        // Update original snapshot after save
        originalDataRef.current[activeTab.key] = JSON.stringify(currentData);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response?.data?.msg || "Data saved successfully!",
          confirmButtonColor: "#3b82f6",
        });

        setIsDirty(false);
        setShowUnsavedModal(false);
        setActiveTab(pendingTab);
        setPendingTab(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.data?.msg || "Failed to save data",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {
      console.error("Error saving data:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || err?.message || "Error saving data",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setModalSaveLoading(false);
    }
  };

  const handleSwitchWithoutSaving = useCallback(() => {
    // Restore original data for current tab (discard edits)
    const original = originalDataRef.current[activeTab.key];
    if (original) {
      setTabDataMap((prev) => ({
        ...prev,
        [activeTab.key]: JSON.parse(original),
      }));
    }
    setIsDirty(false);
    setShowUnsavedModal(false);
    setActiveTab(pendingTab);
    setPendingTab(null);
  }, [activeTab?.key, pendingTab]);

  const handleModalCancel = useCallback(() => {
    setShowUnsavedModal(false);
    setPendingTab(null);
  }, []);

  // ─── Save (toolbar button) ────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const userId = localStorage.getItem("userId");
      const currentData = tabDataMap[activeTab.key] || [];
      const payload = currentData.map((row) =>
        serializeRow(row, activeTab, userId),
      );

      const response = await Addupdatecrockerycutlery(payload);

      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response?.data?.msg || "Data saved successfully!",
          confirmButtonColor: "#3b82f6",
        });

        const res = await GETcrockerycutlerygetByRawMaterialCat(
          activeTab.id,
          userId,
        );
        const rawData = res?.data?.data || [];
        const freshData = rawData.map(normalizeRow);

        // Update original snapshot
        originalDataRef.current[activeTab.key] = JSON.stringify(freshData);

        setTabDataMap((prev) => ({ ...prev, [activeTab.key]: freshData }));
        setIsDirty(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.data?.msg || "Failed to save data",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {
      console.error("Error saving data:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || err?.message || "Error saving data",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  // ─── Value Change (marks dirty) ──────────────────────────────────────────
  const handleValueChange = useCallback(
    (id, field, value) => {
      setTabDataMap((prev) => ({
        ...prev,
        [activeTab.key]: prev[activeTab.key].map((row) =>
          row.id === id ? { ...row, [field]: value } : row,
        ),
      }));
      setIsDirty(true); // mark dirty on any edit
    },
    [activeTab?.key],
  );

  const currentColumns = useMemo(() => {
    if (!activeTab) return [];
    return activeTab.columns({ onValueChange: handleValueChange });
  }, [activeTab?.key, handleValueChange]);

  const currentData = tabDataMap[activeTab?.key] || [];

  if (!activeTab) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">
            {loading ? "Loading..." : "No tabs available"}
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <UnsavedChangesModal
          onSaveAndSwitch={handleSaveAndSwitch}
          onSwitchWithoutSaving={handleSwitchWithoutSaving}
          onCancel={handleModalCancel}
          isSaving={modalSaveLoading}
        />
      )}

      <Container>
        <div className="max-w-full overflow-hidden">
          {/* Header */}
          <div className="mb-3 px-4 sm:px-0">
            <h1 className="text-gray-900 text-2xl font-bold">
              Crockery Configuration
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b mb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                  activeTab?.key === tab.key
                    ? "border-b-2 border-blue-500 text-blue-500 bg-blue-50"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mb-4 px-4 sm:px-0">
            <button
              onClick={handleSave}
              disabled={saveLoading || loading}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saveLoading ? "Saving..." : "Save Configuration"}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading data...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className={`mb-10 ${styles.crockeryTableWrapper}`}>
              <TableComponent
                columns={currentColumns}
                data={currentData}
                paginationSize={50}
              />
            </div>
          )}
        </div>
      </Container>
    </Fragment>
  );
};

export { CrockeryConfiguration };
