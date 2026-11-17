import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import {
  CashAccountOPBGetByid,
  CashAccountGetAll,
  DeleteCashAccount,
} from "@/services/apiServices";
import Addcashaccount from "../../../../partials/modals/add-cash-account/Addcashaccount";
import { usePermission } from "../../../../hooks/usePermission.js";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const CashAccountsList = () => {
  const permissions = usePermission("CashOPB");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = JSON.parse(localStorage.getItem("userId"));
  const [tableData, setTableData] = useState([]);

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const handleEdit = async (item) => {
    try {
      const res = await CashAccountOPBGetByid(item.id);
      setSelectedBankDetails(res?.data?.data);
      setIsBankModalOpen(true);
    } catch (error) {
      console.log("edit fetch error", error);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: intl.formatMessage({ id: "COMMON.ARE_YOU_SURE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage(
        {
          id: "CASH_ACCOUNT.DELETE_CONFIRM_TEXT",
          defaultMessage: 'Delete "{accountName}"? This cannot be undone.',
        },
        { accountName: item.accountName }
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: intl.formatMessage({
        id: "COMMON.YES_DELETE_IT",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({ id: "COMMON.CANCEL", defaultMessage: "Cancel" }),
    });

    if (!result.isConfirmed) return;

    try {
      const res = await DeleteCashAccount(item.id);

      if (!res?.data?.success) {
        Swal.fire({
          icon: "info",
          title: intl.formatMessage({
            id: "CASH_ACCOUNT.CANNOT_DELETE",
            defaultMessage: "Cannot Delete",
          }),
          text:
            res?.data?.msg ||
            intl.formatMessage({
              id: "CASH_ACCOUNT.CANNOT_DELETE_MSG",
              defaultMessage: "This account cannot be deleted.",
            }),
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted!" }),
        text:
          res?.data?.msg ||
          intl.formatMessage({
            id: "COMMON.DELETED_SUCCESS_MSG",
            defaultMessage: "Deleted successfully",
          }),
        timer: 2000,
        showConfirmButton: false,
      });

      fetchCashAccounts();
    } catch (error) {
      const errMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        intl.formatMessage({
          id: "COMMON.DELETE_FAILED_MSG",
          defaultMessage: "Failed to delete. Please try again.",
        });

      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
        text: errMsg,
      });
    }
  };

  const handleAddNew = () => {
    setSelectedBankDetails(null);
    setIsBankModalOpen(true);
  };

  const fetchCashAccounts = async () => {
    try {
      const res = await CashAccountGetAll(Id, "");
      const list = res?.data?.data || [];
      const mapped = list.map((item) => ({
        id: item.id,
        accountName: item.accountName,
        subTitle: item.description || "-",
        cashType: item.contactType?.nameEnglish || "-",
        openingBalance: Number(item.openingBalance || 0).toFixed(2),
        currentBalance: Number(item.currentBalance || 0).toFixed(2),
        status: item.isActive ? "ACTIVE" : "INACTIVE",
        isPrimary: item.isPrimary === true,
        raw: item,
      }));
      setTableData(mapped);
      setOriginalData(mapped);
      const words = extractDictWords(mapped, ["accountName", "subTitle", "cashType"]);
      setDictWords(words);
    } catch (error) {
      console.log("cash list error", error);
    }
  };

  useEffect(() => {
    fetchCashAccounts();
  }, []);

  // Filter on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTableData(originalData);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = originalData.filter((item) =>
      [item.accountName, item.subTitle, item.cashType].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
    setTableData(filtered);
  }, [searchQuery, originalData]);

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

  // Click outside
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

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900 font-semibold">
            <FormattedMessage
              id="COMMON.CASH_OPB"
              defaultMessage="Cash OPB"
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
                  id: "BANK.SEARCH_BANK_DETAILS",
                  defaultMessage: "Search cash OPB",
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

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
              <button className="btn btn-primary" onClick={handleAddNew}>
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="BANK.ADD_BANK_DETAILS"
                  defaultMessage="Add Cash OPB"
                />
              </button>
            )}
          </div>
        </div>

        <Addcashaccount
          isOpen={isBankModalOpen}
          onClose={setIsBankModalOpen}
          refreshData={fetchCashAccounts}
          bankDetails={selectedBankDetails}
          allBankDetails={tableData}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions, intl, {
            edit: true,
            delete: true,
          })}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default CashAccountsList;
