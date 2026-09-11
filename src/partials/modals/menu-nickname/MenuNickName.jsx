import { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";
import { Translateapi } from "@/services/apiServices";
import { extractTranslations } from "@/utils/langConfig";


export default function MenuNickName({
  isOpen,
  title = "Nick Name",
  initialValues,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    nickNameEnglish: "",
    nickNameGujarati: "",
    nickNameHindi: "",
  });
  const debounceRef = useRef(null);

  // Reset the form whenever the modal opens for a (possibly different) target
  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      nickNameEnglish: initialValues?.nickNameEnglish || "",
      nickNameGujarati: initialValues?.nickNameGujarati || "",
      nickNameHindi: initialValues?.nickNameHindi || "",
    });
  }, [isOpen, initialValues]);

  // Auto-translate English -> Gujarati/Hindi, debounced (same 500ms pattern
  // used for the package name in AddCustomPackage)
  useEffect(() => {
    if (!isOpen) return;
    if (!formData.nickNameEnglish?.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      Translateapi(formData.nickNameEnglish)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFormData((prev) => ({
            ...prev,
            nickNameGujarati: regional || prev.nickNameGujarati,
            nickNameHindi: hindi || prev.nickNameHindi,
          }));
        })
        .catch(() => console.warn("Translation failed"));
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nickNameEnglish, isOpen]);

  const handleSave = () => {
    onSave?.({
      nickNameEnglish: formData.nickNameEnglish.trim(),
      nickNameGujarati: formData.nickNameGujarati.trim(),
      nickNameHindi: formData.nickNameHindi.trim(),
    });
  };

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
      maskClosable={false}
    >
      <div className="pt-2">
        <MultiLangInputBox
          label="Nick Name"
          formData={formData}
          setFormData={setFormData}
          cols={1}
          keys={{
            english: "nickNameEnglish",
            regional: "nickNameGujarati",
            hindi: "nickNameHindi",
          }}
        />
        <p className="text-xs text-gray-400 mt-2">
          Gujarati &amp; Hindi auto-fill from the English nick name — edit them if needed.
        </p>
      </div>
    </Modal>
  );
}