import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetRawMaterialcategory,
  DeleteRawMaterialcategory,
  updatestatusrawmatrialcat,
  Getgenerateusermenuitemrawmaterialexcel,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddRawMaterial from "@/partials/modals/raw-material-category/AddRawMaterial";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const AddRawMaterialCategory = () => {
  const permissions = usePermission("Category");
  const [isconatctModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedRawMaterialCategory, setSelectedRawMaterialCategory] =
    useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    FetchRawMaterialCategory();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchRawMaterialCategory();
        return;
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  let Id = localStorage.getItem("userId");

  const FetchRawMaterialCategory = () => {
    GetRawMaterialcategory(Id)
      .then((res) => {
        const list = res.data.data["Raw Material Category Details"] || [];

        setRawOriginalData(list);
      })
      .catch((error) => {
        console.error("Error fetching raw material category:", error);
      });
  };

  // Extract dict words for suggestions
  useEffect(() => {
    if (!rawOriginalData || rawOriginalData.length === 0) return;
    const words = extractDictWords(rawOriginalData, [
      "nameEnglish",
      "nameHindi",
      "nameGujarati",
      "name",
    ]);
    setDictWords(words);
  }, [rawOriginalData]);

  // Build suggestions while typing
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
    const timeoutId = setTimeout(() => {
      const results = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(results);
      setSpellIndex(-1);
      setShowSpell(results.length > 0);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, dictWords]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applySpellSuggestion = (text) => {
    skipSuggestRef.current = true;
    setSearchQuery(text);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((i) => (i + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((i) => (i <= 0 ? spellSuggestions.length - 1 : i - 1));
    } else if (e.key === "Tab" || (e.key === "Enter" && spellIndex >= 0)) {
      if (spellIndex >= 0) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const selectedField = languageMap[language] || "nameEnglish";

    let mapped = rawOriginalData.map((cust, index) => ({
      sr_no: index + 1,
      id: cust.id,
      nameEnglish: cust[selectedField] || "-",
      raw_material_type: cust.rawMaterialType
        ? cust.rawMaterialType[selectedField]
        : "-",
      isActive: cust.isActive,
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (item) =>
          item.nameEnglish?.toLowerCase().includes(q) ||
          item.raw_material_type?.toLowerCase().includes(q)
      );
    }

    setTableData(mapped);
  }, [rawOriginalData, searchQuery, localStorage.getItem("lang")]);

  const DeleteRawMaterialCat = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteRawMaterialcategory(id)
          .then((response) => {
            if (response && (response.success || response.data?.success)) {
              FetchRawMaterialCategory();
              Swal.fire({
                title: "Removed!",
                text: "Raw Material category has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data?.msg || "Something went wrong",
                icon: "error",
                showConfirmButton: true,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting Raw Material category:", error);
          });
      }
    });
  };

  const statusmenuitem = (id, status) => {
    updatestatusrawmatrialcat(id, status)
      .then((res) => {
        FetchRawMaterialCategory();
        if (res.data?.msg) {
          Swal.fire({
            title: "Success!",
            text: res.data.msg,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const handleEdit = (category) => {
    setSelectedRawMaterialCategory(category);
    setIsContactModalOpen(true);
  };

  const handleExcel = async () => {
    const payload = {
      isCaptainReceipe: false,
      isCaptainReceipeRawMaterial: false,
      isMenuCategory: false,
      isMenuItem: false,
      isMenuItemRawMaterial: false,
      isRawMaterial: false,
      isRawMaterialCat: true, // Only Raw Material Category
      isUnit: false,
    };

    try {
      setExcelLoading(true);
      const res = await Getgenerateusermenuitemrawmaterialexcel(Id, payload);
      const d = res?.data;

      // API returned failure
      if (d?.success === false) {
        throw new Error(d?.msg || d?.message || "Failed to export Excel.");
      }

      const fileUrl =
        d?.report_path ||
        d?.data?.report_path ||
        d?.excel_path ||
        d?.data?.excel_path ||
        d?.file_path ||
        d?.data?.file_path ||
        d?.url ||
        (typeof d?.data === "string" ? d.data : null);

      if (fileUrl) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = "Raw_Material_Category.xlsx";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.log("Export response:", d);
        throw new Error(d?.msg || d?.message || "No file URL returned");
      }
    } catch (error) {
      console.error("Export error:", error);
      const apiMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to export Excel.";
      Swal.fire({ title: "Error", text: apiMsg, icon: "error" });
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.RAW_MATERIAL_CATEGORY"
              defaultMessage="Raw Material Category"
            />
          </h1>
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Left: search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.RAW_MATERIAL_CATEGORY",
                  defaultMessage: "Raw Material Category",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                spellCheck={false}
              />

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
                        className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                          i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: Excel + Create New */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              className="btn btn-light"
              onClick={handleExcel}
              disabled={excelLoading}
              title="Download Excel"
            >
              <i className="ki-filled ki-file-down"></i>{" "}
              {excelLoading ? "Generating..." : "Excel"}
            </button>

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRawMaterialCategory(null);
                  setIsContactModalOpen(true);
                }}
                title="Add Contact Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                {intl.formatMessage({
                  id: "USER.MASTER.ADD_CONTACT_CATEGORY",
                  defaultMessage: "Create New ",
                })}
              </button>
            )}
          </div>
        </div>
        <AddRawMaterial
          isOpen={isconatctModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchRawMaterialCategory}
          rawMaterialCategory={selectedRawMaterialCategory}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            DeleteRawMaterialCat,
            statusmenuitem,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default AddRawMaterialCategory;
