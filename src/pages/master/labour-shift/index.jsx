import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllLabourShift,
  deleteLabourShiftById,
} from "@/services/apiServices";
import useStyle from "./style";
import AddLabourshift from "@/partials/modals/add-labour-shift/AddLabourshift";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const Labourshiftmaster = () => {
  const permissions = usePermission("Labour Shift");
  const classes = useStyle();
  const intl = useIntl();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedcontactType, setSelectedcontactType] = useState(null);
  const [tableData, setTableData] = useState([]); // filtered data
  const [originalData, setOriginalData] = useState([]); // unfiltered API data
  const [searchQuery, setSearchQuery] = useState("");

  const Id = localStorage.getItem("userId");

  // --------------------------
  // 🔥 Get translated field
  // --------------------------
  const getTranslatedName = (item) => {
    switch (intl.locale) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  // --------------------------
  // 🔥 Format data helper
  // --------------------------
  const formatShiftData = (shifts) => {
    return shifts.map((shift, index) => ({
      sr_no: index + 1,
      shift_name: getTranslatedName(shift),
      shift_time: shift.shiftTime || "-",
      isActive: shift.isActive !== undefined ? shift.isActive : true,
      id: shift.id,
      nameEnglish: shift.nameEnglish || "",
      nameHindi: shift.nameHindi || "",
      nameGujarati: shift.nameGujarati || "",
       transportationPrice: shift.price ?? "",
    }));
  };

  // Fetch labour shifts from API
  const FetchLabourShift = () => {
    if (!Id) return; // No user logged in

    GetAllLabourShift(Id)
      .then((res) => {
        const shifts = res?.data?.data?.["Function Details"] || [];
        setOriginalData(shifts); // Store raw API data
        setTableData(formatShiftData(shifts)); // Format and set table data
      })
      .catch((error) => {
        console.error("Error fetching labour shifts:", error);
      });
  };

  useEffect(() => {
    FetchLabourShift();
  }, [Id]);

  // --------------------------
  // 🔥 Re-translate when language changes
  // --------------------------
  useEffect(() => {
    if (originalData.length > 0) {
      // If there's an active search, re-apply it with new language
      if (searchQuery.trim()) {
        const filtered = originalData.filter((item) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            (item.nameEnglish &&
              item.nameEnglish.toLowerCase().includes(searchLower)) ||
            (item.nameHindi &&
              item.nameHindi.toLowerCase().includes(searchLower)) ||
            (item.nameGujarati &&
              item.nameGujarati.toLowerCase().includes(searchLower)) ||
            (item.shiftTime &&
              item.shiftTime.toLowerCase().includes(searchLower))
          );
        });
        setTableData(formatShiftData(filtered));
      } else {
        // No search active, just re-format all data
        setTableData(formatShiftData(originalData));
      }
    }
  }, [intl.locale]);

  // --------------------------
  // Search with Debounce
  // --------------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        // Reset to all data, properly formatted
        setTableData(formatShiftData(originalData));
        return;
      }

      // Filter on raw API data
      const filtered = originalData.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (item.nameEnglish &&
            item.nameEnglish.toLowerCase().includes(searchLower)) ||
          (item.nameHindi &&
            item.nameHindi.toLowerCase().includes(searchLower)) ||
          (item.nameGujarati &&
            item.nameGujarati.toLowerCase().includes(searchLower)) ||
          (item.shiftTime && item.shiftTime.toLowerCase().includes(searchLower))
        );
      });

      // Format filtered results
      setTableData(formatShiftData(filtered));
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);
  }, [searchQuery, originalData, intl.locale]);

  // Delete shift
  const DeleteShift = (shiftId) => {
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
        deleteLabourShiftById(shiftId)
          .then((response) => {
            if (
              response &&
              (response.success ||
                response.status === 200 ||
                response?.data?.success === true)
            ) {
              FetchLabourShift();
              Swal.fire({
                title: "Removed!",
                text: "Shift has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting shift:", error);
          });
      }
    });
  };

  // Edit shift
  const handleEdit = (shift) => {
    setSelectedcontactType(shift);
    setIsContactModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.LABOUR_SHIFT_MASTER"
              defaultMessage="Labour Shift Master"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_SHIFT",
                  defaultMessage: "Search Shift",
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
                  setSelectedcontactType(null);
                  setIsContactModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_SHIFT"
                  defaultMessage="Create New "
                />
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <AddLabourshift
          isOpen={isContactModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchLabourShift}
          shiftData={selectedcontactType}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, DeleteShift, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default Labourshiftmaster;
