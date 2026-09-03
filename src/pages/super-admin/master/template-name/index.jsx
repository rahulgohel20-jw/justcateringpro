import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GettemplatebyuserId,
  Deletetemplatebyid,
  updatestatusrawmaterialtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddTemplateName from "../../../../partials/modals/Template-modal/AddTemplateName";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";

const TemplateName = () => {
  const permissions = usePermission("Theme");
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [selectedRawCategory, setSelectedRawCategory] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);

  let userId = localStorage.getItem("userId");
  let language = localStorage.getItem("lang");

  const FetchTemplateName = () => {
    GettemplatebyuserId(userId)
      .then((res) => {
        const templateList = res?.data?.data || [];
        setRawOriginalData(templateList);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    FetchTemplateName();
  }, []);

  useEffect(() => {
    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    // Apply Search Filter
    const filteredData = rawOriginalData.filter((item) =>
      item[field]?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const mapped = filteredData.map((item, index) => ({
      sr_no: index + 1,
      name: item[field] || "-",
      rawid: item.id,
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
        Deletetemplatebyid(rawid)
          .then((response) => {
            if (response?.data?.success) {
              FetchTemplateName();
              Swal.fire(
                "Removed!",
                "Template deleted successfully.",
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
      FetchTemplateName();
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
                    defaultMessage="Template Name Master"
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
              <i className="ki-filled ki-plus"></i> Add Template Name
            </button>
          )}
        </div>

        <AddTemplateName
          isOpen={isRawModalOpen}
          onClose={setIsRawModalOpen}
          refreshData={FetchTemplateName}
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

export default TemplateName;
