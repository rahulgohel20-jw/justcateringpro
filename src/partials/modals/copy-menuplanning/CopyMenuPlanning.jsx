import React, { useState, useEffect, useRef } from "react";
import { X, Search, Copy } from "lucide-react";
import { GetAllEventFunction } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const CopyMenuPlanning = ({
  isOpen,
  onClose,
  onCopyFunction,
  currentEventId,
  currentFunctionId,
  mode,
}) => {
  const userId = localStorage.getItem("userId");
  const intl = useIntl();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(null); // only set if the API returns it
  const requestId = useRef(0);

  // wait 400ms after typing stops, then search from page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // reset when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setDebouncedSearch("");
      setSelectedFunction(null);
      setPage(1);
    }
  }, [isOpen]);

  // fetch whenever page, page size or search changes
  useEffect(() => {
    if (isOpen) fetchEventFunctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page, pageSize, debouncedSearch]);

  const fetchEventFunctions = async () => {
    const myId = ++requestId.current; // ignore stale responses
    try {
      setLoading(true);
      const response = await GetAllEventFunction(userId, {
        page,
        size: pageSize,
        search: debouncedSearch,
      });
      if (myId !== requestId.current) return;

      const data = response?.data?.data;
      const eventFunctions = data?.EventFunctions || [];

      // use the API's total pages if present, otherwise guess from a full page
      const tp = data?.totalPages ?? null;
      setTotalPages(tp);
      setHasNext(tp ? page < tp : eventFunctions.length === pageSize);

      const mappedFunctions = eventFunctions
        .filter((func) => func.id !== currentFunctionId)
        .map((func) => ({
          id: func.id,
          eventId: func.eventId,
          eventNo: func.eventNo,
          eventName: func.eventName || "Event",
          eventNameHindi: func.eventNameHindi || "",
          eventNameGujarati: func.eventNameGujarati || "",
          eventNameMarathi: func.eventNameMarathi || "",
          eventNameTamil: func.eventNameTamil || "",
          eventNameTelugu: func.eventNameTelugu || "",
          eventNameMalayalam: func.eventNameMalayalam || "",
          functionType: func.functionName || "Function",
          functionTypeHindi: func.functionNameHindi || "",
          functionTypeGujarati: func.functionNameGujarati || "",
          functionTypeMarathi: func.functionNameMarathi || "",
          functionTypeTamil: func.functionTypeTamil || "",
          functionTypeTelugu: func.functionTypeTelugu || "",
          functionTypeMalayalam: func.functionTypeMalayalam || "",
          date: func.functionStartDateTime?.split(" ")[0] || "",
          time: func.functionStartDateTime?.split(" ")[1] || "",
          startDateTime: func.functionStartDateTime?.split(" ")[0] || "",
          endDateTime: func.functionEndDateTime?.split(" ")[0] || "",
          eventStartDateTime: func.eventStartDateTime || "",
          eventEndDateTime: func.eventEndDateTime || "",
          menuItems: 0,
          customer: func.partyName || "",
          customerHindi: func.partyNameHindi || "",
          customerGujarati: func.partyNameGujarati || "",
          customerMarathi: func.customerMarathi || "",
          customerTamil: func.customerTamil || "",
          customerTelugu: func.customerTelugu || "",
          customerMalayalam: func.customerMalayalam || "",
          partyId: func.partyId || 0,
        }));

      setFunctions(mappedFunctions);
    } catch (err) {
      if (myId !== requestId.current) return;
      console.error("Error fetching functions:", err);
      setFunctions([]);
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "USER.COPY_PLANNING.LOAD_FAILED_TITLE", defaultMessage: "Failed to load functions" }),
        text: intl.formatMessage({ id: "USER.COPY_PLANNING.LOAD_FAILED_TEXT", defaultMessage: "Could not fetch event functions." }),
      });
    } finally {
      if (myId === requestId.current) setLoading(false);
    }
  };

  // Server does the main search. This client filter (function name, party name, date)
  // keeps results correct even if the backend ignores `search`.
  const q = searchTerm.trim().toLowerCase();
  const filteredFunctions = !q
    ? functions
    : functions.filter((func) =>
        [
          func.functionType, func.functionTypeHindi, func.functionTypeGujarati,
          func.functionTypeMarathi, func.functionTypeTamil, func.functionTypeTelugu,
          func.functionTypeMalayalam,
          func.customer, func.customerHindi, func.customerGujarati,
          func.customerMarathi, func.customerTamil, func.customerTelugu,
          func.customerMalayalam,
          func.startDateTime, func.endDateTime,
        ].some((v) => v?.toLowerCase().includes(q)),
      );

  const handleCopyFunction = (func) => {
    setSelectedFunction(func);
    onCopyFunction(func);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="text-black py-3 px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "decor" ? (
                <FormattedMessage id="USER.COPY_PLANNING.DECOR_TITLE" defaultMessage="Copy Decor Planning" />
              ) : (
                <FormattedMessage id="USER.COPY_PLANNING.MENU_TITLE" defaultMessage="Copy Menu Planning" />
              )}
            </h2>
            <p className="text-gray-600 mt-1">
              {mode === "decor" ? (
                <FormattedMessage id="USER.COPY_PLANNING.DECOR_SUBTITLE" defaultMessage="Select a function to copy its decor preparation" />
              ) : (
                <FormattedMessage id="USER.COPY_PLANNING.MENU_SUBTITLE" defaultMessage="Select a function to copy its menu preparation" />
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder={intl.formatMessage({
                id: "USER.COPY_PLANNING.SEARCH_PLACEHOLDER",
                defaultMessage: "Search by function name, party name or date (DD/MM/YYYY)...",
              })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Functions List */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
         ) : functions.length > 0 ? (
            <div className="space-y-4">
              {functions.map((func) => (
                <div
                  key={func.id}
                  className={`border rounded-xl p-2 hover:shadow-lg transition-all cursor-pointer ${
                    selectedFunction?.id === func.id
                      ? "border-primary bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedFunction(func)}
                >
                  <div className="flex flex-col justify-between items-start">
                    <div className="w-full flex justify-between items-start">
                      <h3 className="text-base font-bold text-gray-800">
                        {func.functionType}
                      </h3>
                    </div>
                    <div className="w-full flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <p className="inline-block py-1 text-grey rounded-full text-sm font-medium">
                          <FormattedMessage id="USER.COPY_PLANNING.EVENT_NO" defaultMessage="Event No" /> : {func.eventNo}
                        </p>
                        <p className="inline-block px-3 py-1 text-grey rounded-full text-sm font-medium">
                          <FormattedMessage id="USER.COPY_PLANNING.EVENT_NAME" defaultMessage="Event Name" /> : {func.eventName}
                        </p>
                        <span className="inline-block px-3 py-1 text-grey rounded-full text-sm font-medium">
                          <FormattedMessage id="USER.COPY_PLANNING.PARTY_NAME" defaultMessage="Party Name" /> : {func.customer}
                        </span>
                        <p className="inline-block px-3 py-1 text-grey rounded-full text-sm font-medium">
                          <FormattedMessage
                            id="USER.COPY_PLANNING.DURATION"
                            defaultMessage="From {start} To {end}"
                            values={{ start: func.startDateTime, end: func.endDateTime }}
                          />
                        </p>
                      </div>

                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyFunction(func);
                          }}
                          title={intl.formatMessage({ id: "COMMON.COPY", defaultMessage: "Copy" })}
                          className="p-2 rounded-lg text-base transition-colors flex items-center gap-2"
                        >
                          <Copy
                            size={18}
                            className="text-blue-800 hover:text-blue-400 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {functions.length === 0 && !debouncedSearch ? (
                  <FormattedMessage
                    id="USER.COPY_PLANNING.NO_FUNCTIONS_AVAILABLE"
                    defaultMessage="No other functions available in this event"
                  />
                ) : (
                  <FormattedMessage
                    id="USER.COPY_PLANNING.NO_SEARCH_MATCHES"
                    defaultMessage="No functions found matching your search"
                  />
                )}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with pagination */}
        <div className="border-t p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg px-2 py-1 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>
              <FormattedMessage
                id="USER.COPY_PLANNING.FUNCTIONS_COUNT"
                defaultMessage="{count} {count, plural, one {function} other {functions}} available"
                values={{ count: functions.length }}
              />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page {page}
              {totalPages ? ` of ${totalPages}` : ""}
            </span>
            <button
              disabled={!hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={onClose}
              className="border border-gray-300 rounded-lg px-4 py-1.5 font-medium hover:bg-gray-100 ml-2"
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyMenuPlanning;