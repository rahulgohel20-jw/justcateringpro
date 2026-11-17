import { Fragment, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { GetCategoryImg, DeleteCategoryImg } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { Spin } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import AddCategoryImage from "../../../partials/modals/add-category-image/AddCategoryImage";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const MenuCategoryImage = () => {
  const permissions = usePermission("CategoryImage");
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [allTableData, setAllTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetCategoryImg(userId, "");
      const list = res?.data?.data || [];
      const mapped = list.map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setAllTableData(mapped);
    } catch (error) {
      console.error("Error fetching category images:", error);
      setAllTableData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => fetchData();

  const dictWords = useMemo(
    () => extractDictWords(allTableData, ["categoryName"]),
    [allTableData]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(searchQuery, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, dictWords]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchQuery(word);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) => (prev + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev <= 0 ? spellSuggestions.length - 1 : prev - 1
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

  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) return allTableData;
    const query = searchQuery.toLowerCase().trim();
    return allTableData.filter((item) =>
      (item.categoryName || "").toLowerCase().includes(query)
    );
  }, [allTableData, searchQuery]);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
  };

  const handleDelete = (id) => {
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
        DeleteCategoryImg(id)
          .then((res) => {
            if (res?.data?.success === true) {
              Swal.fire({
                title: "Deleted!",
                text: res.data.msg || "Category image deleted successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
              fetchData();
            } else {
              Swal.fire("Error", res?.data?.msg || "Something went wrong", "error");
            }
          })
          .catch((error) => {
            const msg = error?.response?.data?.msg || "Something went wrong";
            Swal.fire("Error", msg, "error");
          });
      }
    });
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <h1 className="test-xl text-gray-900">
            <FormattedMessage
              id="CATEGORY_IMAGE.MASTER"
              defaultMessage="Category Image Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div ref={searchBoxRef} className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "CATEGORY_IMAGE.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Category Image...",
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
                  <div className="px-3 pt-2 pb-1 text-xs text-gray-400">Suggestions:</div>
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

            {loading && (
              <div className="flex items-center gap-2 text-primary">
                <Spin size="small" />
                <span className="text-sm">
                  <FormattedMessage id="COMMON.LOADING" defaultMessage="Loading..." />
                </span>
              </div>
            )}

            {!loading && (
              <span className="text-sm text-gray-600">
                <FormattedMessage
                  id="COMMON.SHOWING_RECORDS"
                  defaultMessage="Showing {shown} of {total} records"
                  values={{
                    shown: filteredTableData.length,
                    total: allTableData.length,
                  }}
                />
              </span>
            )}
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsModalOpen(true);
                }}
                title="Add Category Image"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddCategoryImage
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={refreshData}
          editData={selectedRecord}
          deleteData={selectedRecord}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, handleView, permissions)}
          data={filteredTableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default MenuCategoryImage;
