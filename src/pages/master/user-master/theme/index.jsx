import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  GettemplatebyuserId,
  GetAllThemeByModuleId,
  AssignThemeAdmin,
} from "@/services/apiServices";
import { Check, CheckIcon, EyeIcon } from "lucide-react";
import Swal from "sweetalert2";

const AssignTheme = ({ isModalOpen, setIsModalOpen, userId }) => {
  const [activeTab, setActiveTab] = useState("theme");
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [selectedNameplate, setSelectedNameplate] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [themes, setThemes] = useState([]);
  const [nameplates, setNameplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");

  // Preview states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewPage, setPreviewPage] = useState("frontPage");
  const filteredCategories = categories.filter((cat) =>
    cat.label.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  useEffect(() => {
    if (isModalOpen && userId) {
      fetchCategories();
    }
  }, [isModalOpen, userId]);

  useEffect(() => {
    if (selectedCategory) {
      fetchThemesByCategory();
    }
  }, [selectedCategory, activeTab]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await GettemplatebyuserId(userId);

      if (response?.data?.data) {
        const fetchedCategories = response.data.data.map((item) => ({
          id: item.id || item._id,
          label: item.nameEnglish || item.title || item.category,
        }));

        setCategories(fetchedCategories);

        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThemesByCategory = async () => {
    try {
      setLoadingItems(true);
      const isNameplate = activeTab === "nameplate";

      const response = await GetAllThemeByModuleId(
        isNameplate,
        selectedCategory,
        userId,
      );

      if (response?.data) {
        const items = response.data.data || response.data;

        const mappedItems = items.map((item) => ({
          id: item.id || item._id,
          title: item.name || item.nameEnglish,
          frontPage: item.frontPage || "",
          secondFrontPage: item.secondFrontPage || "",
          watermark: item.watermark || "",
          lastMainPage: item.lastMainPage || "",
          templateMappingId: item?.templateMapping?.id || 0,
          templateModuleMasterId: item?.templateModuleMaster?.id || 0,
          isSelected: item.isSelected === true,
        }));

        isNameplate ? setNameplates(mappedItems) : setThemes(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
      isNameplate ? setNameplates([]) : setThemes([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTheme([]);
    setSelectedNameplate([]);
  };

  const toggleSelectItem = (item) => {
    if (item.isSelected) return; // Already assigned

    const isTheme = activeTab === "theme";
    const setter = isTheme ? setSelectedTheme : setSelectedNameplate;

    setter((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  };

  const currentItems = activeTab === "theme" ? themes : nameplates;
  const filteredItems = currentItems.filter((item) =>
    item.title?.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  const selectedItems =
    activeTab === "theme" ? selectedTheme : selectedNameplate;

  const handleSave = async () => {
    // ✅ FIX: Use correct state variables
    const ids = activeTab === "theme" ? selectedTheme : selectedNameplate;

    if (!ids.length) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: `Please select at least one ${activeTab === "theme" ? "theme" : "nameplate"}.`,
      });
      return;
    }

    // ✅ Build payload matching API format
    const payload = ids.map((id) => {
      const item = currentItems.find((x) => x.id === id);

      return {
        templateMasterId: item?.id || 0,
        templateModuleMasterId: item?.templateModuleMasterId || 0,
        userId: userId,
      };
    });

    try {
      setAssignLoading(true);

      const res = await AssignThemeAdmin(payload);

      if (res.data?.success === true) {
        Swal.fire({
          icon: "success",
          title: "Assigned Successfully",
          text: `${
            activeTab === "theme" ? "Themes" : "Nameplates"
          } assigned to user successfully.`,
          confirmButtonColor: "#3085d6",
        });

        // Reset and close
        setIsModalOpen(false);
        setSelectedTheme([]);
        setSelectedNameplate([]);

        // Optionally refetch to update isSelected status
        if (selectedCategory) {
          fetchThemesByCategory();
        }
      } else {
        throw new Error("Assignment failed");
      }
    } catch (error) {
      console.error("AssignThemeAdmin failed:", error);

      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <>
      {isModalOpen && (
        <CustomModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Select Exclusive Design"
          width={900}
          footer={null}
        >
          {/* Tabs */}
          <div className="flex border-b mb-4">
            {["theme", "nameplate"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab ? "bg-primary text-white" : "text-gray-600"
                }`}
              >
                {tab === "theme" ? "Themes" : "Nameplates"}
              </button>
            ))}
          </div>

          <div className="flex flex-row gap-4">
            {/* Category Filter */}
            {activeTab === "theme" && (
              <div className="relative mb-4 w-64">
                {/* Selected value */}
                <button
                  type="button"
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="w-full px-3 py-2 border rounded text-left bg-white flex justify-between items-center"
                  disabled={loading}
                >
                  <span>
                    {categories.find((c) => c.id === selectedCategory)?.label ||
                      "Select Category"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>

                {/* Dropdown */}
                {categoryOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-lg">
                    {/* Search input */}
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full px-3 py-2 border-b outline-none text-sm"
                    />

                    {/* List */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredCategories.length ? (
                        filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                              setCategoryOpen(false);
                              setCategorySearch("");
                            }}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-primary hover:text-white
                  ${selectedCategory === cat.id ? "bg-primary text-white" : ""}
                `}
                          >
                            {cat.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No category found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4 w-64">
              <input
                type="text"
                placeholder={`Search ${activeTab === "theme" ? "theme" : "nameplate"}...`}
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="max-h-[55vh] overflow-y-auto">
            {loadingItems ? (
              <div className="h-60 flex items-center justify-center">
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectItem(item)}
                    className={`relative border rounded-lg overflow-hidden transition
                      ${
                        item.isSelected
                          ? "opacity-50 cursor-not-allowed bg-gray-100"
                          : "cursor-pointer hover:shadow-md"
                      }
                      ${
                        selectedItems.includes(item.id)
                          ? "border-primary ring-2 ring-primary"
                          : "border-gray-200"
                      }
                    `}
                  >
                    {/* Eye Icon */}
                    <button
                      disabled={item.isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.isSelected) return;
                        setPreviewItem(item);
                        setPreviewPage("frontPage");
                        setPreviewOpen(true);
                      }}
                      className={`absolute top-2 left-2 z-10 p-2 rounded-full shadow
                        ${
                          item.isSelected
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-white hover:bg-gray-100"
                        }
                      `}
                    >
                      <EyeIcon className="text-primary w-4 h-4" />
                    </button>

                    {/* Selected Checkmark */}
                    {selectedItems.includes(item.id) && (
                      <div className="absolute top-2 right-2 z-10 bg-success text-white rounded-full w-7 h-7 flex items-center justify-center shadow">
                        <CheckIcon className="w-4 h-4" />
                      </div>
                    )}

                    <img
                      src={item.frontPage}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />

                    <div className="p-2 text-center text-sm font-medium bg-white">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={selectedItems.length === 0 || assignLoading}
              className="px-4 py-2 bg-primary text-white rounded disabled:opacity-60"
            >
              {assignLoading
                ? "Assigning..."
                : `Assign ${activeTab === "theme" ? "Theme" : "Nameplate"}`}
            </button>
          </div>
        </CustomModal>
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && previewItem && (
        <CustomModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`${previewItem.title} Preview`}
          width={900}
          footer={null}
        >
          <div className="flex gap-2 mb-4 flex-wrap">
            {["frontPage", "secondFrontPage", "watermark", "lastMainPage"].map(
              (page) =>
                previewItem[page] && (
                  <button
                    key={page}
                    onClick={() => setPreviewPage(page)}
                    className={`px-3 py-1 rounded text-sm ${
                      previewPage === page ? "bg-primary text-white" : "border"
                    }`}
                  >
                    {page.replace(/([A-Z])/g, " $1")}
                  </button>
                ),
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded flex justify-center">
            <img
              src={previewItem[previewPage]}
              alt="Preview"
              className="max-h-[70vh] bg-white shadow object-contain"
            />
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default AssignTheme;
