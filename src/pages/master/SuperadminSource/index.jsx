import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import { FormattedMessage } from "react-intl";
import AddSource from "../../../partials/modals/add-source/AddSource";
import { GetAllLeadSource, DeleteLeadSource } from "@/services/apiServices";
import Swal from "sweetalert2";

const SuperAdminSource = () => {
  const [tableData, setTableData] = useState(defaultData);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchAllSources = async () => {
    try {
      const response = await GetAllLeadSource(userId);
      if (response.data.success) {
        const formatted = response.data.data.map((item, index) => ({
          sr_no: index + 1,
          SourceName: item.sourceName,
          leadSourceId: item.leadSourceId, // ✅ was id, now leadSourceId
        }));
        setTableData(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch lead sources:", error);
    }
  };

  useEffect(() => {
    fetchAllSources();
  }, []);

  const handleDelete = async (leadSourceId) => {
    try {
      const response = await DeleteLeadSource(leadSourceId);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response?.data?.msg || "Source deleted successfully",
          confirmButtonColor: "#2563eb",
        });
        fetchAllSources();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to delete source.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Failed to delete source. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleEdit = (rowData) => {
    setEditData(rowData);
    setIsFontModalOpen(true);
  };

  const filteredData = tableData.filter((item) =>
    item.SourceName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.COUPON_MASTER"
                    defaultMessage="Source Master"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search Sources"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditData(null);
                setIsFontModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="USER.MASTER.ADD_COUPON"
                defaultMessage="Add Source"
              />
            </button>
          </div>
        </div>

        <TableComponent
          columns={columns(handleDelete, handleEdit)}
          data={filteredData}
          paginationSize={10}
        />

        <AddSource
          isOpen={isFontModalOpen}
          onClose={(val) => {
            setIsFontModalOpen(val);
            if (!val) setEditData(null);
          }}
          editData={editData}
          onSuccess={fetchAllSources}
        />
      </Container>
    </Fragment>
  );
};

export default SuperAdminSource;
