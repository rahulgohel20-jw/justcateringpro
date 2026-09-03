import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetAllGuest, DeleteGuestById } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddGuestModal from "../../../partials/modals/add-guest/AddGuestModal";

const GuestMaster = () => {
  const permissions = usePermission("Guest");
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang") || "en";

  const getNameByLang = (item) => {
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

  const formatGuestData = (list) => {
    return list.map((item, index) => ({
      sr_no: index + 1,
      name: getNameByLang(item),
      contactNo: item.contactNo || "-",
      email: item.email || "-",

      // full object for edit
      id: item.id,
      nameEnglish: item.nameEnglish,
      nameHindi: item.nameHindi,
      nameGujarati: item.nameGujarati,
      contactNoRaw: item.contactNo,
      emailRaw: item.email,
      userId: item.userId,
      birthDate: item.birthDate,           
    aniversaryDate: item.aniversaryDate
    }));
  };

  const FetchGuest = () => {
    GetAllGuest(Id)
      .then((res) => {
        const list = res?.data?.data || [];
        setTableData(formatGuestData(list));
      })
      .catch((error) => {
        console.error("Error fetching guest:", error);
        setTableData([]);
      });
  };

  useEffect(() => {
    FetchGuest();
  }, [lang]);

  // ✅ Debounced search (client-side filter — no dedicated search API yet)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchGuest();
        return;
      }

      GetAllGuest(Id)
        .then((res) => {
          const list = res?.data?.data || [];
          const term = searchQuery.toLowerCase();
          const filtered = list.filter(
            (item) =>
              (item.nameEnglish || "").toLowerCase().includes(term) ||
              (item.nameHindi || "").toLowerCase().includes(term) ||
              (item.nameGujarati || "").toLowerCase().includes(term) ||
              (item.contactNo || "").toLowerCase().includes(term) ||
              (item.email || "").toLowerCase().includes(term),
          );
          setTableData(formatGuestData(filtered));
        })
        .catch((error) => {
          console.error("Error searching guest:", error);
          setTableData([]);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, lang]);

  const handleDeleteGuest = (guestId) => {
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
        DeleteGuestById(guestId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data?.success === true)
            ) {
              FetchGuest();
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.MASTER.GUEST_DELETE_SUCCESS",
                  defaultMessage: "Guest has been removed successfully.",
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
            console.error("Error deleting guest:", error);
          });
      }
    });
  };

  const handleEdit = (row) => {
    setSelectedGuest(row);
    setIsGuestModalOpen(true);
  };

  const handleModalClose = () => {
    setIsGuestModalOpen(false);
    setSelectedGuest(null);
  };

  return (
    <Fragment>
      <Container>
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.FOOD_TASTING_GUEST_MASTER"
              defaultMessage="Food Tasting Guest Master"
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
                  id: "USER.MASTER.SEARCH_GUEST",
                  defaultMessage: "Search Guest",
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
                  setSelectedGuest(null);
                  setIsGuestModalOpen(true);
                }}
                title={intl.formatMessage({
                  id: "USER.MASTER.ADD_GUEST",
                  defaultMessage: "Add Guest",
                })}
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

        <AddGuestModal
          isModalOpen={isGuestModalOpen}
          setIsModalOpen={handleModalClose}
          refreshData={FetchGuest}
          selectedGuest={selectedGuest}
        />

        <TableComponent
          columns={columns(handleEdit, handleDeleteGuest, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default GuestMaster;