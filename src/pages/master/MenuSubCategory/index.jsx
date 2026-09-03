import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import AddMenuSubCategory from "@/partials/modals/add-menu-sub-category/AddMenuSubCategory";
import {
  GetAllSubCategory,
  DeleteSubCategoryId,
  UpdateSubStatus,
} from "@/services/apiServices";
import { columns } from "./constant";
import { successMsgPopup } from "../../../underConstruction";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const MenuSubCategory = () => {
  const permissions = usePermission("Sub Category");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMenuCategory, setSelectedCategory] = useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);

  const intl = useIntl();

  let Id = localStorage.getItem("userId");

  const FetchSubCategoryData = () => {
      const Id = localStorage.getItem("userId");
    if (!Id) return;
    GetAllSubCategory({ userid: Id, menuSubCategoryName: searchQuery })
      .then((res) => {
        const list = res.data.data["Menu Sub Category Details"] || [];
        setOriginalData(list);
      })
      .catch((error) => console.error("Error fetching sub category:", error));
  };

  const DeleteCategory = (id) => {
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
        DeleteSubCategoryId(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchSubCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Menu Item Sub has been removed successfully.",
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
  const statusSubCategory = (id, status) => {
    UpdateSubStatus(id, status)
      .then((res) => {
        FetchSubCategoryData();
        res.data?.msg && successMsgPopup(res.data.msg);
      })
      .catch((error) => {
        console.error("Error deleting Event type:", error);
      });
  };
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  
  useEffect(() => {
    const delay = setTimeout(() => {
      FetchSubCategoryData();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    let mapped = originalData.map((item, index) => ({
      ...item,
      sr_no: index + 1,
      nameEnglish: item[field] || "-",
      category: item.menuCategory ? item.menuCategory[field] : "-",
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (item) =>
          item[field]?.toLowerCase().includes(q) ||
          item.menuCategory?.[field]?.toLowerCase().includes(q) ||
          item.sequence?.toString().includes(q),
      );
    }

    setTableData(mapped);
  }, [originalData, searchQuery, localStorage.getItem("lang")]);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="test-xl text-gray-900">
            <FormattedMessage
              id="MENU_ITEM_SUB_CATEGORY"
              defaultMessage="Menu Item Sub Category"
            />
          </h1>
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "SEARCH_SUB_CATEGORY",
                  defaultMessage: "Search Sub Category",
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
                  setSelectedCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                title="Add Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="ADD_SUB_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>
        <AddMenuSubCategory
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={FetchSubCategoryData}
          editData={selectedMenuCategory}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            DeleteCategory,
            statusSubCategory,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default MenuSubCategory;
