import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import { GetBankDetails } from "../../../services/apiServices";
import AddBankDetailsModal from "../../../partials/modals/add-bank-details/AddBankDetailsModal";
import { usePermission } from "../../../hooks/usePermission";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const BankDetails = () => {
  const permissions = usePermission("BankDetails");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const intl = useIntl();
  const Id = JSON.parse(localStorage.getItem("userId"));

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const formatBankData = (list) =>
    list.map((bank, index) => ({
      sr_no: index + 1,
      id: bank.id,
      accountHolderName: bank.accountHolderName || "-",
      accountNo: bank.accountNo || "-",
      bankName: bank.bankName || "-",
      branchName: bank.branchName || "-",
      ifscCode: bank.ifscCode || "-",
      upiId: bank.upiId || "-",
      isPrimary: bank.isPrimary || false,
      openingBalance: bank.openingBalance || 0,
      openingDate: bank.openingDate || "-",
      currentBalance: bank.currentBalance || 0,
    }));

  const FetchBankDetails = () => {
    GetBankDetails(Id)
      .then((res) => {
        const list = res?.data?.data || [];
        setOriginalData(list);
        setTableData(formatBankData(list));
        const words = extractDictWords(list, [
          "bankName",
          "accountHolderName",
          "branchName",
        ]);
        setDictWords(words);
      })
      .catch((error) => console.error("Error fetching bank details:", error));
  };

  useEffect(() => {
    FetchBankDetails();
  }, []);

  // Filter on searchQuery
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTableData(formatBankData(originalData));
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = originalData.filter((b) =>
      [b.bankName, b.accountHolderName, b.branchName, b.accountNo, b.ifscCode, b.upiId]
        .some((val) => String(val || "").toLowerCase().includes(q))
    );
    setTableData(formatBankData(filtered));
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

  const handleEdit = (item) => {
    const originalItem = originalData.find((bank) => bank.id === item.id);
    setSelectedBankDetails(originalItem || item);
    setIsBankModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedBankDetails(null);
    setIsBankModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Page Header */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900 font-semibold">
            <FormattedMessage
              id="BANK.BANK_DETAILS_MASTER"
              defaultMessage="Bank Details Master"
            />
          </h1>
        </div>

        {/* Filters and Actions */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Search Input */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "BANK.SEARCH_BANK_DETAILS",
                  defaultMessage: "Search Bank Details",
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

          {/* Add Button */}
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary" onClick={handleAddNew}>
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Add Bank Details"
                />
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <AddBankDetailsModal
          isOpen={isBankModalOpen}
          onClose={setIsBankModalOpen}
          refreshData={FetchBankDetails}
          bankDetails={selectedBankDetails}
          allBankDetails={originalData}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, permissions, intl)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default BankDetails;
