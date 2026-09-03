import { Fragment, useEffect, useState, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { GetCategoryImg, DeleteCategoryImg  } from "@/services/apiServices";  // ✅ import
import { FormattedMessage, useIntl } from "react-intl";
import { Spin } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import AddCategoryImage from "../../../partials/modals/add-category-image/AddCategoryImage";

const MenuCategoryImage = () => {
  const permissions = usePermission("CategoryImage");
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [allTableData, setAllTableData]     = useState([]);
  const [searchQuery, setSearchQuery]       = useState("");
  const [loading, setLoading]               = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await GetCategoryImg(userId, "");   // pass "" to get all, or true/false to filter
      const list = res?.data?.data || [];
      const mapped = list.map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setAllTableData(mapped);
    } catch (error) {
      console.error("Error fetching category images:", error);
      setAllTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => fetchData();

  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) return allTableData;
    const query = searchQuery.toLowerCase().trim();
    return allTableData.filter((item) =>
      (item.categoryName || "").toLowerCase().includes(query),
    );
  }, [allTableData, searchQuery]);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
  };

  const handleDelete = (id) => {
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
      DeleteCategoryImg(id)
        .then((res) => {
          if (res?.data?.success === true) {
            Swal.fire({
              title: "Deleted!",
              text: res.data.msg || "Category image deleted successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchData();
          } else {
            Swal.fire("Error", res?.data?.msg || "Something went wrong", "error");
          }
        })
        .catch((error) => {
          const msg = error?.response?.data?.msg || "Something went wrong";
          Swal.fire("Error", msg, "error");
        });
    }
  });
};

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <h1 className="test-xl text-gray-900">
           <FormattedMessage
  id="CATEGORY_IMAGE.MASTER"
  defaultMessage="Category Image Master"
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
                  id: "CATEGORY_IMAGE.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Category Image...",
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
                  <FormattedMessage id="COMMON.LOADING" defaultMessage="Loading..." />
                </span>
              </div>
            )}

            {!loading && (
              <span className="text-sm text-gray-600">
               <FormattedMessage
  id="COMMON.SHOWING_RECORDS"
  defaultMessage="Showing {shown} of {total} records"
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
                  setSelectedRecord(null);
                  setIsModalOpen(true);
                }}
                title="Add Category Image"
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

        <AddCategoryImage
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={refreshData}       
          editData={selectedRecord}
          deleteData={selectedRecord}
        />

        <TableComponent
          columns={columns(handleEdit,handleDelete, handleView, permissions, )}
          data={filteredTableData}
          loading={loading}
          pagination={false}
        />
      </Container>
    </Fragment>
  );
};

export default MenuCategoryImage;