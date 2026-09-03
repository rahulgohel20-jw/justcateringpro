import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import AddUnit from "@/partials/modals/add-unit/AddUnit";
import {
  Getunit,
  DeleteUnit,
  SearchUnit,
  updateunit,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const SuperUnitMaster = () => {
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  let Id = localStorage.getItem("userId");

  // 🔥 Helper to get unit name based on language
  const getUnitNameByLang = (unit) => {
    if (!unit) return "-";

    switch (lang) {
      case "hi":
        return unit.nameHindi || unit.nameEnglish || "-";
      case "gu":
        return unit.nameGujarati || unit.nameEnglish || "-";
      default:
        return unit.nameEnglish || "-";
    }
  };

  // 🔥 Helper to get symbol based on language
  const getSymbolByLang = (unit) => {
    if (!unit) return "-";

    switch (lang) {
      case "hi":
        return unit.symbolHindi || unit.symbolEnglish || "-";
      case "gu":
        return unit.symbolGujarati || unit.symbolEnglish || "-";
      default:
        return unit.symbolEnglish || "-";
    }
  };

  const Fetchunit = () => {
    Getunit(Id)
      .then((res) => {
        if (res?.data?.data?.["Unit Details"]) {
          const formatted = res.data.data["Unit Details"].map(
            (cust, index) => ({
              sr_no: index + 1,
              unit: getUnitNameByLang(cust), // 🔥 Language-based name
              symbol: getSymbolByLang(cust), // 🔥 Language-based symbol
              unitId: cust.id,
              isActive: cust.isActive,
              // Store all language versions for editing
              nameEnglish: cust.nameEnglish,
              nameGujarati: cust.nameGujarati,
              nameHindi: cust.nameHindi,
              symbolEnglish: cust.symbolEnglish,
              symbolHindi: cust.symbolHindi,
              symbolGujarati: cust.symbolGujarati,
            }),
          );

          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching units:", error);
        setTableData([]);
      });
  };

  // ✅ Initial load - fetch all (re-fetch when language changes)
  useEffect(() => {
    Fetchunit();
  }, [lang]); // 🔥 Re-fetch when language changes

  // SEARCH FUNCTION - ✅ Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        Fetchunit();
        return;
      }

      SearchUnit(searchQuery, Id)
        .then(({ data: { data } }) => {
          if (data && data["Unit Details"]) {
            const formatted = data["Unit Details"].map((cust, index) => ({
              sr_no: index + 1,
              unit: getUnitNameByLang(cust), // 🔥 Language-based name
              symbol: getSymbolByLang(cust), // 🔥 Language-based symbol
              unitId: cust.id,
              isActive: cust.isActive,
              // Store all language versions for editing
              nameEnglish: cust.nameEnglish,
              nameHindi: cust.nameHindi,
              nameGujarati: cust.nameGujarati,
              symbolEnglish: cust.symbolEnglish,
              symbolHindi: cust.symbolHindi,
              symbolGujarati: cust.symbolGujarati,
            }));
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => {
          console.error("Error searching unit:", error);
          setTableData([]);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]); // Don't include lang here to avoid duplicate calls

  const DeleteUnitrow = (unitId) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_UNIT_CONFIRM_TEXT",
        defaultMessage: "You want to remove this unit?",
      }),
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      confirmButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_BUTTON",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.MASTER.CANCEL_BUTTON",
        defaultMessage: "Cancel",
      }),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await DeleteUnit(unitId);

          if (
            response &&
            (response.success || response.data.success === true)
          ) {
            Fetchunit();
            Swal.fire({
              title: intl.formatMessage({
                id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                defaultMessage: "Removed!",
              }),
              text: intl.formatMessage({
                id: "USER.MASTER.UNIT_DELETE_SUCCESS",
                defaultMessage: "Unit has been removed successfully.",
              }),
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          } else {
            throw new Error(response?.message || "API call failed");
          }
        } catch (error) {
          console.error("Delete Unit API Error:", error);
          Swal.fire({
            title: intl.formatMessage({
              id: "USER.MASTER.ERROR",
              defaultMessage: "Error!",
            }),
            text:
              error.message ||
              intl.formatMessage({
                id: "USER.MASTER.DELETE_FAILED",
                defaultMessage: "Failed to delete unit.",
              }),
            icon: "error",
            confirmButtonText: intl.formatMessage({
              id: "USER.MASTER.OK_BUTTON",
              defaultMessage: "OK",
            }),
          });
        }
      }
    });
  };

  const handleEdit = (event) => {
    setSelectedUnit(event);
    setIsEventTypeModalOpen(true);
  };

  const statusUnit = (unitId, status) => {
    updateunit(unitId, status)
      .then((res) => {
        if (res.data?.msg || res.data.status === true) {
          Swal.fire({
            title: intl.formatMessage({
              id: "USER.MASTER.SUCCESS",
              defaultMessage: "Success!",
            }),
            text:
              res.data?.msg ||
              intl.formatMessage({
                id: "USER.MASTER.STATUS_UPDATE_SUCCESS",
                defaultMessage: "Status updated successfully",
              }),
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          Fetchunit();
        }
      })
      .catch((error) => {
        console.error("Error updating unit status:", error);
        Swal.fire({
          title: intl.formatMessage({
            id: "USER.MASTER.ERROR",
            defaultMessage: "Error!",
          }),
          text: intl.formatMessage({
            id: "USER.MASTER.STATUS_UPDATE_FAILED",
            defaultMessage: "Failed to update unit status",
          }),
          icon: "error",
          confirmButtonText: intl.formatMessage({
            id: "USER.MASTER.OK_BUTTON",
            defaultMessage: "OK",
          }),
        });
      });
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.UNIT_MASTER"
                    defaultMessage="Unit Master"
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_UNIT",
                  defaultMessage: "Search Unit...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsEventTypeModalOpen(true);
                setSelectedUnit(null);
              }}
              title={intl.formatMessage({
                id: "USER.MASTER.ADD_UNIT",
                defaultMessage: "Add Unit",
              })}
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="USER.MASTER.ADD_UNIT"
                defaultMessage="Add Unit"
              />
            </button>
          </div> */}
        </div>

        <AddUnit
          isModalOpen={isEventTypeModalOpen}
          setIsModalOpen={setIsEventTypeModalOpen}
          refreshData={Fetchunit}
          selectedUnit={selectedUnit}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteUnitrow, statusUnit)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default SuperUnitMaster;
