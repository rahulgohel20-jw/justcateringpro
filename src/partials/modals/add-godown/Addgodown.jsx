import { useState, useEffect } from "react";
import {
  AddorUpdategodown,
  Translateapi,
  GetGodownbyid,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const Addgodown = ({
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
    addressEnglish: "",
    addressGujarati: "",
    addressHindi: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
  });

  const triggerTranslate = (text, type = "name") => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFormData((prev) => ({
            ...prev,
            ...(type === "name" && {
              nameGujarati: regional,
              nameHindi: hindi,
            }),
            ...(type === "address" && {
              addressGujarati: regional,
              addressHindi: hindi,
            }),
          }));
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  };

  useEffect(() => {
    if (!selectedEvent?.id) {
      setFormData(initialFormState);
      return;
    }

    GetGodownbyid(selectedEvent.id)
      .then((res) => {
        const data = res?.data?.data;
        if (!data) return;
        setFormData({
          nameEnglish: data.nameEnglish || "",
          nameGujarati: data.nameGujarati || "",
          nameHindi: data.nameHindi || "",
          addressEnglish: data.addressEnglish || "",
          addressGujarati: data.addressGujarati || "",
          addressHindi: data.addressHindi || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching godown by id:", error);
        Swal.fire("Error", "Failed to load godown data", "error");
      });

    setErrors({});
  }, [selectedEvent]);

  useEffect(() => {
    if (formData.nameEnglish) triggerTranslate(formData.nameEnglish, "name");
  }, [formData.nameEnglish]);

  useEffect(() => {
    if (formData.addressEnglish) triggerTranslate(formData.addressEnglish, "address");
  }, [formData.addressEnglish]);

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const userId = Number(localStorage.getItem("userId"));
      if (!userId) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      const payload = {
        id: selectedEvent?.id || 0,
        nameEnglish: formData.nameEnglish,
        nameGujarati: formData.nameGujarati,
        nameHindi: formData.nameHindi,
        addressEnglish: formData.addressEnglish,
        addressGujarati: formData.addressGujarati,
        addressHindi: formData.addressHindi,
        userId,
      };

      const res = await AddorUpdategodown(payload);

      if (res?.data?.success === false) {
        Swal.fire("Error", res.data.msg || "Something went wrong", "error");
        return;
      }

      Swal.fire(
        "Success",
        selectedEvent ? "Godown updated successfully!" : "Godown added successfully!",
        "success"
      );

      refreshData();
      setIsModalOpen(false);
    } catch (err) {
      if (err.inner) {
        const formErrors = {};
        err.inner.forEach((validationError) => {
          formErrors[validationError.path] = validationError.message;
        });
        setErrors(formErrors);
      }
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
                defaultMessage="Edit Event"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADD_EVENT_TYPE"
                defaultMessage="Create New Godown"
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

        {/* Form */}
        <div className="flex flex-col gap-6">

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

      
          <MultiLangInputBox
            label={intl.formatMessage({
              id: "COMMON.ADDRESS",
              defaultMessage: "Address",
            })}
            formData={formData}
            setFormData={setFormData}
            cols={3}
            type="textarea"
            keys={{
              english: "addressEnglish",
              regional: "addressGujarati",
              hindi: "addressHindi",
            }}
          />
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

export default Addgodown;