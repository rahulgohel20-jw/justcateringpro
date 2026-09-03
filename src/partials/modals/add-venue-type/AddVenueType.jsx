import { useState, useEffect } from "react";
import {
  UpdateVenueTypeApi,
  AddVenueTypeApi,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const AddVenueType = ({
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,
}) => {
  if (!isModalOpen) return null;

  const intl = useIntl();
  const langConfig = getLangConfig();
  const [debounceTimer, setDebounceTimer] = useState(null);

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // ── Image state ────────────────────────────────────────────────────────
  const [venueImg, setVenueImg] = useState(null);       // File object to upload
  const [imgPreview, setImgPreview] = useState(null);   // preview URL (new or existing)

  const triggerTranslate = (text) => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
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
  };

const isValidVenueImg = (img) => {
  if (!img) return false;
  return !img.trim().toLowerCase().endsWith("null");
};

useEffect(() => {
  if (selectedEvent) {
    setFormData({
      nameEnglish: selectedEvent.venue_type || selectedEvent.nameEnglish || "",
      nameGujarati: selectedEvent.nameGujarati || "",
      nameHindi: selectedEvent.nameHindi || "",
    });

    const existingImg = selectedEvent.venueImg || selectedEvent.venueImgUrl || null;
    setImgPreview(isValidVenueImg(existingImg) ? existingImg : null); // ✅ empty if invalid
    setVenueImg(null);
  } else {
    setFormData(initialFormState);
    setImgPreview(null);
    setVenueImg(null);
  }
  setErrors({});
}, [selectedEvent]);

  useEffect(() => {
    if (formData.nameEnglish) {
      triggerTranslate(formData.nameEnglish);
    }
  }, [formData.nameEnglish]);

  // ── Image handlers ─────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid file", "Please select an image file", "warning");
      return;
    }

    setVenueImg(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setVenueImg(null);
    setImgPreview(null);
  };

const handleSubmit = async () => {
  if (!formData.nameEnglish?.trim()) {
    Swal.fire("Required", "Please enter venue name in English", "warning");
    return;
  }

  let userId;
  try {
    userId = localStorage.getItem("userId");
  } catch (e) {
    console.error("Failed to parse userID:", e);
    Swal.fire("Error", "Invalid user session", "error");
    return;
  }

  if (!userId) {
    Swal.fire("Error", "User not logged in", "error");
    return;
  }

  // ✅ everything except id goes into FormData (for both add & update)
  const multipartData = new FormData();
  multipartData.append("nameEnglish", formData.nameEnglish.trim());
  multipartData.append("nameGujarati", formData.nameGujarati?.trim() || "");
  multipartData.append("nameHindi", formData.nameHindi?.trim() || "");
  multipartData.append("userId", userId);
  if (venueImg) {
    multipartData.append("venueImg", venueImg);
  }

  try {
    let res;

    if (selectedEvent?.venueid) {
      // UPDATE: real id in URL, rest as FormData
      res = await UpdateVenueTypeApi(selectedEvent.venueid, multipartData);
    } else {
      // ADD: no id yet, so pass -1 in URL, rest as FormData
      res = await AddVenueTypeApi(-1, multipartData);
    }

    if (res?.data?.success === false && res.data.msg?.includes("exists")) {
      Swal.fire(
        "Already Exists",
        `Venue with the name '${formData.nameEnglish}' already exists.`,
        "warning"
      );
      return;
    }

    if (res?.data?.success === false) {
      Swal.fire("Failed", res.data.msg || "Could not save", "error");
      return;
    }

    Swal.fire("Success!", "Venue type saved successfully", "success");
    setFormData(initialFormState);
    setVenueImg(null);
    setImgPreview(null);
    setIsModalOpen(false);
    refreshData(!selectedEvent?.venueid);
  } catch (err) {
    console.error("API Error:", err);
    Swal.fire("Error", err.response?.data?.msg || "Database error", "error");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedEvent ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_EVENT_TYPE"
                defaultMessage="Edit Venue"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADD_EVENT_TYPE"
                defaultMessage="Create New Venue"
              />
            )}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-2xl text-gray-600"
          >
            &times;
          </button>
        </div>

        <MultiLangInputBox
          label={intl.formatMessage({
            id: "COMMON.NAME",
            defaultMessage: "Name",
          })}
          formData={formData}
          setFormData={setFormData}
          error={errors.nameEnglish}
          cols={3}
          keys={{
            english: "nameEnglish",
            regional: "nameGujarati",
            hindi: "nameHindi",
          }}
        />

        {/* ── Image Upload ── */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FormattedMessage id="COMMON.VENUE_IMAGE" defaultMessage="Venue Image" />
          </label>

          <div className="flex items-center gap-4">
            {imgPreview ? (
              <div className="relative">
                <img
                  src={imgPreview}
                  alt="Venue preview"
                  className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="w-28 h-28 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 text-xs text-center px-2">
                No image
              </div>
            )}

            <label className="cursor-pointer border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
              <FormattedMessage id="COMMON.CHOOSE_FILE" defaultMessage="Choose File" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={handleSubmit}
          >
            {selectedEvent ? (
              <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
            ) : (
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVenueType;