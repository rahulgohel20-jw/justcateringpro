import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import {
  GetAllDecorPackage,
  DeleteDecorPackage,
  UpdateDecorPackageStatus,
} from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";

const DecorPackageMaster = () => {
  const permissions = usePermission("Decor Package");
  const classes = useStyle();
  const navigate = useNavigate();
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getTranslatedName = (item) => {
    switch (intl.locale) {
      case "hi": return item.nameHindi || item.nameEnglish || "-";
      case "gu": return item.nameGujarati || item.nameEnglish || "-";
      default:   return item.nameEnglish || "-";
    }
  };

  const formatPackageData = (packages) => {
    return packages.map((pkg, index) => {
      const totalItemsCount =
        pkg.decorePackageDetails?.reduce((sum, cat) => {
          return sum + (cat.items?.length || 0);
        }, 0) || 0;

      return {
        sr_no: index + 1,
        packageid: pkg.id,
        package_name: getTranslatedName(pkg),
        price: pkg.price,
        total_items: totalItemsCount,
        sequence: pkg.sequence,
        isActive: pkg.isActive,
        raw: pkg,
      };
    });
  };

  const fetchPackages = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        Swal.fire("Error", "User ID not found!", "error");
        return;
      }

      const res = await GetAllDecorPackage(userId);
      const allPackages =
        res?.data?.data?.["Decore Package Details"] ||
        res?.data?.data ||
        res?.data ||
        [];

      setOriginalData(allPackages);
      setTableData(formatPackageData(allPackages));
    } catch (err) {
      console.error("Failed to fetch decor packages:", err);
      Swal.fire("Error", "Failed to fetch decor package data.", "error");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (originalData.length > 0) {
      setTableData(formatPackageData(originalData));
    }
  }, [intl.locale]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatPackageData(originalData));
        return;
      }
      const q = searchQuery.toLowerCase();
      const filtered = originalData.filter((pkg) =>
        pkg.nameEnglish?.toLowerCase().includes(q) ||
        pkg.nameHindi?.toLowerCase().includes(q) ||
        pkg.nameGujarati?.toLowerCase().includes(q),
      );
      setTableData(formatPackageData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData, intl.locale]);

  const handleEdit = (id) => {
    navigate(`/master/decor-package/addpackage?id=${id}`);
  };

  const deletePackage = async (packageid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const response = await DeleteDecorPackage(packageid);
        if (
          response?.data?.success === true ||
          response?.success ||
          response?.status === 200
        ) {
          Swal.fire({ title: "Deleted!", text: "Decor package removed successfully.", icon: "success", timer: 1500, showConfirmButton: false });
          await fetchPackages();
        } else {
          Swal.fire({ title: "Delete Failed", text: response?.data?.msg || "Failed to delete package.", icon: "error" });
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: "Error", text: error?.response?.data?.msg || "An error occurred while deleting.", icon: "error" });
      }
    });
  };

  const statusHandler = async (packageid, isActive) => {
    try {
      const response = await UpdateDecorPackageStatus(packageid, isActive);
      if (response?.data?.success === true) {
        await fetchPackages();
        Swal.fire({ title: "Updated!", text: "Status updated successfully", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        throw new Error(response?.data?.msg || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      Swal.fire("Error", error.message || "Failed to update status", "error");
      setTableData((prev) =>
        prev.map((pkg) =>
          pkg.packageid === packageid ? { ...pkg, isActive: !isActive } : pkg,
        ),
      );
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.DECOR_PACKAGE_MASTER"
              defaultMessage="Decor Package Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_PACKAGE",
                  defaultMessage: "Search Package",
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
              onClick={() => navigate("/master/decor-package/addpackage")}
              title="Add Decor Package"
            >
              <i className="ki-filled ki-plus" />
              <FormattedMessage
                id="USER.MASTER.ADD_CONTACT_CATEGORY"
                defaultMessage="Create New"
              />
            </button>
          )}
        </div>

        <TableComponent
          columns={columns(handleEdit, deletePackage, statusHandler, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default DecorPackageMaster;