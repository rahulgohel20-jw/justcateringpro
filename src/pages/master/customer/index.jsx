import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import AddCustomer from "@/partials/modals/add-customer/AddCustomer";
import {
  GetAllCustomer,
  DeleteCustomerApi,
  SearchCustomerApi,
  reportpdfforvendorparty,
  reporteexcelforvendorparty,
} from "@/services/apiServices";
import ViewCustomer from "../../../partials/modals/view-customer/ViewCustomer";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import { Modal } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const CustomerMaster = () => {
  const permissions = usePermission("Customers");
  const classes = useStyle();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();

  const intl = useIntl();
  const userId = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang") || "en";

  // ✅ Excel download — type: "party", userId from localStorage
  const handleExcelDownload = async () => {
    try {
      const res = await reporteexcelforvendorparty("party", userId);
      const url =
        res?.data?.fileUrl ||
        res?.data?.data?.excel_path ||
        res?.data?.excel_path ||
        null;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "customers.xlsx";
        link.click();
      } else {
        Swal.fire({ icon: "warning", title: "No file returned from server." });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed to download Excel." });
    }
  };

  // ✅ PDF view — type: "party", userId from localStorage
  const handlePdfView = async () => {
    setPdfUrl(null);
    setPdfLoading(true);
    setIsPdfModalVisible(true);
    try {
      const res = await reportpdfforvendorparty("party", userId);
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

  useEffect(() => {
    FetchCustomer();
  }, [lang]);

  const FetchCustomer = () => {
    GetAllCustomer(userId)
      .then(({ data: { data } }) => {
        const allCustomers = data["Party Details"] || [];

        const filtered = allCustomers.filter(
          (cust) =>
            cust.contact?.contactType?.nameEnglish?.toLowerCase() ===
            "customer",
        );

        const formatted = filtered.map((cust, index) => ({
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
          image: cust.documentImage || "",
          nameEnglish: cust.nameEnglish,
          nameHindi: cust.nameHindi,
          nameGujarati: cust.nameGujarati,
          addressEnglish: cust.addressEnglish,
          addressHindi: cust.addressHindi,
          addressGujarati: cust.addressGujarati,
          pan:cust.pan,
          opb: cust.opb || "",
  opbDate: cust.opbDate || "",
  type: cust.type || "",
        }));

        setTableData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchCustomer();
        return;
      }

      SearchCustomerApi(searchQuery, userId)
        .then(({ data: { data } }) => {
          if (data && data["Party Details"]) {
            const formatted = data["Party Details"].map((cust, index) => ({
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
              image: cust.documentImage || "",
              nameEnglish: cust.nameEnglish,
              nameHindi: cust.nameHindi,
              nameGujarati: cust.nameGujarati,
              addressEnglish: cust.addressEnglish,
              addressHindi: cust.addressHindi,
              addressGujarati: cust.addressGujarati,
              pan:cust.pan,
               opb: cust.opb ?? "",        // ← add
  opbDate: cust.opbDate || "", // ← add
  type: cust.type || "",
            }));

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
            const res = response?.data || response;

            // ✅ Success
            if (res.success === true) {
              FetchCustomer();

              Swal.fire({
                title: "Removed!",
                text: res.msg || "Customer has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }

            // ❌ Backend returned failure
            else {
              Swal.fire({
                title: "Cannot Delete",
                text:
                  res.msg ||
                  "Customer already exists in Event. Please delete it first",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting customer:", error);

            Swal.fire({
              title: "Error",
              text: "Something went wrong while deleting customer.",
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
              id="USER.MASTER.CUSTOMER_MASTER"
              defaultMessage="Customer Master"
            />
          </h1>
        </div>

        {/* Search + Action Buttons */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Left: Search */}
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
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
          </div>

          {/* Right: Excel + PDF + Create New */}
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

        <AddCustomer
          isModalOpen={isMemberModalOpen}
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
          title="Customer Report"
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

export default CustomerMaster;
