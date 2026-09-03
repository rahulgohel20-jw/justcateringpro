import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddKitchenArea from "@/partials/modals/add-kitchen-area/AddKitchenArea";
import { GetAllKitchenAreaById } from "@/services/apiServices";
import {
  DeleteKitchenArea,
  UpdateStatusKitchenArea,
} from "../../../services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";

const MenuKitchenArea = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMenuCategory, setSelectedCategory] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    FetchCategoryData();
  }, [searchQuery]);

  let Id = localStorage.getItem("userId");

  const FetchCategoryData = async () => {
    try {
      const res = await GetAllKitchenAreaById(Id);

      let list = Array.isArray(res?.data?.data?.["KitchenAreas Details"])
        ? res.data.data["KitchenAreas Details"]
        : [];

      if (searchQuery.trim()) {
        list = list.filter((item) =>
          item.nameEnglish?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setOriginalData(list);
    } catch (error) {
      console.error("Error fetching kitchen area:", error);
      setOriginalData([]);
    }
  };

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    const mapped = originalData.map((item, index) => ({
      id: item.id,
      sr_no: index + 1,
      category: item[field] || "-",
      createdAt: item.createdAt,
      userName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`,
      plan: item.user?.plan?.name || "-",
      role: item.user?.userBasicDetails?.role?.name || "-",
      isActive: item.isActive ?? item.status ?? false,
      raw: item,
    }));

    setTableData(mapped);
  }, [originalData, localStorage.getItem("lang")]);

  const statusKitchen = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus; // toggle
      const res = await UpdateStatusKitchenArea(id, newStatus);
      FetchCategoryData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const DeleteCategory = async (id) => {
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
        DeleteKitchenArea(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Kitchen Area has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((err) => {
            console.error("Delete error:", err);
          });
      }
    });
  };

  const handleEdit = (categoryRow) => {
    setSelectedCategory(categoryRow.raw);
    setIsCategoryModalOpen(true);
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
                    id="COMMON.KITCHEN_AREA"
                    defaultMessage="Kitchen Area"
                  />
                ),
              },
            ]}
          />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_KITCHEN_AREA",
                  defaultMessage: "Search",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              title="Add Kitchen Area"
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="COMMON.ADD_KITCHEN_AREA"
                defaultMessage="Add Kitchen Area"
              />
            </button>
          </div>
        </div>
        <AddKitchenArea
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={FetchCategoryData}
          selectedMenuCategory={selectedMenuCategory}
        />
        <TableComponent
          columns={columns(handleEdit, DeleteCategory, statusKitchen)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default MenuKitchenArea;
