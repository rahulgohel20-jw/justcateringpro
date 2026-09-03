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
// import AddContactType from "@/partials/modals/add-contact-type/AddContactType";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const ContactTypeMaster = () => {
  const classes = useStyle();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedcontactType, setSelectedcontactType] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [originalData, setOriginalData] = useState([]);

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
  }, [lang]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        setTableData(originalData);
        return;
      }

      const normalize = (str) => str.toLowerCase().replace(/[\s.,()\-]/g, "");

      const filtered = originalData.filter((item) =>
        normalize(item.contact_type).includes(normalize(query))
      );

      setTableData(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

  const FetchContactType = () => {
    GetAllContactType(1)
      .then((res) => {
        const formatted = res.data.data["Contact Type Details"].map(
          (cust, index) => ({
            sr_no: index + 1,
            contact_type: getNameByLang(cust),
            contacttypeid: cust.id,
            isActive: cust.isActive,
          })
        );

        setOriginalData(formatted);
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
        <div className="pb-2 mb-3">
          <h1 className="text-xl  text-gray-900">
            <FormattedMessage
              id="USER.MASTER.CONTACT_TYPE_MASTER"
              defaultMessage="Contact Type Master"
            />
          </h1>
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
        </div>

        {/* <AddContactType
          isOpen={isContactModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchContactType}
          contactType={selectedcontactType}
        /> */}

        <TableComponent
          columns={columns(handleEdit, DeleteContactType, statusCategory)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default ContactTypeMaster;
