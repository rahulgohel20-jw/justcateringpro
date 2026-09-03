import { Fragment, useEffect, useState, useMemo } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddVenueType from "../../../partials/modals/add-venue-type/AddVenueType";
import {
  GetVenueType,
  DeleteVenueTypeApi,
  UpdateVenueStatusApi,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";

const VenueTypeMaster = () => {
  const permissions = usePermission("Venue");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
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

  const userId = useMemo(() => {
    try {
      const userID = localStorage.getItem("userId");
      return userID;
    } catch (e) {
      console.error("Error parsing userid", e);
      return null;
    }
  }, []);

  // 🔥 Helper to get venue type name based on language
  const getVenueTypeByLang = (venue) => {
    if (!venue) return "-";

    switch (lang) {
      case "hi":
        return venue.nameHindi || venue.nameEnglish || "-";
      case "gu":
        return venue.nameGujarati || venue.nameEnglish || "-";
      default:
        return venue.nameEnglish || "-";
    }
  };

  // 🔥 Helper to validate venue image URL (backend sometimes returns "https://justcatering.innull")
const getValidVenueImg = (img) => {
  if (!img) return "";
  if (img.trim().toLowerCase().endsWith("null")) return "";
  return img;
};

  const fetchVenueTypes = async () => {
    if (!userId) return;

    try {
      const res = await GetVenueType("", userId);
      if (res.data?.data?.["Venue Details"]) {
        const formatted = res?.data?.data["Venue Details"].map(
          (item, index) => ({
            sr_no: index + 1,
            venue_type: getVenueTypeByLang(item), // 🔥 Language-based name
            venueid: item.id,
            isDelete: item.isDelete ?? false,
            isActive: item.isActive ?? false,
            // Store all language versions for editing
            nameEnglish: item.nameEnglish,
            nameHindi: item.nameHindi,
            nameGujarati: item.nameGujarati,
          venueImg: getValidVenueImg(item.venueImg),
          }),
        );

        setTableData(formatted);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching venue types:", error);
      setTableData([]);
    }
  };

  // ✅ Initial load - fetch all (re-fetch when language changes)
  useEffect(() => {
    if (userId) fetchVenueTypes();
  }, [userId, lang]); // 🔥 Re-fetch when language changes

  const handleEdit = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVenue(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const res = await UpdateVenueStatusApi(id, newStatus);

      if (res.data?.success == true) {
        Swal.fire(
          intl.formatMessage({
            id: "USER.MASTER.SUCCESS",
            defaultMessage: "Success",
          }),
          intl.formatMessage({
            id: "USER.MASTER.STATUS_UPDATE_SUCCESS",
            defaultMessage: "Status updated successfully",
          }),
          "success",
        );
        fetchVenueTypes();
      } else {
        Swal.fire(
          intl.formatMessage({
            id: "USER.MASTER.ERROR",
            defaultMessage: "Error",
          }),
          res?.data?.message ||
            intl.formatMessage({
              id: "USER.MASTER.UPDATE_FAILED",
              defaultMessage: "Failed to update",
            }),
          "error",
        );
      }
    } catch (err) {
      Swal.fire(
        intl.formatMessage({
          id: "USER.MASTER.ERROR",
          defaultMessage: "Error",
        }),
        intl.formatMessage({
          id: "USER.MASTER.SOMETHING_WRONG",
          defaultMessage: "Something went wrong",
        }),
        "error",
      );
    }
  };

  const handleDelete = (venue) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage(
        {
          id: "USER.MASTER.DELETE_VENUE_CONFIRM_TEXT",
          defaultMessage: 'Delete venue "{venueName}"?',
        },
        { venueName: venue.venue_type },
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
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
          const res = await DeleteVenueTypeApi(venue.venueid);
          if (res.data?.success === true) {
            Swal.fire(
              intl.formatMessage({
                id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                defaultMessage: "Deleted!",
              }),
              intl.formatMessage({
                id: "USER.MASTER.VENUE_DELETE_SUCCESS",
                defaultMessage: "Venue type has been deleted.",
              }),
              "success",
            );
            fetchVenueTypes();
          } else {
            Swal.fire(
              intl.formatMessage({
                id: "USER.MASTER.FAILED",
                defaultMessage: "Failed",
              }),
              res.data.msg ||
                intl.formatMessage({
                  id: "USER.MASTER.DELETE_FAILED",
                  defaultMessage: "Could not delete",
                }),
              "error",
            );
          }
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire(
            intl.formatMessage({
              id: "USER.MASTER.ERROR",
              defaultMessage: "Error",
            }),
            intl.formatMessage({
              id: "USER.MASTER.DELETE_ERROR",
              defaultMessage: "Something went wrong while deleting.",
            }),
            "error",
          );
        }
      }
    });
  };

  // 🔥 Filter table data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;

    return tableData.filter((item) =>
      item.venue_type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tableData, searchQuery]);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.VENUE_TYPE_MASTER"
              defaultMessage="Venue Master"
            />
          </h1>
        </div>

        {/* Filters & Add Button */}
        <div className="filters flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <i className="ki-filled ki-magnifier text-primary absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                className="input pl-10 pr-4"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_VENUE_TYPE",
                  defaultMessage: "Search Venue Type",
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {permissions.add && (
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={handleAdd}
            >
              <i className="ki-filled ki-plus"></i>
              <FormattedMessage
                id="USER.MASTER.ADD_CONTACT_CATEGORY"
                defaultMessage="Create New "
              />
            </button>
          )}
        </div>

        {/* Modal */}
        <AddVenueType
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={fetchVenueTypes}
          selectedEvent={selectedVenue}
        />

        {/* Table */}
        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            handleStatusChange,
            permissions,
          )}
          data={filteredData || []}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default VenueTypeMaster;
