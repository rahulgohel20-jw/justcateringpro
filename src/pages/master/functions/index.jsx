import { Fragment, useEffect, useState } from "react";
import { BadgeDollarSign, FileText, Receipt } from "lucide-react";
import { Tooltip } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { Link } from "react-router-dom";
import { underConstruction } from "@/underConstruction";
import AddFunctionType from "@/partials/modals/add-function-type/AddFunctionType";
import {
  GetAllFunctionsByUserId,
  DeleteFunctionType,
  GetFunctionsByFunctionName,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const FunctionsMaster = () => {
  const permissions = usePermission("Function");
  const classes = useStyle();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalData, setOriginalData] = useState([]);

  const intl = useIntl();

  // 🔥 Load language and set up listener for changes
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // 🔥 Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setLang(newLang);
    };

    // Listen for custom language change events
    window.addEventListener("languageChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("languageChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔥 Helper to get function name based on language
  const getFunctionNameByLang = (item) => {
    if (!item) return "-";

    switch (lang) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  const formatData = (apiData) =>
    apiData.map((item, index) => ({
      sr_no: index + 1,
      id: item.id,
      function_name: getFunctionNameByLang(item), // 🔥 Language-based name
      start_time: item.startTime,
      end_time: item.endTime,
      // Store all language versions for editing
      nameEnglish: item.nameEnglish,
      nameHindi: item.nameHindi,
      nameGujarati: item.nameGujarati,
      proforma_invoice: (
        <Tooltip
          className="cursor-pointer"
          title={intl.formatMessage({
            id: "USER.MASTER.PROFORMA_INVOICE",
            defaultMessage: "Proforma Invoice",
          })}
        >
          <div
            className="flex justify-center items-center w-full"
            onClick={underConstruction}
          >
            <FileText className="w-5 h-5 text-primary" />
          </div>
        </Tooltip>
      ),
      invoice: (
        <Link to="/invoice-dashboard">
          <Tooltip
            className="cursor-pointer"
            title={intl.formatMessage({
              id: "USER.MASTER.INVOICE",
              defaultMessage: "Invoice",
            })}
          >
            <div className="flex justify-center items-center w-full">
              <Receipt className="w-5 h-5 text-success" />
            </div>
          </Tooltip>
        </Link>
      ),
      quotation: (
        <Link to="/quotation">
          <Tooltip
            className="cursor-pointer"
            title={intl.formatMessage({
              id: "USER.MASTER.QUOTATION",
              defaultMessage: "Quotation",
            })}
          >
            <div className="flex justify-center items-center w-full">
              <BadgeDollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </Tooltip>
        </Link>
      ),
    }));

  const fetchFunctions = () => {
    const Id = JSON.parse(localStorage.getItem("userId"));

    GetAllFunctionsByUserId(Id)
      .then((res) => {
        const list = res?.data?.data?.["Function Details"] || [];
        const formatted = formatData(list);

        setOriginalData(formatted);
        setTableData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching functions:", err);
        setOriginalData([]);
        setTableData([]);
      });
  };

  // ✅ Initial load - fetch all (re-fetch when language changes)
  useEffect(() => {
    fetchFunctions();
  }, [lang]); // 🔥 Re-fetch when language changes

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) {
        setTableData(originalData);
        return;
      }

      const normalize = (str = "") =>
        str.toLowerCase().replace(/[\s.,()\-]/g, "");

      const filtered = originalData.filter((item) =>
        normalize(item.function_name).includes(normalize(query)),
      );

      setTableData(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, originalData]);

  // ✅ Debounced search (auto search after typing stops)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFunctions(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]); // Don't include lang here to avoid duplicate calls

  const handleModalClose = () => {
    setIsMemberModalOpen(false);
    setSelectedFunction(null);
  };

  const handleSuccess = () => {
    fetchFunctions(searchTerm);
    handleModalClose();
  };

  const handleEdit = (func) => {
    setSelectedFunction(func);
    setIsMemberModalOpen(true);
  };

  const handleDelete = (functionId) => {
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
        DeleteFunctionType(functionId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              fetchFunctions(searchTerm);
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.MASTER.FUNCTION_DELETE_SUCCESS",
                  defaultMessage: "Function has been removed successfully.",
                }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting function:", error);
          });
      }
    });
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.FUNCTIONS"
              defaultMessage="Functions Master"
            />
          </h1>
        </div>

        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_FUNCTION",
                  defaultMessage: "Search Function",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedFunction(null);
                  setIsMemberModalOpen(true);
                }}
                title={intl.formatMessage({
                  id: "USER.MASTER.ADD_FUNCTION",
                  defaultMessage: "Add Function",
                })}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <AddFunctionType
          isOpen={isMemberModalOpen}
          selectedFunction={selectedFunction}
          paginationSize={10}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default FunctionsMaster;
