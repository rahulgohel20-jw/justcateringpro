import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  getalllabourhelperbyuserid,
  GetAllContactCategory,
  deletelabourhelperbyid,
  getlabourheplerpdf,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddLabourhelper from "../../../partials/modals/add-labour-helper/AddLabourhelper";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const Labourhelper = () => {
  const permissions = usePermission("labour helper");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = localStorage.getItem("userId");

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const FetchLabourHelper = () => {
    getalllabourhelperbyuserid(Id)
      .then((res) => {
        const list = res?.data?.data?.["Labor Helper Details"] || [];
        setOriginalData(list);
        const words = extractDictWords(list, [
          "name",
          "phonenumber",
          "partyName",
          "contactCategoryName",
        ]);
        setDictWords(words);
      })
      .catch((error) => {
        console.error("Error fetching labour helper:", error);
        setOriginalData([]);
      });
  };

  const FetchConatctCategory = () => {
    GetAllContactCategory(Id)
      .then((res) => {
        const list = res.data.data["Contact Category Details"] || [];
        setCategoryList(list);
      })
      .catch((error) => console.error("Error fetching:", error));
  };

  useEffect(() => {
    FetchLabourHelper();
    FetchConatctCategory();
  }, []);

  // Map + client-side search
  useEffect(() => {
    let list = originalData.map((item, index) => ({
      sr_no: index + 1,
      id: item.id,
      name: item.name || "-",
      phonenumber: item.phonenumber || "-",
      pancard: item.pancard || "-",
      aadharcard: item.aadharcard || "-",
      category: item.contactCategoryName || "-",
      contactCategoryId: item.contactCategoryId,
      partyId: item.partyId,
      partyName: item.partyName || "-",
      photo: item.photo,
      drivinglicense: item.drivinglicense,
      aadharcarddocpathfront: item.aadharcarddocpathfront,
      aadharcarddocpathback: item.aadharcarddocpathback,
      pancarddocpath: item.pancarddocpath,
      _originalItem: item,
    }));

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.phonenumber.toLowerCase().includes(term) ||
          (item.aadharcard || "").toLowerCase().includes(term) ||
          item.pancard.toLowerCase().includes(term),
      );
    }

    setTableData(list);
  }, [originalData, searchQuery]);

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

  const handleDelete = (id) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_BUTTON",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.MASTER.CANCEL_BUTTON",
        defaultMessage: "Cancel",
      }),
    }).then((result) => {
      if (result.isConfirmed) {
        deletelabourhelperbyid(id)
          .then((res) => {
            if (res?.data?.success !== false) {
              Swal.fire({
                title: "Deleted!",
                text: res?.data?.msg || "Labour helper has been deleted.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
              FetchLabourHelper();
            } else {
              Swal.fire("Error", res?.data?.msg || "Delete failed", "error");
            }
          })
          .catch((error) => {
            console.error("Error deleting labour helper:", error);
            Swal.fire(
              "Error",
              error?.response?.data?.msg || "Something went wrong",
              "error",
            );
          });
      }
    });
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  const handlePrint = async (row) => {
    const newTab = window.open("", "_blank");
    try {
      const res = await getlabourheplerpdf(row.id, Id);
      const data = res?.data;

      let url = null;
      if (data instanceof Blob) {
        url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      } else if (typeof data?.fileUrl === "string") {
        url = data.fileUrl;
      } else if (typeof data?.data?.fileUrl === "string") {
        url = data.data.fileUrl;
      } else if (typeof data === "string" && /^https?:\/\//.test(data)) {
        url = data;
      } else if (typeof data?.data === "string" && /^https?:\/\//.test(data.data)) {
        url = data.data;
      }

      if (!url) throw new Error(data?.msg || "PDF not received");

      newTab.location.href = url;
    } catch (error) {
      newTab?.close();
      console.error("Error printing labour helper:", error);
      Swal.fire("Error", error?.message || "Failed to load PDF", "error");
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.LABOUR_HELPER_MASTER"
              defaultMessage="Labour Helper"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_LABOUR_HELPER",
                  defaultMessage: "Search Labour Helper",
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

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRow(null);
                  setIsModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddLabourhelper
          isOpen={isModalOpen}
          onClose={handleModalClose}
          refreshData={FetchLabourHelper}
          editData={selectedRow?._originalItem}
          categoryList={categoryList}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions, handlePrint)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default Labourhelper;
