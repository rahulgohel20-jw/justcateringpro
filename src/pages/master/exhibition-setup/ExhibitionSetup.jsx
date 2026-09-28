import React, { Fragment, useEffect, useState, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import {
  getAllExhibitionSetups,
  addOrUpdateExhibitionSetup,
  deleteExhibitionSetup,
  updateExhibitionSetupStatus,
} from "@/services/apiServices";
import AddExhibitionSetup from "./AddExhibitionSetup";
import Swal from "sweetalert2";

const ExhibitionSetup = () => {
  const intl = useIntl();
  const [tableData, setTableData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear any previously stored local cache
  useEffect(() => {
    try {
      localStorage.removeItem("exhibition_setup_master_cache");
    } catch (e) {}
  }, []);

  const resolveUserId = () => {
    try {
      const raw = localStorage.getItem("userId");
      if (raw && !isNaN(Number(raw))) return Number(raw);
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      if (userObj?.id) return Number(userObj.id);
      const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      if (authStorage?.state?.user?.id) return Number(authStorage.state.user.id);
    } catch (e) {
      console.warn("Could not read userId:", e);
    }
    return 233;
  };

  const mapDetailsToTableData = (detailsList = []) => {
    return detailsList.map((item, index) => {
      const rawFeatures =
        item.features ||
        item.exhibitionSetupFeatures ||
        item.exhibitionSetupItemDetails ||
        item.items ||
        (Array.isArray(item.description) ? item.description : []);

      const itemsList = (Array.isArray(rawFeatures) ? rawFeatures : []).map((f) => ({
        id: f.id || null,
        description: f.description || f.descriptionEnglish || "",
        descriptionEnglish: f.descriptionEnglish || f.description || "",
        descriptionGujarati: f.descriptionGujarati || f.description_gujarati || "",
        descriptionHindi: f.descriptionHindi || f.description_hindi || "",
        description_gujarati: f.descriptionGujarati || f.description_gujarati || "",
        description_hindi: f.descriptionHindi || f.description_hindi || "",
        sortorder: f.sortorder || 1,
      }));

      return {
        sr_no: index + 1,
        id: item.id || 0,
        name: item.nameEnglish || item.headingNameEnglish || item.name || `Setup ${index + 1}`,
        nameEnglish: item.nameEnglish || item.headingNameEnglish || item.name || "",
        nameGujarati: item.nameGujarati || item.headingNameGujarati || "",
        nameHindi: item.nameHindi || item.headingNameHindi || "",
        description: itemsList,
        features: itemsList,
        items: itemsList,
        sortorder: item.sortorder || index + 1,
        isActive: item.isActive ?? true,
        raw: item,
      };
    });
  };

  const fetchExhibitionSetup = async () => {
    setLoading(true);
    const userId = resolveUserId();
    try {
      const res = await getAllExhibitionSetups({ userId, search: searchTerm });
      const rawData = res?.data;

      const list = Array.isArray(rawData?.ExhibitionSetups)
        ? rawData.ExhibitionSetups
        : Array.isArray(rawData?.exhibitionSetups)
        ? rawData.exhibitionSetups
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.details)
        ? rawData.details
        : Array.isArray(rawData?.list)
        ? rawData.list
        : Array.isArray(rawData)
        ? rawData
        : [];

      setAllCategories(list);
      setTableData(mapDetailsToTableData(list));
    } catch (error) {
      console.error("Could not fetch remote exhibition setup:", error);
      setAllCategories([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitionSetup();
  }, [intl.locale]);

  const sanitizeDescription = (text) => {
    if (!text) return "";
    return String(text)
      .replace(/<\/?(div|p|br|span)[^>]*>/gi, " ")
      .replace(/[\r\n]+/g, " ");
  };

  const handleSaveCategory = async (savedCategory, existingItem) => {
    const userId = resolveUserId();
    const payload = {
      id: existingItem?.id && Number(existingItem.id) > 0 ? Number(existingItem.id) : null,
      nameEnglish: savedCategory.headingNameEnglish || savedCategory.nameEnglish || "",
      nameGujarati: savedCategory.headingNameGujarati || savedCategory.nameGujarati || "",
      nameHindi: savedCategory.headingNameHindi || savedCategory.nameHindi || "",
      userId: Number(userId),
      exhibitionSetupFeatures: (savedCategory.items || []).map((it) => ({
        id: it.id && Number(it.id) > 0 ? Number(it.id) : null,
        description: sanitizeDescription(it.descriptionEnglish || it.description || ""),
        description_gujarati: sanitizeDescription(it.descriptionGujarati || it.description_gujarati || ""),
        description_hindi: sanitizeDescription(it.descriptionHindi || it.description_hindi || ""),
        descriptionGujarati: sanitizeDescription(it.descriptionGujarati || it.description_gujarati || ""),
        descriptionHindi: sanitizeDescription(it.descriptionHindi || it.description_hindi || ""),
      })),
    };

    try {
      const res = await addOrUpdateExhibitionSetup(payload);
      Swal.fire({
        icon: "success",
        title: intl.formatMessage({ id: "COMMON.SAVED", defaultMessage: "Saved!" }),
        text: res?.data?.msg || "Exhibition setup saved successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setIsModalOpen(false);
      setSelectedItem(null);
      fetchExhibitionSetup();
    } catch (err) {
      console.error("Save Exhibition Setup error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Failed to save exhibition setup.",
      });
    }
  };

  const handleDelete = async (id, rowData) => {
    const result = await Swal.fire({
      title: intl.formatMessage({ id: "COMMON.CONFIRM_TITLE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage({
        id: "USER_TERMS.DELETE_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "CAPTAIN_RECIPE.YES_DELETE",
        defaultMessage: "Yes, delete it!",
      }),
    });

    if (result.isConfirmed) {
      try {
        if (id && Number(id) > 0) {
          await deleteExhibitionSetup(id);
        }
        Swal.fire({
          title: intl.formatMessage({
            id: "CAPTAIN_RECIPE.DELETED_TITLE",
            defaultMessage: "Deleted!",
          }),
          text: intl.formatMessage({
            id: "USER_TERMS.DELETE_SUCCESS_TEXT",
            defaultMessage: "Your record has been deleted.",
          }),
          icon: "success",
        });
        fetchExhibitionSetup();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || error?.message || "Failed to delete record.",
        });
      }
    }
  };

  const handleToggleStatus = async (id, newStatus, rowData) => {
    // Optimistic UI update
    setTableData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, isActive: newStatus } : row))
    );
    setAllCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isActive: newStatus } : cat))
    );

    try {
      if (id && Number(id) > 0) {
        await updateExhibitionSetupStatus(id, newStatus);
      }
    } catch (err) {
      console.error("Status toggle error:", err);
      // Revert UI on error
      setTableData((prev) =>
        prev.map((row) => (row.id === id ? { ...row, isActive: !newStatus } : row))
      );
      setAllCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, isActive: !newStatus } : cat))
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || err?.message || "Failed to update status.",
      });
    }
  };

  const handleEdit = (rowData) => {
    setSelectedItem(rowData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase();
    return tableData.filter((row) => {
      const matchName =
        row.name?.toLowerCase().includes(term) ||
        row.nameEnglish?.toLowerCase().includes(term) ||
        row.nameGujarati?.toLowerCase().includes(term) ||
        row.nameHindi?.toLowerCase().includes(term);

      const matchDesc = Array.isArray(row.description)
        ? row.description.some((d) => {
            const text =
              typeof d === "string"
                ? d
                : `${d.descriptionEnglish || ""} ${d.descriptionGujarati || ""} ${d.descriptionHindi || ""}`;
            return text.toLowerCase().includes(term);
          })
        : false;

      return matchName || matchDesc;
    });
  }, [tableData, searchTerm]);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs / Page Title */}
        <div className="gpb-2 mb-3">
          <h1 className="text-xl text-gray-900 font-semibold">
            <FormattedMessage
              id="COMMON.EXHIBITION_SETUP"
              defaultMessage="Exhibition Setup"
            />
          </h1>
        </div>

        {/* Filters & Actions Bar */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH",
                  defaultMessage: "Search",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedItem(null);
                setIsModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus"></i>
              <FormattedMessage
                id="COMMON.CREATE_NEW"
                defaultMessage="Create New"
              />
            </button>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AddExhibitionSetup
          isModalOpen={isModalOpen}
          setIsModalOpen={closeModal}
          onSaveCategory={handleSaveCategory}
          selectedItem={selectedItem}
          onFeatureDeleted={fetchExhibitionSetup}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleDelete, handleEdit, intl, handleToggleStatus)}
          data={filteredData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default ExhibitionSetup;
