import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetRawMaterialcategory,
  DeleteRawMaterialcategory,
  updatestatusrawmatrialcat,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddRawMaterial from "@/partials/modals/raw-material-category/AddRawMaterial";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const AddRawMaterialCategory = () => {
  const permissions = usePermission("Category");
  const [isconatctModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedRawMaterialCategory, setSelectedRawMaterialCategory] =
    useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);

  useEffect(() => {
    FetchRawMaterialCategory();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchRawMaterialCategory();
        return;
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  let Id = localStorage.getItem("userId");

  const FetchRawMaterialCategory = () => {
    GetRawMaterialcategory(Id)
      .then((res) => {
        const list = res.data.data["Raw Material Category Details"] || [];

        setRawOriginalData(list);
      })
      .catch((error) => {
        console.error("Error fetching raw material category:", error);
      });
  };

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const selectedField = languageMap[language] || "nameEnglish";

    let mapped = rawOriginalData.map((cust, index) => ({
      sr_no: index + 1,
      name: cust[selectedField] || "-",
      rawtype: cust.rawMaterialCatType[selectedField] || "-",
      priority: cust.sequence || "-",
      rawCatid: cust.id,
      rawtypeid: cust.rawMaterialCatType.id || null,
      status: cust.isActive,
      isDirect: cust.isDirect,
    }));

    // 🔍 Apply Search Filter
    if (searchQuery.trim()) {
      mapped = mapped.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.rawtype.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setTableData(mapped);
  }, [rawOriginalData, searchQuery, localStorage.getItem("lang")]);

  const statusmenuitem = async (rawCatid, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await updatestatusrawmatrialcat(rawCatid, newStatus);

      FetchRawMaterialCategory();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const DeleteRawMaterialCat = (rawCatid) => {
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
        DeleteRawMaterialcategory(rawCatid)
          .then((response) => {
          

            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchRawMaterialCategory();
              Swal.fire({
                title: "Removed!",
                text: "Raw material category has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data.msg,
                icon: "error",
                showConfirmButton: true,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting Event type:", error);
          });
      }
    });
  };

  const handleEdit = (event) => {
    setSelectedRawMaterialCategory(event);
    setIsContactModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.RAW_MATERIAL_CATEGORY"
              defaultMessage="Raw Material Category"
            />
          </h1>
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 `}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.RAW_MATERIAL_CATEGORY",
                  defaultMessage: "Raw Material Category",
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
                  setSelectedRawMaterialCategory(null);
                  setIsContactModalOpen(true);
                }}
                title="Add Contact Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                {intl.formatMessage({
                  id: "USER.MASTER.ADD_CONTACT_CATEGORY",
                  defaultMessage: "Create New ",
                })}
              </button>
            </div>
          )}
        </div>
        <AddRawMaterial
          isOpen={isconatctModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchRawMaterialCategory}
          rawMaterialCategory={selectedRawMaterialCategory}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            DeleteRawMaterialCat,
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
export default AddRawMaterialCategory;
