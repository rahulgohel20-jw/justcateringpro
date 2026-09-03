import { useState, useEffect } from "react";
import Select from "react-select";

import {
  editSubCategory,
  AddSubCategory,
  Translateapi,
  GetAllCategoryformenu,
} from "@/services/apiServices";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { formValidation } from "../../../lib/utils";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const AddMenuSubCategory = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) => {
  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
  };
  const langConfig = getLangConfig();
  let Userid = localStorage.getItem("userId");
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const requiredFields = ["nameEnglish"];
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const intl = useIntl();

  useEffect(() => {
    if (formData.nameEnglish) {
      if (debounceTimer) clearTimeout(debounceTimer);

      const timer = setTimeout(() => {
        Translateapi(formData.nameEnglish)
  .then((res) => {
    const { regional, hindi } = extractTranslations(res.data);
    setFormData((prev) => ({
      ...prev,
      nameGujarati: regional,
      nameHindi: hindi,
    }));
  })
          .catch((err) => console.error("Translation error:", err));
      }, 500);

      setDebounceTimer(timer);
    }
  }, [formData.nameEnglish]);

  useEffect(() => {
    fetchmenucategory();
  }, []);
  const fetchmenucategory = async () => {
    try {
      const res = await GetAllCategoryformenu(Userid);
      const data = res.data.data["Menu Category Details"] || [];

      const menucategorydata = data.map((item) => ({
        menuid: item.id,
        menuName: item.nameEnglish,
        menunamegujarati: item.nameGujarati,
        menunameHindi: item.nameHindi,
      }));
      setCategoryList(menucategorydata);
    } catch {
      console.log("error");
    }
  };

  const handleSubmit = () => {
    if (checkErrors()) {
      if (!Userid) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      const payload = {
        ...formData,
        menuCatId: selectedCategory,
        userId: Userid,
      };

      if (editData) {
        editSubCategory(editData.id, payload)
          .then((res) => {
            refreshData();
            setIsModalOpen();
            Swal.fire(
              "Success",
              res.data?.msg || "Sub Category updated successfully!",
              "success"
            );
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              error?.response?.data?.msg ||
                "Something went wrong while updating",
              "error"
            );
            console.error("Error editing meal:", error);
          });
      } else {
        AddSubCategory(payload)
          .then((res) => {
            refreshData();
            setIsModalOpen();
            Swal.fire(
              "Success",
              res.data?.msg || "Sub Category added successfully!",
              "success"
            );
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              error?.response?.data?.msg || "Something went wrong while adding",
              "error"
            );
            console.error("Error adding meal:", error);
          });
      }
    }
  };

  const checkErrors = () => {
    let errorObject = formValidation(requiredFields, formData);
    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      return false;
    }
    setErrors({});
    return true;
  };

 useEffect(() => {
  if (editData) {
    setFormData({
      nameEnglish: editData.nameEnglish || "",
      nameGujarati: editData.nameGujarati || "",
      nameHindi: editData.nameHindi || "",
    });
    setSelectedCategory(editData.menuCategory?.id || editData.menuCategory || "");  // ← fix
  } else if (isModalOpen) {
    setFormData(initialFormState);
    setErrors({});
    setSelectedCategory("");
  }
}, [editData, isModalOpen]);

  const categoryOptions = categoryList.map((item) => ({
    value: item.menuid,
    label: `${item.menuName} — ${item.menunamegujarati} — ${item.menunameHindi}`,
  }));

  return (
    <CustomModal
      open={isModalOpen}
      width={1000}
      onClose={() => setIsModalOpen(false)}
      title={
        editData ? (
          <FormattedMessage
            id="EDIT_MENU_SUB_CATEGORY"
            defaultMessage="Edit Menu Sub Category"
          />
        ) : (
          <FormattedMessage
            id="NEW_MENU_SUB_CATEGORY"
            defaultMessage="Create New Menu Sub Category"
          />
        )
      }
      footer={[
        <div className="flex justify-end" key="footer-buttons">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
            onClick={() => setIsModalOpen(false)}
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="btn-primary text-white px-4 py-2 rounded-md"
            onClick={handleSubmit}
          >
            {editData ? (
              <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
            ) : (
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            )}
          </button>
        </div>,
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="md:col-span-2">
    <MultiLangInputBox
      formData={formData}
      setFormData={setFormData}
      cols={3}
      keys={{
        english: "nameEnglish",
        regional: "nameGujarati",
        hindi: "nameHindi",
      }}
      label={intl.formatMessage({ id: "COMMON.NAME", defaultMessage: "Name" })}
      error={errors.nameEnglish}
      required
    />
  </div>
      <div className="flex flex-col">
  <label className="text-[#6A7C94] text-base font-medium mb-1">
    {intl.formatMessage({ id: "MENU_CATEGORY", defaultMessage: "Menu Category" })}
    <span className="text-red-500 ml-1">*</span>
  </label>
  <Select
    options={categoryOptions}
    value={categoryOptions.find((opt) => opt.value === selectedCategory) || null}
    onChange={(selected) => {
      setSelectedCategory(selected?.value || "");
      setErrors((prev) => ({ ...prev, selectedCategory: "" }));
    }}
    isSearchable
    isClearable
    placeholder="Select Category"
    styles={{
      menu: (base) => ({ ...base, zIndex: 9999 }),
      control: (base) => ({
        ...base,
        minHeight: "38px",
        borderColor: errors.selectedCategory ? "#ef4444" : "#d1d5db",
        boxShadow: "none",
        "&:hover": { borderColor: "#9ca3af" },
      }),
    }}
  />
  {errors.selectedCategory && (
    <span className="text-red-500 text-sm mt-1">{errors.selectedCategory}</span>
  )}
</div>
      </div>
    </CustomModal>
  );
};

export default AddMenuSubCategory;
