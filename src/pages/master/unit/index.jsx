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
  GetUnitById,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const UnitMaster = () => {
  const permissions = usePermission("Unit");
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUnit, setIsLoadingUnit] = useState(false);
  const intl = useIntl();

  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setLang(newLang);
    };

    window.addEventListener("languageChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("languageChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  let Id = localStorage.getItem("userId");

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
              unit: getUnitNameByLang(cust),
              symbol: getSymbolByLang(cust),
              unitId: cust.id,
              isActive: cust.isActive,
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

  useEffect(() => {
    Fetchunit();
  }, [lang]);

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
              unit: getUnitNameByLang(cust),
              symbol: getSymbolByLang(cust),
              unitId: cust.id,
              isActive: cust.isActive,
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
  }, [searchQuery]);

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

  // ✅ Fetch complete unit details by ID when editing
  const handleEdit = async (event) => {
    setIsLoadingUnit(true);
    try {
      const response = await GetUnitById(event.unitId);

      if (
        response?.data?.success &&
        response?.data?.data?.["Unit Details"]?.[0]
      ) {
        const unitDetails = response.data.data["Unit Details"][0];

        // Format the unit data for the form
        const formattedUnit = {
          unitId: unitDetails.id,
          nameEnglish: unitDetails.nameEnglish,
          nameGujarati: unitDetails.nameGujarati,
          nameHindi: unitDetails.nameHindi,
          symbolEnglish: unitDetails.symbolEnglish,
          symbolGujarati: unitDetails.symbolGujarati,
          symbolHindi: unitDetails.symbolHindi,
          isParentUnit: unitDetails.isParentUnit,
          decimalLimit: unitDetails.decimalLimit,
          parentUnit: unitDetails.parentUnit,
          equivalentValue: unitDetails.equivalentValue,
          rangeType: unitDetails.rangeType,
          ranges: unitDetails.ranges || [],
          stepValue: unitDetails.stepValue,
        };

        setSelectedUnit(formattedUnit);
        setIsEventTypeModalOpen(true);
      } else {
        Swal.fire({
          title: intl.formatMessage({
            id: "USER.MASTER.ERROR",
            defaultMessage: "Error!",
          }),
          text: intl.formatMessage({
            id: "USER.MASTER.FETCH_UNIT_FAILED",
            defaultMessage: "Failed to fetch unit details.",
          }),
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
      Swal.fire({
        title: intl.formatMessage({
          id: "USER.MASTER.ERROR",
          defaultMessage: "Error!",
        }),
        text:
          error.message ||
          intl.formatMessage({
            id: "USER.MASTER.FETCH_UNIT_FAILED",
            defaultMessage: "Failed to fetch unit details.",
          }),
        icon: "error",
      });
    } finally {
      setIsLoadingUnit(false);
    }
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
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.UNIT_MASTER"
              defaultMessage="Unit Master"
            />
          </h1>
        </div>

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

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsEventTypeModalOpen(true);
                  setSelectedUnit(null);
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

        {/* Show loading indicator */}
        {isLoadingUnit && (
          <div className="flex justify-center items-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        <AddUnit
          isModalOpen={isEventTypeModalOpen}
          setIsModalOpen={setIsEventTypeModalOpen}
          refreshData={Fetchunit}
          selectedUnit={selectedUnit}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteUnitrow, statusUnit, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default UnitMaster;
