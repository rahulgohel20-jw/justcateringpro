import { Fragment, useEffect, useState, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import {
  GetAllDecorCategory,
  DeleteDecorCategory,
  UpdateDecorCategoryStatus,
} from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { Spin } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import AddDecorCategoryModal from "../../../partials/modals/add-decor-category/AddDecorCategory";

const DecorCategory = () => {
  const permissions = usePermission("Decor Category");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDecorCategory, setSelectedDecorCategory] = useState(null);
  const [allTableData, setAllTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const intl = useIntl();
  const userId = localStorage.getItem("userId");

  const FetchCategoryData = async () => {
    setLoading(true);
    try {
      const res = await GetAllDecorCategory(userId);
      const list =
        res?.data?.data?.["Decore Main Category Details"] ||
        res?.data?.data ||
        [];
      setOriginalData(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching decor category:", error);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchCategoryData();
  }, []);

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    const mapped = originalData.map((item, index) => ({
      ...item,
      sr_no: index + 1,
      displayName: item[field] || "-",
      nameEnglish: item.nameEnglish || "",
      nameHindi: item.nameHindi || "",
      nameGujarati: item.nameGujarati || "",
      imagePath: item.imagePath || "",
    }));

    setAllTableData(mapped);
  }, [originalData]);

  const filteredTableData = useMemo(() => {
    let data = allTableData;

    if (activeFilter === "active") {
      data = data.filter((item) => item.isActive === true);
    } else if (activeFilter === "inactive") {
      data = data.filter((item) => item.isActive === false);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      data = data.filter((item) => {
        const searchInEnglish = (item.nameEnglish || "")
          .toLowerCase()
          .includes(query);
        const searchInHindi = (item.nameHindi || "")
          .toLowerCase()
          .includes(query);
        const searchInGujarati = (item.nameGujarati || "")
          .toLowerCase()
          .includes(query);
        return searchInEnglish || searchInHindi || searchInGujarati;
      });
    }

    return data;
  }, [allTableData, searchQuery, activeFilter]);

  const deleteDecorCategory = (id) => {
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
        DeleteDecorCategory(id)
          .then((response) => {
            if (response?.data?.success === true) {
              FetchCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Decor Category has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data?.msg || "Failed to delete",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting decor category:", error);
            Swal.fire({
              title: "Error",
              text: error?.response?.data?.msg || "Something went wrong",
              icon: "error",
            });
          });
      }
    });
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = !currentStatus;
    UpdateDecorCategoryStatus(id, newStatus)
      .then((res) => {
        FetchCategoryData();
        if (res.data?.msg) {
          Swal.fire({
            title: "Success!",
            text: res.data.msg,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        Swal.fire({
          title: "Error",
          text: error?.response?.data?.msg || "Failed to update status",
          icon: "error",
        });
      });
  };

  const handleEdit = (category) => {
    setSelectedDecorCategory(category);
    setIsCategoryModalOpen(true);
  };

  const refreshData = () => {
    FetchCategoryData();
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="DECOR_CATEGORY.MASTER"
              defaultMessage="Decor Category Master"
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
                  id: "DECOR_CATEGORY.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Decor Category...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>


            {loading && (
              <div className="flex items-center gap-2 text-primary">
                <Spin size="small" />
                <span className="text-sm">
                  <FormattedMessage
                    id="COMMON.LOADING"
                    defaultMessage="Loading..."
                  />
                </span>
              </div>
            )}

            {!loading && (
              <span className="text-sm text-gray-600">
                <FormattedMessage
                  id="COMMON.SHOWING_CATEGORIES"
                  defaultMessage="Showing {shown} of {total} categories"
                  values={{
                    shown: filteredTableData.length,
                    total: allTableData.length,
                  }}
                />
              </span>
            )}
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDecorCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                title="Add Decor Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddDecorCategoryModal
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={refreshData}
          editData={selectedDecorCategory}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            deleteDecorCategory,
            toggleStatus,
            permissions,
          )}
          data={filteredTableData}
          loading={loading}
          pagination={false}
        />
      </Container>
    </Fragment>
  );
};

export default DecorCategory;
