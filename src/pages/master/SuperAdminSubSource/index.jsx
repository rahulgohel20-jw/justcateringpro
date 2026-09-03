import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import { FormattedMessage } from "react-intl";
import AddSubSource from "../../../partials/modals/add-source/AddSubSource";
import {
  Getallsubsource,
  DeleteLeadsubsource,
  GetAllLeadSource,
  GetLeadSubSourceBysubSourceId, 
} from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission.js";
import Swal from "sweetalert2";

const SuperAdminSubSource = () => {
  const permissions = usePermission("SubSources");

  const [tableData, setTableData] = useState(defaultData);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState("");
     const userId = localStorage.getItem("userId");


  const formatTableData = (data) =>
    data.map((item, index) => ({
      sr_no: index + 1,
      leadSubSourceId: item.leadSubSourceId,
      subSourceName: item.name,
      sourceName: item.leadSource?.sourceName || "",
      leadSourceId: item.leadSource?.leadSourceId || "",
      dateTime: item.dateTime,
      description: item.description,
    }));

  const fetchAllSubSources = async () => {
    try {
      const response = await Getallsubsource(userId);
      const data = response?.data?.data || [];
      setTableData(formatTableData(data));
    } catch (error) {
      console.error("Error fetching sub sources:", error);
    }
  };


  const fetchSubSourcesBySourceId = async (leadSourceId) => {
    try {
      const response = await GetLeadSubSourceBysubSourceId(leadSourceId);

    
      const data = response?.data?.data || response?.data || [];

     

      setTableData(formatTableData(data));
    } catch (error) {
      console.error("Error fetching sub sources by source:", error);
    }
  };

  const fetchAllSources = async () => {
    try {
      const response = await GetAllLeadSource(userId);
      const data = response?.data?.data || [];
      setSourceOptions(
        data.map((item) => ({
          leadSourceId: item.leadSourceId,
          sourceName: item.sourceName,
        })),
      );
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  };

  useEffect(() => {
    fetchAllSources();
  }, []);

  // ✅ Trigger fetch when source filter changes
  useEffect(() => {
    if (selectedSourceId) {
      fetchSubSourcesBySourceId(selectedSourceId);
    } else {
      fetchAllSubSources();
    }
  }, [selectedSourceId]);

  const handleDelete = async (leadSubSourceId) => {
    try {
      const response = await DeleteLeadsubsource(leadSubSourceId);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response?.data?.msg || "Sub Source deleted successfully",
          confirmButtonColor: "#2563eb",
        });
        // ✅ Re-fetch based on current filter
        selectedSourceId
          ? fetchSubSourcesBySourceId(selectedSourceId)
          : fetchAllSubSources();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to delete sub source.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.message || "Failed to delete sub source. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleEdit = (rowData) => {
    setEditData(rowData);
    setIsFontModalOpen(true);
  };

  const filteredData = tableData.filter(
    (item) =>
      item.subSourceName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sourceName?.toLowerCase().includes(search.toLowerCase()),
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
                    defaultMessage="Sub Source Master"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search Sub Sources"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
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
                  defaultMessage="Add Sub Source"
                />
              </button>
            )}
          </div>
        </div>

        <TableComponent
          columns={columns(handleDelete, handleEdit, permissions)}
          data={filteredData}
          paginationSize={10}
        />

        <AddSubSource
          isOpen={isFontModalOpen}
          onClose={(val) => {
            setIsFontModalOpen(val);
            if (!val) setEditData(null);
          }}
          editData={editData}
          onSuccess={() =>
            selectedSourceId
              ? fetchSubSourcesBySourceId(selectedSourceId)
              : fetchAllSubSources()
          } // ✅ respect active filter on success
          sourceOptions={sourceOptions}
        />
      </Container>
    </Fragment>
  );
};

export default SuperAdminSubSource;
