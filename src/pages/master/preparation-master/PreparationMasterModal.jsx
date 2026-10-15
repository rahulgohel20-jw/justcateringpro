import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { formValidation } from "@/lib/utils";
import { extractTranslations } from "@/utils/langConfig";
import { addPreparationMaster, Translateapi } from "@/services/apiServices";

const initialFormState = {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
};

const requiredFields = ["nameEnglish"];

const PreparationMasterModal = ({
  open,
  onClose,
  refreshData,
  initialValues = {},
}) => {
  const intl = useIntl();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!initialValues?.id;

  /* -------------------- PREFILL / RESET -------------------- */
  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (initialValues?.id) {
      setFormData({
        nameEnglish: initialValues.nameEnglish || "",
        nameGujarati: initialValues.nameGujarati || "",
        nameHindi: initialValues.nameHindi || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [open, initialValues?.id]);

  /* -------------------- AUTO TRANSLATE -------------------- */
  useEffect(() => {
    if (!open || !formData.nameEnglish?.trim()) return;

    const timer = setTimeout(() => {
      Translateapi(formData.nameEnglish)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFormData((prev) => ({
            ...prev,
            nameGujarati: regional || prev.nameGujarati,
            nameHindi: hindi || prev.nameHindi,
          }));
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.nameEnglish, open]);

  /* -------------------- VALIDATION -------------------- */
  const checkErrors = () => {
    const errorObject = formValidation(requiredFields, formData);
    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      return false;
    }
    setErrors({});
    return true;
  };

  /* -------------------- SAVE / UPDATE -------------------- */
  const handleSubmit = () => {
    if (!checkErrors()) return;

    if (!userId) {
      Swal.fire("Error", "User data not found", "error");
      return;
    }

    const payload = {
      id: initialValues?.id ?? 0,
      nameEnglish: (formData.nameEnglish || "").trim(),
      nameGujarati: (formData.nameGujarati || "").trim(),
      nameHindi: (formData.nameHindi || "").trim(),
      userId: Number(userId),
    };

    setSaving(true);
    addPreparationMaster(payload)
      .then((res) => {
        if (res?.data?.success === false) {
          Swal.fire("Error", res.data?.msg || "Something went wrong", "error");
          return;
        }
        Swal.fire(
          "Success",
          res?.data?.msg ||
            (isEdit
              ? "Preparation updated successfully!"
              : "Preparation added successfully!"),
          "success",
        );
        refreshData?.();
        onClose();
      })
      .catch((error) => {
        Swal.fire(
          "Error",
          error?.response?.data?.msg || "Something went wrong",
          "error",
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <CustomModal
      open={open}
      width={1000}
      onClose={onClose}
      title={
        isEdit ? (
          <FormattedMessage
            id="EDIT_PREPARATION_MASTER"
            defaultMessage="Edit Preparation Master"
          />
        ) : (
          <FormattedMessage
            id="NEW_PREPARATION_MASTER"
            defaultMessage="Create Preparation Master"
          />
        )
      }
      footer={[
        <div className="flex justify-end" key="footer-buttons">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
            onClick={onClose}
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            disabled={saving}
            className="btn-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleSubmit}
          >
            {isEdit ? (
              <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
            ) : (
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            )}
          </button>
        </div>,
      ]}
    >
      <div className="grid grid-cols-1 gap-4">
        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          cols={3}
          keys={{
            english: "nameEnglish",
            regional: "nameGujarati",
            hindi: "nameHindi",
          }}
          label={intl.formatMessage({
            id: "COMMON.NAME",
            defaultMessage: "Name",
          })}
          error={errors.nameEnglish}
          required
        />
      </div>
    </CustomModal>
  );
};

export default PreparationMasterModal;