import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllBanquetShift,
  DeleteBanquetShift,
  BanquetShiftStatus,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddBanquetShiftModal from "../../../partials/modals/add-banquet-shift/AddBanquetShiftModal";

const BanquetShiftMaster = () => {
  const permissions = usePermission("Banquet Shift");
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = localStorage.getItem("userId");

  // ─── Format raw API data into table rows ───────────────────────────────────
  const formatShiftData = (shifts) =>
    shifts.map((shift, index) => ({
      sr_no: index + 1,
      shift_name: shift.shiftName || "-",
      start_time: shift.startTime || "-",
      end_time: shift.endTime || "-",
      isActive: shift.isActive !== undefined ? shift.isActive : true,
      id: shift.id,
    }));

  // ─── Fetch all banquet shifts ──────────────────────────────────────────────
  const fetchBanquetShifts = () => {
    if (!userId) return;

    GetAllBanquetShift(userId)
      .then((res) => {
        const shifts = res?.data?.data || res?.data || [];
        setOriginalData(shifts);
        setTableData(formatShiftData(shifts));
      })
      .catch((error) => {
        console.error("Error fetching banquet shifts:", error);
      });
  };

  useEffect(() => {
    fetchBanquetShifts();
  }, [userId]);

  // ─── Search with debounce ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatShiftData(originalData));
        return;
      }

      const searchLower = searchQuery.toLowerCase();
      const filtered = originalData.filter(
        (shift) =>
          (shift.shiftName &&
            shift.shiftName.toLowerCase().includes(searchLower)) ||
          (shift.startTime &&
            shift.startTime.toLowerCase().includes(searchLower)) ||
          (shift.endTime && shift.endTime.toLowerCase().includes(searchLower))
      );

      setTableData(formatShiftData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

  // ─── Toggle status ─────────────────────────────────────────────────────────
  const handleStatusChange = (shiftId) => {
    BanquetShiftStatus(shiftId)
      .then((response) => {
        if (
          response &&
          (response.status === 200 || response?.data?.success === true)
        ) {
          fetchBanquetShifts();
          Swal.fire({
            title: "Updated!",
            text: "Shift status has been updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(response?.data?.msg || "Status update failed");
        }
      })
      .catch((error) => {
        console.error("Error toggling banquet shift status:", error);
        Swal.fire("Error!", "Failed to update shift status.", "error");
      });
  };

  // ─── Delete shift ──────────────────────────────────────────────────────────
  const handleDelete = (shiftId) => {
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
        DeleteBanquetShift(shiftId)
          .then((response) => {
            if (
              response &&
              (response.success ||
                response.status === 200 ||
                response?.data?.success === true)
            ) {
              fetchBanquetShifts();
              Swal.fire({
                title: "Deleted!",
                text: "Banquet shift has been deleted successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "Delete failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting banquet shift:", error);
            Swal.fire("Error!", "Failed to delete the shift.", "error");
          });
      }
    });
  };

  // ─── Open edit modal ───────────────────────────────────────────────────────
  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  // ─── Open add modal ────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Page Title */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.BANQUET_SHIFT_MASTER"
              defaultMessage="Banquet Shift Master"
            />
          </h1>
        </div>

        {/* Filters & Actions */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_BANQUET_SHIFT",
                  defaultMessage: "Search Banquet Shift",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Add Button */}
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary" onClick={handleAddNew}>
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <AddBanquetShiftModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          refreshData={fetchBanquetShifts}
          shiftData={selectedShift}
        />

        {/* Data Table */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, handleStatusChange, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default BanquetShiftMaster;