import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import Addcaptaionmodal from "../../../partials/modals/captainmodal/Addcaptainmodal";
import {
  getallcaptainrecipe,
  getCaptainReceipeById,
  deletecaptainreceipe,
  getsynccaptainrecipe,
  Getgenerateusermenuitemrawmaterialexcel
} from "@/services/apiServices";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";
import { FormattedMessage, useIntl } from "react-intl";
import { Modal, Switch, Button } from "antd";

const CaptainRecipe = () => {
  const intl = useIntl();
  const permissions = usePermission("Captain Recipe");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userId = localStorage.getItem("userId");
  const [syncingAll, setSyncingAll] = useState(false);
const [excelModalOpen, setExcelModalOpen] = useState(false);
const [excelLoading, setExcelLoading] = useState(false);
const [excelOptions, setExcelOptions] = useState({
  isCaptainReceipe: true,
  isCaptainReceipeRawMaterial: true,
});

  const fetchData = () => {
    getallcaptainrecipe(userId, "")
      .then((res) => {
        const list = res?.data?.data || [];
        const mapped = list.map((item, index) => ({
          ...item,
          sr_no: index + 1,
        }));
        setTableData(mapped);
      })
      .catch((err) => console.error("Error fetching captain recipes:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (record) => {
    try {
      const res = await getCaptainReceipeById(record.id, false);
      const fullData = res?.data?.data;
      console.log("edit", fullData);
      setSelectedRecord(fullData);
      setIsCategoryModalOpen(true);
    } catch (err) {
      console.error("Error fetching recipe by id:", err);
    }
  };

  const handleGenerateExcel = async () => {
  if (!excelOptions.isCaptainReceipe && !excelOptions.isCaptainReceipeRawMaterial) {
    Swal.fire("Select an option", "Turn on at least one toggle.", "info");
    return;
  }

  const payload = {
    isCaptainReceipe: excelOptions.isCaptainReceipe,
    isCaptainReceipeRawMaterial: excelOptions.isCaptainReceipeRawMaterial,
    isMenuCategory: false,
    isMenuItem: false,
    isMenuItemRawMaterial: false,
    isRawMaterial: false,
    isRawMaterialCat: false,
    isUnit: false,
  };

  try {
    setExcelLoading(true);
    const res = await Getgenerateusermenuitemrawmaterialexcel(userId, payload);
    const d = res?.data;

    // API answered but reported a failure
    if (d?.success === false) {
      throw new Error(d?.msg || d?.message || "Failed to export Excel.");
    }

    const fileUrl =
      d?.report_path ||
      d?.data?.report_path ||
      d?.excel_path ||
      d?.data?.excel_path ||
      d?.file_path ||
      d?.data?.file_path ||
      d?.url ||
      (typeof d?.data === "string" ? d.data : null);

    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = "Captain_Recipe.xlsx";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExcelModalOpen(false);
    } else {
      console.log("Export response:", d);
      throw new Error(d?.msg || d?.message || "No file URL returned");
    }
  } catch (error) {
    console.error("Export error:", error);
    // show the message that came from the API first
    const apiMsg =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Failed to export Excel.";
    Swal.fire({ title: "Error", text: apiMsg, icon: "error" });
  } finally {
    setExcelLoading(false);
  }
};

  const handleDelete = (id) => {
    Swal.fire({
      title: intl.formatMessage({ id: "COMMON.CONFIRM_TITLE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage({ id: "CAPTAIN_RECIPE.DELETE_CONFIRM_TEXT", defaultMessage: "You won't be able to revert this!" }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({ id: "CAPTAIN_RECIPE.YES_DELETE", defaultMessage: "Yes, delete it!" }),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletecaptainreceipe(id);
          fetchData();
          Swal.fire({
            title: intl.formatMessage({ id: "CAPTAIN_RECIPE.DELETED_TITLE", defaultMessage: "Deleted!" }),
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error("Delete failed:", err);
        }
      }
    });
  };

  const filtered = tableData.filter((item) =>
    (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSyncAll = async () => {
    const result = await Swal.fire({
      title: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_ALL_TITLE", defaultMessage: "Sync All Recipes?" }),
      text: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_ALL_TEXT", defaultMessage: "This will sync all captain recipes with the latest data." }),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({ id: "CAPTAIN_RECIPE.YES_SYNC", defaultMessage: "Yes, Sync!" }),
      cancelButtonText: intl.formatMessage({ id: "COMMON.NO_CANCEL", defaultMessage: "No, Cancel" }),
    });

    if (!result.isConfirmed) return;

    try {
      setSyncingAll(true);
      const res = await getsynccaptainrecipe(userId);
      if (res?.data?.success === true) {
        fetchData();
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNCED_TITLE", defaultMessage: "Synced!" }),
          text: res?.data?.msg || intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_SUCCESS_TEXT", defaultMessage: "All recipes synced successfully." }),
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_FAILED_TITLE", defaultMessage: "Sync Failed" }),
          text: res?.data?.msg || intl.formatMessage({ id: "COMMON.SOMETHING_WENT_WRONG", defaultMessage: "Something went wrong." }),
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error("Sync all failed:", err);
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_FAILED_TITLE", defaultMessage: "Sync Failed" }),
        text: intl.formatMessage({ id: "CAPTAIN_RECIPE.SYNC_ERROR_TEXT", defaultMessage: "Something went wrong while syncing." }),
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage id="CAPTAIN_RECIPE.TITLE" defaultMessage="Captain Recipes" />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
            <input
              className="input pl-8"
              placeholder={intl.formatMessage({ id: "CAPTAIN_RECIPE.SEARCH_PLACEHOLDER", defaultMessage: "Search recipe..." })}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
    className="btn btn-light"
    onClick={() => setExcelModalOpen(true)}
  >
    <i className="ki-filled ki-file-down" /> Excel
  </button>

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={handleSyncAll}
                disabled={syncingAll}
              >
                {syncingAll ? (
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <i className="ki-filled ki-arrows-circle" />
                )}
                {syncingAll ? (
                  <FormattedMessage id="CAPTAIN_RECIPE.SYNCING" defaultMessage="Syncing..." />
                ) : (
                  <FormattedMessage id="CAPTAIN_RECIPE.SYNC_RECIPES" defaultMessage="Sync Recipes" />
                )}
              </button>
            )}

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsCategoryModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus" />{" "}
                <FormattedMessage id="COMMON.CREATE_NEW" defaultMessage="Create New" />
              </button>
            )}
          </div>
        </div>
        <Modal
  title="Export Excel"
  open={excelModalOpen}
  onCancel={() => setExcelModalOpen(false)}
  zIndex={10000}
  getContainer={() => document.body}
  centered
  footer={[
    <Button key="cancel" onClick={() => setExcelModalOpen(false)}>
      Cancel
    </Button>,
    <Button
      key="generate"
      type="primary"
      loading={excelLoading}
      onClick={handleGenerateExcel}
    >
      Generate
    </Button>,
  ]}
  destroyOnClose
>
  <div className="flex flex-col gap-4 py-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">Captain Recipe</span>
      <Switch
        checked={excelOptions.isCaptainReceipe}
        onChange={(v) => setExcelOptions((p) => ({ ...p, isCaptainReceipe: v }))}
      />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">Captain Recipe Raw Material</span>
      <Switch
        checked={excelOptions.isCaptainReceipeRawMaterial}
        onChange={(v) =>
          setExcelOptions((p) => ({ ...p, isCaptainReceipeRawMaterial: v }))
        }
      />
    </div>
  </div>
</Modal>
        <Addcaptaionmodal
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={fetchData}
          editData={selectedRecord}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions, fetchData, intl)}
          data={filtered}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default CaptainRecipe;