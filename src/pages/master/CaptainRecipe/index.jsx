import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import Addcaptaionmodal from "../../../partials/modals/captainmodal/Addcaptainmodal";
import {
  getallcaptainrecipe,
  getCaptainReceipeById,
  deletecaptainreceipe,
  getsynccaptainrecipe,
} from "@/services/apiServices";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";
import { FormattedMessage, useIntl } from "react-intl";

const CaptainRecipe = () => {
  const intl = useIntl();
  const permissions = usePermission("Captain Recipe");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const userId = localStorage.getItem("userId");
  const [syncingAll, setSyncingAll] = useState(false);

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