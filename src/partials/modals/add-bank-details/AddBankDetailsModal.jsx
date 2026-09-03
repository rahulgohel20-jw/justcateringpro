import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Switch } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { AddBankDetails } from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const AddBankDetailsModal = ({
  isOpen,
  onClose,
  refreshData,
  bankDetails = null,
  allBankDetails = [],
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [qrImage, setQrImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (bankDetails?.qrCodeImage) {
      setPreviewUrl(bankDetails.qrCodeImage);
    }
    if (bankDetails && isOpen) {
      form.setFieldsValue({
        id: bankDetails?.id || 0,
        accountHolderName: bankDetails.accountHolderName || "",
        accountNo: bankDetails.accountNo || "",
        bankName: bankDetails.bankName || "",
        branchName: bankDetails.branchName || "",
        ifscCode: bankDetails.ifscCode || "",
        upiId: bankDetails.upiId || "",
        isPrimary: bankDetails.isPrimary || false,
        openingBalance: bankDetails.openingBalance || 0,

        // ✅ convert string "DD/MM/YYYY" → dayjs so DatePicker shows the value
        openingDate: bankDetails.openingDate
          ? dayjs(bankDetails.openingDate, "DD/MM/YYYY")
          : dayjs(),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        openingDate: dayjs(),
      });
    }
  }, [bankDetails, isOpen, form]);

  const handleFileChange = (info) => {
    const file = info.fileList?.[0]?.originFileObj;

    if (file) {
      setQrImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (values) => {
    try {
      if (values.isPrimary) {
        const existingPrimary = allBankDetails.find(
          (bank) => bank.isPrimary === true && bank.id !== bankDetails?.id,
        );

        if (existingPrimary) {
          await Swal.fire({
            title: intl.formatMessage({
              id: "BANK.PRIMARY_EXISTS",
              defaultMessage: "Primary Account Already Exists",
            }),
 html: intl.formatMessage(
             {
               id: "BANK.PRIMARY_EXISTS_DETAIL",
               defaultMessage:
                 "Account <b>{name}</b> (A/C: {accountNo}) is already set as primary.<br/><br/>Please remove primary status from that account first before setting this account as primary.",
             },
             {
               name: existingPrimary.accountHolderName,
               accountNo: existingPrimary.accountNo,
               b: (chunks) => `<b>${chunks}</b>`,
             },
           ),            icon: "warning",
            confirmButtonColor: "#005BA8",
            confirmButtonText: intl.formatMessage({
              id: "COMMON.OK",
              defaultMessage: "OK",
            }),
          });
          return;
        }

        const confirmed = await Swal.fire({
          title: intl.formatMessage({
            id: "BANK.PRIMARY_CONFIRMATION",
            defaultMessage: "Set as Primary Account?",
          }),
          text: intl.formatMessage({
            id: "BANK.PRIMARY_CONFIRMATION_TEXT",
            defaultMessage:
              "This account will be set as your primary bank account.",
          }),
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#005BA8",
          cancelButtonColor: "#d33",
          confirmButtonText: intl.formatMessage({
            id: "COMMON.YES",
            defaultMessage: "Yes",
          }),
          cancelButtonText: intl.formatMessage({
            id: "COMMON.CANCEL",
            defaultMessage: "Cancel",
          }),
        });

        if (!confirmed.isConfirmed) {
          return;
        }
      }

      const formData = new FormData();

      formData.append("accountHolderName", values.accountHolderName);
      formData.append("accountNo", values.accountNo);
      formData.append("bankName", values.bankName);
      formData.append("branchName", values.branchName);
      formData.append("ifscCode", values.ifscCode);
      formData.append("upiId", values.upiId || "");
      formData.append("isPrimary", values.isPrimary || false);
      formData.append("userId", userId);
      formData.append("id", bankDetails?.id || -1);
      formData.append(
        "openingDate",
        values.openingDate
          ? dayjs(values.openingDate).format("DD/MM/YYYY")
          : "",
      );
      formData.append("openingBalance", values.openingBalance || 0);
      formData.append("currentBalance", values.openingBalance || 0);
      if (qrImage) {
        formData.append("qrCodeImage", qrImage);
      }

      const response = await AddBankDetails(formData);

      if (response?.data?.success || response?.success) {
        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.SUCCESS",
            defaultMessage: "Success!",
          }),
          text: intl.formatMessage({
            id: bankDetails?.id ? "BANK.UPDATE_SUCCESS" : "BANK.ADD_SUCCESS",
            defaultMessage: bankDetails?.id
              ? "Bank details updated successfully"
              : "Bank details added successfully",
          }),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        form.resetFields();
        onClose(false);
        refreshData();
      } else {
        throw new Error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving bank details:", error);
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text:
          error?.response?.data?.message ||
          error.message ||
          intl.formatMessage({
            id: "BANK.SAVE_ERROR",
            defaultMessage: "Failed to save bank details",
          }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose(false);
  };

  return (
    <Modal
      title={
        <div className="text-lg font-semibold text-primary">
          <FormattedMessage
            id={
              bankDetails?.id
                ? "BANK.EDIT_BANK_DETAILS"
                : "BANK.ADD_BANK_DETAILS"
            }
            defaultMessage={
              bankDetails?.id ? "Edit Bank Details" : "Add Bank Details"
            }
          />
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose
      styles={{
        body: {
          paddingTop: "8px",
          paddingBottom: "8px",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Account Holder Name */}
          <Form.Item
            label={
              <FormattedMessage
                id="BANK.ACCOUNT_HOLDER_NAME"
                defaultMessage="Account Holder Name"
              />
            }
            name="accountHolderName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "BANK.ACCOUNT_HOLDER_NAME_REQUIRED",
                  defaultMessage: "Please enter account holder name",
                }),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={intl.formatMessage({
                id: "BANK.ACCOUNT_HOLDER_NAME_PLACEHOLDER",
                defaultMessage: "Enter account holder name",
              })}
              size="large"
            />
          </Form.Item>

          {/* Account Number */}
          <Form.Item
            label={
              <FormattedMessage
                id="BANK.ACCOUNT_NUMBER"
                defaultMessage="Account Number"
              />
            }
            name="accountNo"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "BANK.ACCOUNT_NUMBER_REQUIRED",
                  defaultMessage: "Please enter account number",
                }),
              },
              {
                pattern: /^[0-9]+$/,
                message: intl.formatMessage({
                  id: "BANK.ACCOUNT_NUMBER_INVALID",
                  defaultMessage: "Please enter valid account number",
                }),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={intl.formatMessage({
                id: "BANK.ACCOUNT_NUMBER_PLACEHOLDER",
                defaultMessage: "Enter account number",
              })}
              size="large"
            />
          </Form.Item>

          {/* Bank Name */}
          <Form.Item
            label={
              <FormattedMessage
                id="BANK.BANK_NAME"
                defaultMessage="Bank Name"
              />
            }
            name="bankName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "BANK.BANK_NAME_REQUIRED",
                  defaultMessage: "Please enter bank name",
                }),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={intl.formatMessage({
                id: "BANK.BANK_NAME_PLACEHOLDER",
                defaultMessage: "Enter bank name",
              })}
              size="large"
            />
          </Form.Item>

          {/* Branch Name */}
          <Form.Item
            label={
              <FormattedMessage
                id="BANK.BRANCH_NAME"
                defaultMessage="Branch Name"
              />
            }
            name="branchName"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "BANK.BRANCH_NAME_REQUIRED",
                  defaultMessage: "Please enter branch name",
                }),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={intl.formatMessage({
                id: "BANK.BRANCH_NAME_PLACEHOLDER",
                defaultMessage: "Enter branch name",
              })}
              size="large"
            />
          </Form.Item>

          {/* IFSC Code */}
          <Form.Item
            label={
              <FormattedMessage
                id="BANK.IFSC_CODE"
                defaultMessage="IFSC Code"
              />
            }
            name="ifscCode"
            normalize={(value) => value?.trim().toUpperCase()} // ✅ FIX
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "BANK.IFSC_CODE_REQUIRED",
                  defaultMessage: "Please enter IFSC code",
                }),
              },
              {
                pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                message: intl.formatMessage({
                  id: "BANK.IFSC_CODE_INVALID",
                  defaultMessage: "Please enter valid IFSC code",
                }),
              },
            ]}
            className="mb-3"
          >
            <Input
              placeholder={intl.formatMessage({
                id: "BANK.IFSC_CODE_PLACEHOLDER",
                defaultMessage: "Enter IFSC code (e.g., SBIN0001234)",
              })}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="BANK.UPI_ID"
                defaultMessage="UPI ID (Optional)"
              />
            }
            name="upiId"
            className="mb-4"
          >
            <Input
              placeholder={intl.formatMessage({
      id: "BANK.UPI_ID_PLACEHOLDER",
     defaultMessage: "Enter UPI ID (e.g., user@bank)",
     })}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="BANK.OPENING_BALANCE_LABEL"
                defaultMessage="Bank Opening Balance "
              />
            }
            name="openingBalance"
            className="mb-4"
          >
            <Input
              placeholder="Enter Balance"
              size="large"
              // disabled={!!bankDetails?.id} // ✅ disabled in edit mode
            />
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="BANK.OPENING_DATE"
                defaultMessage="Bank Opening Date"
              />
            }
            name="openingDate"
            className="mb-4"
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
   label={
     <FormattedMessage id="BANK.QR_CODE_IMAGE" defaultMessage="QR Code Image" />
   }
   name="qrCodeImage"
    className="mb-4 col-span-2"
  >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              onChange={handleFileChange}
              showUploadList={false}
              fileList={[]}
            >
<Button icon={<UploadOutlined />}>
       <FormattedMessage id="BANK.UPLOAD_QR_CODE" defaultMessage="Upload QR Code" />
     </Button>            </Upload>

            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="QR Preview"
                  className="h-24 w-24 object-contain border rounded"
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label={
              <FormattedMessage
                id="BANK.IS_PRIMARY"
                defaultMessage="Is Primary Account?"
              />
            }
            name="isPrimary"
            valuePropName="checked"
            className="mb-4 "
          >
            <Switch className="accent-primary" />
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-3">
            <Button size="large" onClick={handleCancel}>
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </Button>
            <Button
              className="bg-primary text-white"
              size="large"
              htmlType="submit"
            >
              <FormattedMessage
                id={bankDetails?.id ? "COMMON.UPDATE" : "COMMON.SAVE"}
                defaultMessage={bankDetails?.id ? "Update" : "Save"}
              />
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBankDetailsModal;
