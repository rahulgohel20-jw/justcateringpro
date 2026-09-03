  import { useEffect, useState } from "react";
  import { Modal, Form, Input, message } from "antd";
  import { FormattedMessage, useIntl } from "react-intl";
  import { AddGuest, Translateapi } from "@/services/apiServices";
  import { extractTranslations } from "@/utils/langConfig";
  import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";
  import DatePicker from "react-datepicker";
  import "react-datepicker/dist/react-datepicker.css";
  import dayjs from "dayjs";

  const AddGuestModal = ({
    isModalOpen,
    setIsModalOpen,
    refreshData,
    selectedGuest,
  }) => {
    const [form] = Form.useForm();
    const intl = useIntl();
    const userId = localStorage.getItem("userId");
    const [birthDate, setBirthDate] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);

    // Separate state for multi-lang name fields (used by MultiLangInputBox)
    const [nameFormData, setNameFormData] = useState({
      nameEnglish: "",
      nameHindi: "",
      nameGujarati: "",
    });

    const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    const text = nameFormData.nameEnglish?.trim();

    // ✅ If empty, clear the translated fields immediately
    if (!text) {
      setNameFormData((prev) => ({
        ...prev,
        nameGujarati: "",
        nameHindi: "",
      }));
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setNameFormData((prev) => ({
            ...prev,
            nameGujarati: regional,
            nameHindi: hindi,
          }));
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [nameFormData.nameEnglish]);

    useEffect(() => {
      if (isModalOpen) {
        if (selectedGuest) {
          setNameFormData({
            nameEnglish: selectedGuest.nameEnglish || "",
            nameHindi: selectedGuest.nameHindi || "",
            nameGujarati: selectedGuest.nameGujarati || "",

          });
          form.setFieldsValue({
            contactNo:
              selectedGuest.contactNoRaw ?? selectedGuest.contactNo ?? "",
            email: selectedGuest.emailRaw ?? selectedGuest.email ?? "",
          });
          setBirthDate(selectedGuest.birthDate ? dayjs(selectedGuest.birthDate, "DD/MM/YYYY").toDate() : null);
    setAnniversaryDate(selectedGuest.aniversaryDate ? dayjs(selectedGuest.aniversaryDate, "DD/MM/YYYY").toDate() : null);
        } else {
          setNameFormData({ nameEnglish: "", nameHindi: "", nameGujarati: "" });
          form.resetFields();
          setBirthDate(null);
    setAnniversaryDate(null);
        }
      }
    }, [isModalOpen, selectedGuest, form]);

    const handleCancel = () => {
      setNameFormData({ nameEnglish: "", nameHindi: "", nameGujarati: "" });
      form.resetFields();
      setBirthDate(null);
  setAnniversaryDate(null);
      setIsModalOpen();
    };

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();

        if (!nameFormData.nameEnglish?.trim()) {
          message.error(
            intl.formatMessage({
              id: "VALIDATION.NAME_ENGLISH_REQUIRED",
              defaultMessage: "Please enter name in English",
            })
          );
          return;
        }

      const payload = {
    id: selectedGuest?.id || -1,
    nameEnglish: nameFormData.nameEnglish || "",
    nameHindi: nameFormData.nameHindi || "",
    nameGujarati: nameFormData.nameGujarati || "",
    contactNo: values.contactNo || "",
    email: values.email || "",
    birthDate: birthDate ? dayjs(birthDate).format("DD/MM/YYYY") : "",
    aniversaryDate: anniversaryDate ? dayjs(anniversaryDate).format("DD/MM/YYYY") : "",
    userId: parseInt(userId),
  };;

        const res = await AddGuest(payload);

        if (res?.data?.success) {
          message.success(
            res?.data?.msg ||
              intl.formatMessage({
                id: "USER.MASTER.GUEST_SAVE_SUCCESS",
                defaultMessage: "Guest saved successfully.",
              })
          );
          refreshData();
          handleCancel();
        } else {
          message.error(
            res?.data?.msg ||
              intl.formatMessage({
                id: "USER.MASTER.GUEST_SAVE_FAILED",
                defaultMessage: "Failed to save guest.",
              })
          );
        }
      } catch (err) {
        if (err?.errorFields) return;
        console.error("Error saving guest:", err);
        
      }
    };

    return (
      <Modal
        title={
          selectedGuest ? (
            <FormattedMessage
              id="USER.MASTER.EDIT_GUEST"
              defaultMessage="Edit Guest"
            />
          ) : (
            <FormattedMessage
              id="USER.MASTER.ADD_GUEST"
              defaultMessage="Add Guest"
            />
          )
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={<FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />}
        cancelText={
          <FormattedMessage
            id="USER.MASTER.CANCEL_BUTTON"
            defaultMessage="Cancel"
          />
        }
        destroyOnClose
        okButtonProps={{
    type: "primary",
    style: { height: "40px", fontSize: "15px", paddingInline: "24px" },
  }}
      >
        <div className="mt-4 flex flex-col gap-4">
          {/* Name fields — handled by MultiLangInputBox with auto-translation */}
          <MultiLangInputBox
            label={intl.formatMessage({
              id: "COMMON.NAME",
              defaultMessage: "Name",
            })}
            formData={nameFormData}
            setFormData={setNameFormData}
            cols={1}
            keys={{
              english: "nameEnglish",
              regional: "nameGujarati",
              hindi: "nameHindi",
            }}
          />
          {/* Birth Date & Anniversary Date */}
  <div className="grid grid-cols-2 gap-3">
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        <FormattedMessage id="COMMON.BIRTH_DATE" defaultMessage="Birth Date" />
      </label>
      <DatePicker
        selected={birthDate}
        onChange={(date) => setBirthDate(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        className="input w-full"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
      />
    </div>

    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        <FormattedMessage id="COMMON.ANNIVERSARY_DATE" defaultMessage="Anniversary Date" />
      </label>
      <DatePicker
        selected={anniversaryDate}
        onChange={(date) => setAnniversaryDate(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        className="input w-full"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
      />
    </div>
  </div>

          {/* Contact No & Email — stay in Ant Design Form for built-in validation */}
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <FormattedMessage
                  id="COMMON.CONTACT_NO"
                  defaultMessage="Contact No"
                />
              }
              name="contactNo"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: intl.formatMessage({
                    id: "VALIDATION.CONTACT_NO_INVALID",
                    defaultMessage: "Enter a valid 10-digit contact number",
                  }),
                },
              ]}
            >
              <Input
                maxLength={10}
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.ENTER_CONTACT_NO",
                  defaultMessage: "Enter contact number",
                })}
              />
            </Form.Item>

            <Form.Item
              label={
                <FormattedMessage id="COMMON.EMAIL" defaultMessage="Email" />
              }
              name="email"
              rules={[
                {
                  type: "email",
                  message: intl.formatMessage({
                    id: "VALIDATION.EMAIL_INVALID",
                    defaultMessage: "Enter a valid email address",
                  }),
                },
              ]}
            >
              <Input
                placeholder={intl.formatMessage({
                  id: "PLACEHOLDER.ENTER_EMAIL",
                  defaultMessage: "Enter email address",
                })}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  export default AddGuestModal;