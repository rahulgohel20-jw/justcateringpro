import { Fragment, useEffect, useMemo, useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { usePermission } from "@/hooks/usePermission";
import {
  deletePreparationMasterById,
  getAllPreparationMaster,
} from "@/services/apiServices";
import PreparationMasterModal from "./PreparationMasterModal";
import { columns } from "./constant";
import { useModuleAccess } from "../../../hooks/useModuleAccess";

const PreparationMaster = () => {
     const { hasModuleAccess } = useModuleAccess();
    const canAccesspreparation = hasModuleAccess("Preparation Master");

  const permissions = usePermission("Preparation");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userId = Number(localStorage.getItem("userId") || 0);

  const getDisplayName = (item) => {
    const locale = localStorage.getItem("lang") || "en";

    switch (locale) {
      case "hi":
        return item?.nameHindi || item?.nameEnglish || "-";
      case "gu":
        return item?.nameGujarati || item?.nameEnglish || "-";
      default:
        return item?.nameEnglish || "-";
    }
  };

  const fetchData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await getAllPreparationMaster(userId);
      const raw = res?.data?.data?.["Preparation Details"] ?? res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(raw) ? raw : [];

      setTableData(
        list.map((item, index) => ({
          ...item,
          sr_no: index + 1,
          id: item.id,
          name: getDisplayName(item),
          nameEnglish: item.nameEnglish || "",
          nameGujarati: item.nameGujarati || "",
          nameHindi: item.nameHindi || "",
        })),
      );
    } catch (error) {
      console.error("Failed to fetch preparation master:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);



  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this preparation master?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await deletePreparationMasterById(id);
        message.success("Preparation deleted");
        await fetchData();
      } catch (error) {
        console.error("Delete preparation failed:", error);
        message.error("Unable to delete preparation");
      }
    });
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpen(true);
  };

  const dataColumns = useMemo(
    () => columns(handleEdit, handleDelete, permissions, localStorage.getItem("lang") || "en"),
    [permissions, userId],
  );

  return (
    <Fragment>
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl text-gray-900">Preparations Master</h1>

          {permissions.add && (
            <Button
            className="btn btn-primary"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedItem(null);
                setOpen(true);
              }}
            >
              Create New
            </Button>
          )}
        </div>

        <TableComponent
          columns={dataColumns}
          data={tableData}
          paginationSize={10}
          loading={loading}
        />

     <PreparationMasterModal
  open={open}
  onClose={() => {
    setOpen(false);
    setSelectedItem(null);
  }}
  refreshData={fetchData}
  initialValues={selectedItem || {}}
/>
      </Container>
    </Fragment>
  );
};

export default PreparationMaster;
