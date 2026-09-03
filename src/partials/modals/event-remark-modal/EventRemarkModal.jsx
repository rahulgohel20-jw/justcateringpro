import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useIntl, FormattedMessage } from "react-intl";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import {
  addeventremrk,
  updateeventremark,
  Translateapi,
} from "@/services/apiServices";

const initialState = {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
  type: "",
  isActive: true,
  isOdc: false,
};

const EventRemarkModal = ({ open, onClose, editData, refreshData }) => {
  const intl = useIntl();
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(false);
  const [translateTimer, setTranslateTimer] = useState(null);

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editData) {
      setFormData({
        nameEnglish: editData.nameEnglish || "",
        nameGujarati: editData.nameGujarati || "",
        nameHindi: editData.nameHindi || "",
        type: editData.type || "",
        isActive: editData.isActive ?? true,
        isOdc: editData.isOdc ?? false,
      });
    } else {
      setFormData(initialState);
    }
  }, [editData, open]);

  const triggerTranslate = (text) => {
    if (!text?.trim()) return;

    if (translateTimer) clearTimeout(translateTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const langKeyMap = {
            Gujarati: "gujarati",
            Tamil: "ta",
            Telugu: "te",
            Malayalam: "ml",
            Marathi: "mr",
          };

          const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");

          const userLang = auth?.state?.user?.lang || "Gujarati";
          const apiKey = langKeyMap[userLang] || "gujarati";

          setFormData((prev) => ({
            ...prev,
            nameGujarati: res?.data?.[apiKey] || "",
            nameHindi: res?.data?.hindi || "",
          }));
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setTranslateTimer(timer);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
      ...(name === "nameEnglish" && !value.trim()
        ? { nameGujarati: "", nameHindi: "" }
        : {}),
    }));

    if (name === "nameEnglish") {
      if (value.trim()) {
        triggerTranslate(value);
      } else {
        if (translateTimer) clearTimeout(translateTimer);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Cancel any pending translation before saving
      if (translateTimer) clearTimeout(translateTimer);
      setTranslateTimer(null);

      setLoading(true);

      const payload = {
        ...formData,
        userId: Number(userId),
      };

      if (editData?.id) {
        await updateeventremark(editData.id, payload);
      } else {
        await addeventremrk(payload);
      }

      Swal.fire({
        icon: "success",
        title: editData
          ? intl.formatMessage({
              id: "EVENT_REMARK.UPDATED_SUCCESS",
              defaultMessage: "Updated Successfully",
            })
          : intl.formatMessage({
              id: "EVENT_REMARK.ADDED_SUCCESS",
              defaultMessage: "Added Successfully",
            }),
        timer: 1500,
        showConfirmButton: false,
      });

      refreshData?.();
      setFormData(initialState); // Reset all fields including translations
      onClose();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "COMMON.SOMETHING_WENT_WRONG",
          defaultMessage: "Something went wrong",
        }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={
        editData
          ? intl.formatMessage({
              id: "EVENT_REMARK.EDIT_TITLE",
              defaultMessage: "Edit Event Remark",
            })
          : intl.formatMessage({
              id: "EVENT_REMARK.ADD_TITLE",
              defaultMessage: "Add Event Remark",
            })
      }
      width={700}
    >
      <div className="grid grid-cols-1 gap-4">
        <MultiLangInputBox
          type="textarea"
          inputProps={{ rows: 4 }}
          label={intl.formatMessage({
            id: "COMMON.NAME",
            defaultMessage: "Name",
          })}
          formData={formData}
          setFormData={(updated) => {
            const englishChanged = updated.nameEnglish !== formData.nameEnglish;

            if (englishChanged && !updated.nameEnglish.trim()) {
              setFormData({ ...updated, nameGujarati: "", nameHindi: "" });
              if (translateTimer) clearTimeout(translateTimer);
              return;
            }

            setFormData(updated);

            if (englishChanged && updated.nameEnglish.trim()) {
              triggerTranslate(updated.nameEnglish);
            }
          }}
          cols={1}
          keys={{
            english: "nameEnglish",
            regional: "nameGujarati",
            hindi: "nameHindi",
          }}
        />

        <div>
          <label>
            <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
          </label>
          <select
            className="input"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">
              {intl.formatMessage({
                id: "EVENT_REMARK.SELECT_TYPE",
                defaultMessage: "Select Type",
              })}
            </option>
            <option value="pooja_room">
              {intl.formatMessage({
                id: "EVENT_REMARK.TYPE_POOJA_ROOM",
                defaultMessage: "Pooja Room",
              })}
            </option>
            <option value="iron">
              {intl.formatMessage({
                id: "EVENT_REMARK.TYPE_IRON",
                defaultMessage: "Iron",
              })}
            </option>
            <option value="venue">
              {intl.formatMessage({
                id: "EVENT_REMARK.TYPE_VENUE",
                defaultMessage: "Venue",
              })}
            </option>
            <option value="odc">
              {intl.formatMessage({
                id: "EVENT_REMARK.ODC",
                defaultMessage: "ODC",
              })}
            </option>
            <option value="banquet">
              {intl.formatMessage({
                id: "EVENT_REMARK.TYPE_BANQUET",
                defaultMessage: "Banquet",
              })}
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label>
            <FormattedMessage id="COMMON.ACTIVE" defaultMessage="Active" />
          </label>
          <div
            className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${formData.isActive ? "bg-blue-600" : "bg-gray-300"}`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${formData.isActive ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label>
            <FormattedMessage id="EVENT_REMARK.ODC" defaultMessage="ODC" />
          </label>
          <div
            className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${formData.isOdc ? "bg-blue-600" : "bg-gray-300"}`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, isOdc: !prev.isOdc }))
            }
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${formData.isOdc ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="btn btn-light" onClick={onClose}>
          <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? intl.formatMessage({
                id: "COMMON.SAVING",
                defaultMessage: "Saving...",
              })
            : editData
              ? intl.formatMessage({
                  id: "COMMON.UPDATE",
                  defaultMessage: "Update",
                })
              : intl.formatMessage({
                  id: "COMMON.SAVE",
                  defaultMessage: "Save",
                })}
        </button>
      </div>
    </CustomModal>
  );
};

export default EventRemarkModal;