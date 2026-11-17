import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllCustomer,
  DeleteCustomerApi,
  SearchCustomerApi,
  GetAllContactCategory,
  GetPartyMasterByCatId,
  reportpdfforvendorparty,
  reporteexcelforvendorparty,
} from "@/services/apiServices";
import ViewCustomer from "../../../partials/modals/view-customer/ViewCustomer";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import AddVendor from "../../../partials/modals/add-vendor/AddVendor";
import { Select } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import { Modal } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const VendorMaster = () => {
  const permissions = usePermission("Vendor");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const intl = useIntl();
  const userId = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang") || "en";
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  // Exclude contact type ID 2 (Customer)
  const excludedContactTypeIds = [2];

  // ✅ Fixed: reads `fileUrl` from API response
  const handleExcelDownload = async () => {
    try {
      const res = await reporteexcelforvendorparty("vendor", userId);
      const url =
        res?.data?.fileUrl ||
        res?.data?.data?.excel_path ||
        res?.data?.excel_path ||
        null;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "vendors.xlsx";
        link.click();
      } else {
        Swal.fire({ icon: "warning", title: "No file returned from server." });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed to download Excel." });
    }
  };

  // ✅ Fixed: reads `fileUrl` from API response
  const handlePdfView = async () => {
    setPdfUrl(null);
    setPdfLoading(true);
    setIsPdfModalVisible(true);
    try {
      const res = await reportpdfforvendorparty("vendor", userId);
      const url =
        res?.data?.fileUrl ||
        res?.data?.data?.report_path ||
        res?.data?.report_path ||
        null;
      if (url) {
        setPdfUrl(url);
      } else {
        setIsPdfModalVisible(false);
        Swal.fire({ icon: "warning", title: "No PDF returned from server." });
      }
    } catch {
      setIsPdfModalVisible(false);
      Swal.fire({ icon: "error", title: "Failed to generate PDF." });
    } finally {
      setPdfLoading(false);
    }
  };

  const getNameByLang = (cust) => {
    switch (lang) {
      case "hi":
        return cust.nameHindi || cust.nameEnglish || "-";
      case "gu":
        return cust.nameGujarati || cust.nameEnglish || "-";
      default:
        return cust.nameEnglish || "-";
    }
  };

  const getAddressByLang = (cust) => {
    switch (lang) {
      case "hi":
        return cust.addressHindi || cust.addressEnglish || "-";
      case "gu":
        return cust.addressGujarati || cust.addressEnglish || "-";
      default:
        return cust.addressEnglish || "-";
    }
  };

  const getContactTypeByLang = (cust) => {
    if (!cust.contact) return "-";
    switch (lang) {
      case "hi":
        return cust.contact.nameHindi || cust.contact.nameEnglish || "-";
      case "gu":
        return cust.contact.nameGujarati || cust.contact.nameEnglish || "-";
      default:
        return cust.contact.nameEnglish || "-";
    }
  };

  // Extract dict words for suggestions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await GetAllCustomer(userId);
        if (cancelled) return;
        const list = res?.data?.data?.["Party Details"] || [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "customer",
        ]);
        setDictWords(words);
      } catch (err) {
        console.error("Failed to load spelling dictionary:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const words = extractDictWords(tableData, [
        "nameEnglish",
        "nameHindi",
        "nameGujarati",
        "customer",
      ]);
      if (words.length > 0) {
        setDictWords((prev) => Array.from(new Set([...prev, ...words])));
      }
    }
  }, [tableData]);

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

  const FetchAllContactCategory = () => {
    GetAllContactCategory(userId)
      .then(({ data: { data } }) => {
        if (data && data["Contact Category Details"]) {
          const allCategories = data["Contact Category Details"];
          const filteredCategories = allCategories.filter((cat) => {
            const isExcluded = excludedContactTypeIds.includes(
              cat.contactType?.id
            );
            return !isExcluded;
          });
          setCategory(filteredCategories);
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const formatCustomerData = (partyDetails) => {
    const filteredParties = partyDetails.filter((cust) => {
      const contactTypeId = cust.contact?.contactType?.id;
      const isExcluded =
        contactTypeId && excludedContactTypeIds.includes(contactTypeId);
      return !isExcluded;
    });

    return filteredParties.map((cust, index) => ({
      sr_no: index + 1,
      customerid: cust.id,
      customer: getNameByLang(cust),
      address: getAddressByLang(cust),
      contact_type: getContactTypeByLang(cust),
      email: cust.email || "-",
      mobile: cust.mobileno || "-",
      gst: cust.gst || "-",
      birthdate: cust.birthDate || "-",
      document: cust.document || "-",
      altMobileno: cust.altMobileno || "",
      contactCategoryId: cust.contact?.id,
      image: cust.docPath || cust.documentImage || "",
      nameEnglish: cust.nameEnglish,
      nameHindi: cust.nameHindi,
      nameGujarati: cust.nameGujarati,
      addressEnglish: cust.addressEnglish,
      addressHindi: cust.addressHindi,
      addressGujarati: cust.addressGujarati,
      pan: cust.pan,
      opb: cust.opb || "",
      opbDate: cust.opbDate || "",
      type: cust.type || "",
    }));
  };

  const fetchByCategory = (categoryId) => {
    GetPartyMasterByCatId(categoryId, userId)
      .then(({ data: { data } }) => {
        if (data && data["Party Details"]) {
          const formatted = formatCustomerData(data["Party Details"]);
          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) =>
        console.error("Error fetching party by category:", error)
      );
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSearchQuery("");

    if (!value || value === "All") {
      FetchCustomer();
    } else {
      fetchByCategory(value);
    }
  };

  useEffect(() => {
    FetchCustomer();
    FetchAllContactCategory();
  }, [lang]);

  const FetchCustomer = () => {
    GetAllCustomer(userId)
      .then(({ data: { data } }) => {
        if (data && data["Party Details"]) {
          const formatted = formatCustomerData(data["Party Details"]);
          setTableData(formatted);
        }
      })
      .catch((error) => console.error("Error fetching customers:", error));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        if (selectedCategory && selectedCategory !== "All") {
          fetchByCategory(selectedCategory);
        } else {
          FetchCustomer();
        }
        return;
      }

      SearchCustomerApi(searchQuery, userId)
        .then(({ data: { data } }) => {
          if (data && data["Party Details"]) {
            const formatted = formatCustomerData(data["Party Details"]);
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => console.error("Error searching customer:", error));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, lang]);

  const DeleteCustomer = (customerId) => {
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
        DeleteCustomerApi(customerId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data?.success === true)
            ) {
              FetchCustomer();
              Swal.fire({
                title: "Removed!",
                text: "Customer has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Cannot Delete",
                text:
                  response?.data?.msg ||
                  "Vendor is used in Purchase. Please delete it first.",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting customer:", error);
            Swal.fire({
              title: "Cannot Delete",
              text:
                error?.response?.data?.msg ||
                "Something went wrong while deleting customer.",
              icon: "error",
            });
          });
      }
    });
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsMemberModalOpen(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsViewMemberModalOpen(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsMemberModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.VENDOR_MASTER"
              defaultMessage="Vendors"
            />
          </h1>
        </div>

        {/* Search + Filters + Action Buttons */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Left: Search + Category */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_CUSTOMER",
                  defaultMessage: "Search Customer...",
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
            <div>
              <Select
                showSearch
                allowClear
                placeholder="Select Category"
                style={{ width: "100%", height: "38px" }}
                onChange={handleCategoryChange}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  { value: "All", label: "All Category" },
                  ...category.map((cat) => ({
                    value: cat.id,
                    label:
                      lang === "hi"
                        ? cat.nameHindi || cat.nameEnglish
                        : lang === "gu"
                          ? cat.nameGujarati || cat.nameEnglish
                          : cat.nameEnglish,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Right: Excel + PDF + Create New — all grouped together */}
          <div className="flex flex-wrap items-center gap-2">
            {permissions.view && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all duration-200 shadow-sm"
                onClick={handleExcelDownload}
              >
                <i className="ki-filled ki-file-down text-base"></i>
                Excel
              </button>
            )}

            {permissions.view && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-200 shadow-sm"
                onClick={handlePdfView}
              >
                <i className="ki-filled ki-file-sheet text-base"></i>
                PDF
              </button>
            )}
            {permissions.add && (
              <button className="btn btn-primary" onClick={handleAddCustomer}>
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            )}
          </div>
        </div>

        <AddVendor
          isModalOpen={isMemberModalOpen}
          isModalClose={setIsMemberModalOpen}
          setIsModalOpen={setIsMemberModalOpen}
          selectedCustomer={selectedCustomer}
          refreshData={FetchCustomer}
        />

        <ViewCustomer
          isModalOpen={isViewMemberModalOpen}
          setIsModalOpen={setIsViewMemberModalOpen}
          selectedCustomer={selectedCustomer}
        />

        <TableComponent
          columns={columns(
            handleEditCustomer,
            DeleteCustomer,
            handleViewCustomer,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />

        <Modal
          title="Vendor Report"
          open={isPdfModalVisible}
          onCancel={() => {
            setIsPdfModalVisible(false);
            setPdfUrl(null);
          }}
          width="70%"
          footer={null}
          destroyOnClose
        >
          <div style={{ height: "80vh" }}>
            {pdfLoading && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                Generating PDF...
              </div>
            )}
            {pdfUrl && !pdfLoading && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>
      </Container>
    </Fragment>
  );
};

export default VendorMaster;
