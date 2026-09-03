import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetModuleRights,
  DeleteModuleRights,
  updatestatusrawmaterialtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddModuleRight from "../../../../partials/modals/add-module-right/AddModuleRight";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";

const RightsModule = () => {
  const permissions = usePermission("Module Right Name");
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [selectedRawCategory, setSelectedRawCategory] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);

  let userId = localStorage.getItem("userId");
  let language = localStorage.getItem("lang");

  const FetchModuleName = () => {
    GetModuleRights()
      .then((res) => {
        const templateList = res?.data.data || [];

        setRawOriginalData(templateList);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    FetchModuleName();
  }, []);

  useEffect(() => {
    const languageMap = {
      en: "name",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "name";

    // Apply Search Filter
    const filteredData = rawOriginalData.filter((item) =>
      item[field]?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const mapped = filteredData.map((item, index) => ({
      sr_no: index + 1,
      name: item[field] || "-",
      rawid: item.id,
      isActive: item.isActive,
      createdAt: item.createdAt,
      status: item.isActive,
    }));

    setTableData(mapped);
  }, [rawOriginalData, language, searchQuery]);

  const handleDelete = (rawid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteModuleRights(rawid)
          .then((response) => {
            if (response?.data?.success) {
              FetchModuleName();
              Swal.fire(
                "Removed!",
                "Module Rights deleted successfully.",
                "success",
              );
            }
          })
          .catch((error) => console.error(error));
      }
    });
  };

  const handleStatusChange = async (rawid, currentStatus) => {
    try {
      await updatestatusrawmaterialtype(rawid, !currentStatus);
      FetchModuleName();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleEdit = (event) => {
    setSelectedRawCategory(event);
    setIsRawModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.RAW_MATERIAL_TYPE_TITLE"
                    defaultMessage="Module Right Name Master"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-4 mb-4">
          <input
            className="input border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-64"
            placeholder="Search Template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {permissions.add && (
            <button
              className="btn bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 ml-auto"
              onClick={() => {
                setSelectedRawCategory(null);
                setIsRawModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus"></i> Add Module Name
            </button>
          )}
        </div>

        <AddModuleRight
          isOpen={isRawModalOpen}
          onClose={setIsRawModalOpen}
          refreshData={FetchModuleName}
          rawdata={selectedRawCategory}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            handleStatusChange,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default RightsModule;
