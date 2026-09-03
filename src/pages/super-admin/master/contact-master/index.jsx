import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllContactType,
  DeleteContactTypeMaster,
  updateContactTypeStatus,
  SearchContactCategory,
} from "@/services/apiServices";
import useStyle from "./style";
import AddContactType from "@/partials/modals/add-contact-type/AddContactType";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";

const SuperContactTypeMaster = () => {
  const permissions = usePermission("Categories");
  const classes = useStyle();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedcontactType, setSelectedcontactType] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = localStorage.getItem("userId");

  // 🔥 Load language from localStorage
  const lang = localStorage.getItem("lang") || "en";

  // 🔥 Function to get translated name dynamically
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

  useEffect(() => {
    FetchContactType();
  }, [lang]); // 🔥 re-fetch when language changes automatically

  // ------------------ SEARCH FUNCTION ------------------
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchContactType();
        return;
      }

      SearchContactCategory(searchQuery, Id)
        .then(({ data: { data } }) => {
          if (data && data["Contact Type Details"]) {
            const formatted = data["Contact Type Details"].map(
              (cust, index) => ({
                sr_no: index + 1,
                contact_type: getNameByLang(cust),
                contacttypeid: cust.id,
              }),
            );
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => {
          console.error("Error searching customer:", error);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, lang]); // 🔥 also updates search results after language change
  // -----------------------------------------------------

  // ------------------ FETCH CONTACT TYPE ------------------
  const FetchContactType = () => {
    GetAllContactType(Id)
      .then((res) => {
        const formatted = res.data.data["Contact Type Details"].map(
          (cust, index) => ({
            sr_no: index + 1,
            contact_type: getNameByLang(cust),
            contacttypeid: cust.id,
            isActive: cust.isActive,
          }),
        );

        setTableData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching contact types:", error);
      });
  };
  // ---------------------------------------------------------

  const DeleteContactType = (contacttypeid) => {
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
        DeleteContactTypeMaster(contacttypeid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchContactType();
              Swal.fire({
                title: "Removed!",
                text: "Contact type removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting contact type:", error);
          });
      }
    });
  };

  const handleEdit = (event) => {
    setSelectedcontactType(event);
    setIsContactModalOpen(true);
  };

  const statusCategory = (id, status) => {
    updateContactTypeStatus(id, status)
      .then((res) => {
        FetchContactType();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
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
                    id="USER.MASTER.CONTACT_TYPE_MASTER"
                    defaultMessage="Contact Type Master"
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Search + Add */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_CONTACT_TYPE",
                  defaultMessage: "Search Contact Type",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsContactModalOpen(true);
                  setSelectedcontactType(null);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_TYPE"
                  defaultMessage="Add Contact Type"
                />
              </button>
            )}
          </div>
        </div>

        <AddContactType
          isOpen={isContactModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchContactType}
          contactType={selectedcontactType}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            DeleteContactType,
            statusCategory,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default SuperContactTypeMaster;
