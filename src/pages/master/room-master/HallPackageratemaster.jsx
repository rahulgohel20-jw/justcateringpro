import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./Hallconstant";
import {
  Getallhallpackagerate,
  Addupdtaehallpackagerate,
  Deletehallpackagerate,
  Updatestatus,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import HallPackageModal from "../../../partials/modals/add-room/HallPackagemodal";

const HallPackageratemaster = () => {
  const permissions = usePermission("Room");
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [tierSaving, setTierSaving] = useState(false);

  const userId = localStorage.getItem("userId");

  // ─── Format raw API data into table rows ───────────────────────────────
  const formatTierData = (rows) =>
    rows.map((row, index) => ({
      sr_no: index + 1,
      tier_label: row.tierLabel || "-",
      hall_name: row.hallName || "-",
      package_name_english: row.packageName || "-",
      package_name_hindi: row.packageNameHindi || "-",
      package_name_gujarati: row.packageNameGujarati || "-",
      min_guests: row.minGuests,
      price: row.price !== undefined ? row.price : "-",
      tier_sequence: row.tierSequence,
      package_sequence: row.packageSequence,
      isActive: row.isActive !== undefined ? row.isActive : true,
      id: row.id,
      hallId: row.hallId,
      packageId: row.packageId,
      _raw: row,
    }));

  // ─── Fetch all hall package rates ──────────────────────────────────────
  const fetchHallPackageRates = () => {
    if (!userId) return;

    Getallhallpackagerate("", "", "", userId)
      .then((res) => {
        const rows = res?.data?.data?.HallPackages || [];
        setOriginalData(rows);
        setTableData(formatTierData(rows));
      })
      .catch((error) => {
        console.error("Error fetching hall package rates:", error);
      });
  };

  useEffect(() => {
    fetchHallPackageRates();
  }, [userId]);

  // ─── Search with debounce ──────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatTierData(originalData));
        return;
      }

      const searchLower = searchQuery.toLowerCase();
      const filtered = originalData.filter(
        (row) =>
          row.tierLabel && row.tierLabel.toLowerCase().includes(searchLower)
      );

      setTableData(formatTierData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

  // ─── Delete ────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    Swal.fire({
      title: intl.formatMessage({ id: "COMMON.ARE_YOU_SURE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage({ id: "COMMON.CANNOT_REVERT", defaultMessage: "You won't be able to revert this!" }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({ id: "COMMON.YES_DELETE_IT", defaultMessage: "Yes, delete it!" }),
      cancelButtonText: intl.formatMessage({ id: "COMMON.CANCEL", defaultMessage: "Cancel" }),
    }).then((result) => {
      if (result.isConfirmed) {
        Deletehallpackagerate(id)
          .then((response) => {
            const ok =
              response &&
              (response.success ||
                response.status === 200 ||
                response?.data?.success === true);

            if (ok) {
              fetchHallPackageRates();
              Swal.fire({
                title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted!" }),
                text: intl.formatMessage({ id: "HALL.RECORD_DELETED_SUCCESS", defaultMessage: "Record has been deleted successfully." }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              const errorMsg =
                response?.data?.message ||
                response?.message ||
                intl.formatMessage({ id: "HALL.DELETE_FAILED_DEFAULT", defaultMessage: "Delete failed" });
              throw new Error(errorMsg);
            }
          })
          .catch((error) => {
            Swal.fire(
              intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
              error?.message || intl.formatMessage({ id: "HALL.FAILED_DELETE_RECORD", defaultMessage: "Failed to delete the record." }),
              "error"
            );
          });
      }
    });
  };

  // ─── Toggle active status ──────────────────────────────────────────────
  const handleToggleStatus = (id, newStatus) => {
    Updatestatus(id, newStatus)
      .then((response) => {
        if (
          response &&
          (response.success ||
            response.status === 200 ||
            response?.data?.success === true)
        ) {
          fetchHallPackageRates();
          Swal.fire({
            title: intl.formatMessage({ id: "COMMON.UPDATED", defaultMessage: "Updated!" }),
            text: intl.formatMessage({ id: "HALL.STATUS_UPDATED_SUCCESS", defaultMessage: "Status updated successfully." }),
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          const errorMsg =
            response?.data?.message ||
            response?.message ||
            intl.formatMessage({ id: "HALL.STATUS_UPDATE_FAILED_DEFAULT", defaultMessage: "Status update failed" });
          throw new Error(errorMsg);
        }
      })
      .catch((error) => {
        Swal.fire(
          intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
          error?.message || intl.formatMessage({ id: "HALL.FAILED_UPDATE_STATUS", defaultMessage: "Failed to update status." }),
          "error"
        );
      });
  };

  // ─── Open edit modal ───────────────────────────────────────────────────
  const handleEdit = (row) => {
    setSelectedTier(row._raw || row);
    setIsTierModalOpen(true);
  };

  // ─── Open add modal ────────────────────────────────────────────────────
  const handleAddNew = () => {
    setSelectedTier(null);
    setIsTierModalOpen(true);
  };

  // ─── Submit tier form (create or update) ───────────────────────────────
  const handleTierSubmit = async (payload) => {
    setTierSaving(true);
    try {
      const response = await Addupdtaehallpackagerate(payload);
      const ok =
        response &&
        (response.success ||
          response.status === 200 ||
          response?.data?.success === true);

      if (!ok) {
        throw new Error(
          response?.data?.message ||
            intl.formatMessage({ id: "HALL.SAVE_FAILED_DEFAULT", defaultMessage: "Save failed" })
        );
      }

      setIsTierModalOpen(false);
      fetchHallPackageRates();
      Swal.fire({
        title: intl.formatMessage({ id: "COMMON.SAVED", defaultMessage: "Saved!" }),
        text: intl.formatMessage({ id: "HALL.SAVED_SUCCESS", defaultMessage: "Hall package rate saved successfully." }),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving hall package rate:", error);
      Swal.fire(
        intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
        error?.message || intl.formatMessage({ id: "HALL.FAILED_SAVE_RECORD", defaultMessage: "Failed to save the record." }),
        "error"
      );
    } finally {
      setTierSaving(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="HALL.PACKAGE_RATE_MASTER"
              defaultMessage="Hall Package Rate"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "HALL.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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

        <HallPackageModal
          open={isTierModalOpen}
          onClose={() => setIsTierModalOpen(false)}
          initialValues={selectedTier}
          loading={tierSaving}
          onSubmit={handleTierSubmit}
          refreshData={fetchHallPackageRates}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            permissions,
            handleToggleStatus
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default HallPackageratemaster;