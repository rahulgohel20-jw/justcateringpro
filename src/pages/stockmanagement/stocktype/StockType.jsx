import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import {
  GetStockTypeByUserId,
  DeleteStockType,
  AddLogs, // ✅
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import AddStockType from "../../../partials/modals/add-stocktype/AddStockType";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";


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

const StockType = () => {
  const classes = useStyle();
  const permissions = usePermission("Stock Type");
  const userId = JSON.parse(localStorage.getItem("userId")) || 0;

  const [isStockTypeModalOpen, setIsStockTypeModalOpen] = useState(false);
  const [selectedStockType, setSelectedStockType] = useState(null);

  // ✅ Raw, language-agnostic data — recomputed into display rows via useMemo below
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainType, setSelectedMainType] = useState(null);
  const intl = useIntl();

  // ✅ Language detection — same pattern as CategoryList
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );

  const { filterStockTypes } = useStockTypePermission();

  useEffect(() => {
    const handleLanguageChange = (e) => {
      const newLang =
        e.detail?.newLanguage || localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    const handleStorage = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage((prev) => (newLang !== prev ? newLang : prev));
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleStorage);

    // Polling fallback
    const intervalId = setInterval(() => {
      const currentLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage((prev) => (currentLang !== prev ? currentLang : prev));
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleStorage);
      clearInterval(intervalId);
    };
  }, []);

  const languageFieldMap = {
    en: "nameEnglish",
    hi: "nameHindi",
    gu: "nameGujarati",
  };

  const getLocalizedName = (item) => {
    const field = languageFieldMap[currentLanguage] || "nameEnglish";
    const value = item[field];
    // Fall back to English if this record has no value in the selected language
    return (value && value.trim()) ? value : (item.nameEnglish || "");
  };

  // ✅ sendLog for delete
  const sendLog = useCallback(
    async (status, name = "") => {
      try {
        const logPayload = {
          description:
            status === "DELETE_SUCCESS"
              ? `Stock Type deleted successfully: [${name}]`
              : `Failed to delete Stock Type: [${name}]`,
          eventType:
            status === "DELETE_SUCCESS"
              ? "StockType_Delete"
              : "StockType_Delete_Error",
          id:  0,
          eventId:0,
          user: getUserEmail(),
        };
        await AddLogs(logPayload);
      } catch (logErr) {
        console.error("Failed to save log:", logErr);
      }
    },
    [userId]
  );

  const getId = (item) =>
    item.stocktypeid ?? item.stockTypeId ?? item.StockTypeId ??
    item.stock_type_id ?? item.id ?? item.Id ?? item._id ?? undefined;

   const fetchStockTypes = async () => {
    try {
      setLoading(true);
      const res = await GetStockTypeByUserId(userId, selectedMainType ?? '');

      const apiData = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const normalized = filterStockTypes(apiData).map((item, index) => ({
        sr_no: index + 1,
        stocktypeid: getId(item),
        nameEnglish: item.nameEnglish || "",
        nameGujarati: item.nameGujarati || "",
        nameHindi: item.nameHindi || "",
        mainType: item.mainType ?? 0,
        main_type: item.mainType === 1 ? "Kitchen" : "Godown",
      }));

      setRawData(normalized);
    } catch (error) {
      console.error("Failed to fetch stock types:", error);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockTypes();
  }, [selectedMainType]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // ✅ Localized + filtered rows, recomputed whenever language, raw data, or search changes
  const tableData = useMemo(() => {
    const localized = rawData.map((item) => ({
      ...item,
      type_name: getLocalizedName(item),
    }));

    if (!searchQuery.trim()) return localized;

    const query = searchQuery.toLowerCase();
    return localized.filter((item) =>
      [item.nameEnglish, item.nameHindi, item.nameGujarati]
        .filter(Boolean)
        .some((name) => name.toLowerCase().includes(query)),
    );
  }, [rawData, currentLanguage, searchQuery]);

  const handleDelete = async (stocktypeid) => {
    if (!stocktypeid) {
      Swal.fire({ icon: "error", title: "Invalid ID", text: "Stock type ID is missing." });
      return;
    }

    // ✅ Find name before deleting for log detail
    const targetItem = tableData.find((i) => i.stocktypeid === stocktypeid);
    const itemName = targetItem?.type_name || `ID:${stocktypeid}`;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#005BA8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await DeleteStockType(stocktypeid);

      // ✅ Log delete success with name
      await sendLog("DELETE_SUCCESS", itemName);

      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
      fetchStockTypes();
    } catch (error) {
      console.error("Delete API failed:", error);

      // ✅ Log delete error with name
      await sendLog("DELETE_ERROR", itemName);

      Swal.fire({ icon: "error", title: "Delete Failed", text: "Something went wrong." });
    }
  };

  const handleEdit = (rowData) => {
    if (!rowData?.stocktypeid) return;
    setSelectedStockType(rowData);
    setIsStockTypeModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setSelectedStockType(null);
    setIsStockTypeModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage id="USER.MASTER.STOCK_TYPE_MASTER" defaultMessage="Stock Type Master" />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({ id: "USER.MASTER.SEARCH_STOCK_TYPE", defaultMessage: "Search Stock Type" })}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
              <button className="btn btn-primary" onClick={handleOpenAddModal}>
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage id="USER.MASTER.ADD_TYPE" defaultMessage="Add Type" />
              </button>
            )}
          </div>
        </div>

        <AddStockType
          isOpen={isStockTypeModalOpen}
          onClose={setIsStockTypeModalOpen}
          stockType={selectedStockType}
          refreshData={fetchStockTypes}
        />

        <TableComponent
          columns={columns(
            permissions.edit ? handleEdit : null,
            permissions.delete ? handleDelete : null,
          )}
          data={tableData}
          paginationSize={10}
          loading={loading}
        />
      </Container>
    </Fragment>
  );
};

export default StockType;