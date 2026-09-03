import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetRawType,
  DeleteRawType,
  SearchContactCategory,
  updatestatusrawmaterialtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddRawMaterialType from "@/partials/modals/raw-material-type/AddRawMaterialType";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";

const SuperRawMaterialType = () => {
  const permissions = usePermission("Raw Material");
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [selectedRawCategory, setSelectedRawCategory] = useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);

  useEffect(() => {
    FetchRawTypeCategory();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchRawTypeCategory();
        return;
      }

      SearchContactCategory(searchQuery, Id)
        .then(({ data: { data } }) => {
          if (data && data["Contact Category Details"]) {
            const formatted = data["Contact Category Details"].map(
              (cust, index) => ({
                sr_no: index + 1,
                contact_name: cust.nameEnglish || "-",
                contactid: cust.id,
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
  }, [searchQuery]);

  let userId = localStorage.getItem("userId");
  let language = localStorage.getItem("lang");

  const FetchRawTypeCategory = () => {
    GetRawType(userId)
      .then((res) => {
        const rawList =
          res.data.data["Raw Material Category Type Details"] || [];

        setRawOriginalData(rawList);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    const mapped = rawOriginalData.map((cust, index) => ({
      sr_no: index + 1,
      name: cust[field] || "-",
      rawid: cust.id,
      status: cust.isActive,
    }));

    setTableData(mapped);
  }, [rawOriginalData, language]);

  const DeleteRawMaterialType = (rawid) => {
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
        DeleteRawType(rawid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchRawTypeCategory();
              Swal.fire({
                title: "Removed!",
                text: "Raw Material Type has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting Event type:", error);
          });
      }
    });
  };
  const statusmenuitem = async (rawid, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await updatestatusrawmaterialtype(rawid, newStatus);

      FetchRawTypeCategory();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (event) => {
    setSelectedRawCategory(event);
    setIsRawModalOpen(true);
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
                    id="USER.MASTER.RAW_MATERIAL_TYPE_TITLE"
                    defaultMessage="Raw Material Type  "
                  />
                ),
              },
            ]}
          />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 `}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.RAW_MATERIAL_TYPE_SEARCH",
                  defaultMessage: "Search...",
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
                  setSelectedRawCategory(null);
                  setIsRawModalOpen(true);
                }}
                title="Add Contact Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                {
                  <FormattedMessage
                    id="USER.MASTER.ADD_RAW_MATERIAL_TYPE"
                    defaultMessage="Add Raw Material Type"
                  />
                }
              </button>
            </div>
          )}
        </div>
        <AddRawMaterialType
          isOpen={isRawModalOpen}
          onClose={setIsRawModalOpen}
          refreshData={FetchRawTypeCategory}
          rawdata={selectedRawCategory}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            DeleteRawMaterialType,
            statusmenuitem,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default SuperRawMaterialType;
