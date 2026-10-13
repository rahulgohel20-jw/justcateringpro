import { Fragment, useCallback, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { GetAllNormalPO, DeleteNormalPO } from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import { columns } from "./constant";

// API date → dd/MM/yyyy (handles "yyyy-MM-dd" and already formatted "dd/MM/yyyy")
const toDisplayDate = (d) => {
  if (!d) return "";
  const s = String(d).split("T")[0];
  return s.includes("-") ? s.split("-").reverse().join("/") : s;
};

const NormalPO = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const permissions = usePermission("Normal PO"); // ← change to your real module name
  const userId = localStorage.getItem("userId");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tableKey, setTableKey] = useState(0); // bump to force a refetch

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Server-side pagination (same contract as the Purchase list).
  // GetAllNormalPO takes (id, size, page, searchName).
  const handleFetchData = useCallback(
    async ({ pageIndex, pageSize }) => {
      const res = await GetAllNormalPO(
        userId,
        pageSize,
        pageIndex,
        debouncedSearch,
      );
      const payload = res?.data;
      const rows = (payload?.data || []).map((item, index) => ({
        ...item,
        sr_no: pageIndex * pageSize + index + 1,
        normalPoId: item.id,
        voucher: item.pocode || item.voucher || "",
        podate: toDisplayDate(item.podate),
      }));
      return { data: rows, totalCount: payload?.totalElements ?? 0 };
    },
    [userId, debouncedSearch],
  );

  const handleEdit = (item) =>
    navigate("/stock-management/normal-po/add", { state: { editData: item } });

  const handleDelete = (item) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Normal PO will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await DeleteNormalPO(item.normalPoId);
        if (res?.data?.success === false) {
          await Swal.fire({
            icon: "error",
            title: "Cannot Delete",
            text: res?.data?.msg || "Failed to delete Normal PO.",
            confirmButtonColor: "#d33",
          });
        } else {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: res?.data?.msg || "Normal PO deleted.",
            confirmButtonColor: "#16a34a",
          });
        }
        setTableKey((k) => k + 1);
      } catch (error) {
        console.error("Delete failed:", error);
        await Swal.fire({
          icon: "error",
          title: "Cannot Delete",
          text:
            error?.response?.data?.msg ||
            "Failed to delete Normal PO. Please try again.",
          confirmButtonColor: "#d33",
        });
        setTableKey((k) => k + 1);
      }
    });
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.NORMAL_PO.TITLE"
              defaultMessage="Normal PO"
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
                  id: "USER.NORMAL_PO.SEARCH",
                  defaultMessage: "Search Normal PO",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {permissions.add && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/stock-management/normal-po/add")}
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="USER.NORMAL_PO.ADD"
                defaultMessage="Add Normal PO"
              />
            </button>
          )}
        </div>

        <TableComponent
          key={`${debouncedSearch}-${tableKey}`}
          columns={columns(
            permissions.edit ? handleEdit : null,
            permissions.delete ? handleDelete : null,
          )}
          serverSide
          onFetchData={handleFetchData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default NormalPO;