import { Fragment, useEffect, useState } from "react";
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
    } catch (err) {
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
    } catch (err) {
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

  const formatCustomerData = (customers) =>
    customers
      .filter((cust) => {
        const typeName = cust.contact?.contactType?.nameEnglish?.toLowerCase();
        return typeName !== "customer";
      })
      .map((cust, index) => ({
        sr_no: index + 1,
        customerid: cust.id,
        customer: getNameByLang(cust),
        address: getAddressByLang(cust),
        contact_type: cust.contact.nameEnglish,
        email: cust.email || "-",
        mobile: cust.mobileno || "-",
        gst: cust.gst || "-",
        birthdate: cust.birthDate || "-",
        document: cust.document || "-",
        altMobileno: cust.altMobileno || "",
        image: cust.documentImage || "",
        contactCategoryId: cust?.contact?.id || null,
        nameEnglish: cust.nameEnglish,
        nameHindi: cust.nameHindi,
        nameGujarati: cust.nameGujarati,
        addressEnglish: cust.addressEnglish,
        addressHindi: cust.addressHindi,
        addressGujarati: cust.addressGujarati,
        price: cust.price,
          helperPrice: cust.helperPrice,
      counterPrice: cust.counterPrice,
        type: cust.type,
        opbDate: cust.opbDate,
        opb: cust.opb,
        connectivity: "Connected",
      }));

  const FetchAllContactCategory = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await GetAllContactCategory(userId);
      const data = res.data.data["Contact Category Details"];
      setCategory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchByCategory = async (catId) => {
    try {
      const userid = localStorage.getItem("userId");
      const res = await GetPartyMasterByCatId(catId, userid);
      const data = res?.data?.data?.["Party Details"];
     

      if (data) {
        const filterdata = data.map((cust, index) => ({
          sr_no: index + 1,
          customerid: cust.id,
          customer: getNameByLang(cust),
          address: getAddressByLang(cust),
          contact_type: cust.contact.nameEnglish,
          email: cust.email || "-",
          mobile: cust.mobileno || "-",
          gst: cust.gst || "-",
          birthdate: cust.birthDate || "-",
          document: cust.document || "-",
          altMobileno: cust.altMobileno || "",
          image: cust.documentImage || "",
          contactCategoryId: cust?.contact?.id || null,
          nameEnglish: cust.nameEnglish,
          nameHindi: cust.nameHindi,
          nameGujarati: cust.nameGujarati,
          addressEnglish: cust.addressEnglish,
          addressHindi: cust.addressHindi,
          addressGujarati: cust.addressGujarati,
           helperPrice: cust.helperPrice,
  counterPrice: cust.counterPrice,
          price: cust.price,
          type: cust.type,
          opbDate: cust.opbDate,
          opb: cust.opb,
          connectivity: "Connected",
        }));

        setTableData(filterdata);
      } else {
        setTableData([]);
      }
    } catch (err) {
      console.error("Error fetching by category:", err);
      setTableData([]);
    }
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
              (response.success || response.data.success === true)
            ) {
              FetchCustomer();
              Swal.fire({
                title: "Removed!",
                text: "Customer has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          })
          .catch((error) => console.error("Error deleting customer:", error));
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
              id="COMMON.VENDOR_MASTER"
              defaultMessage="Vendors"
            />
          </h1>
        </div>

        {/* Search + Filters + Action Buttons */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Left: Search + Category */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
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
              />
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
