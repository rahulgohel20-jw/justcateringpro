import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Switch,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { AddCashAccount, GetAllContactType } from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";

const Addcashaccount = ({
  isOpen,
  onClose,
  refreshData,
  bankDetails = null,
  allBankDetails = [],
}) => {
  const [form] = Form.useForm();
  const [cashTypes, setCashTypes] = useState([]);
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));

  // ✅ Check if a primary account already exists (excluding the current one being edited)
  const hasPrimaryAccount = allBankDetails.some(
    (acc) => acc.isPrimary === true && acc.id !== bankDetails?.id,
  );

  useEffect(() => {
    fetchCashTypes();
  }, []);

  const fetchCashTypes = async () => {
    try {
      const res = await GetAllContactType(1);
      const list = res?.data?.data?.["Contact Type Details"] || [];
      const filtered = list.filter((item) =>
        item?.nameEnglish?.toLowerCase().includes("cash"),
      );
      const options = filtered.map((item) => ({
        label: item.nameEnglish,
        value: item.id,
      }));
      setCashTypes(options);
    } catch (error) {
      console.log("cash type error", error);
    }
  };

  useEffect(() => {
    if (isOpen && cashTypes.length) {
      if (bankDetails) {
        // Edit mode
        form.setFieldsValue({
          accountName: bankDetails.accountName || "",
          contactTypeId:
            bankDetails?.contactTypeId || bankDetails?.contactType?.id,
          description: bankDetails.description || "",
          openingBalance: bankDetails.openingBalance ?? "",
          openingDate: bankDetails.createdAt
            ? dayjs(bankDetails.createdAt, "DD/MM/YYYY HH:mm:ss")
            : dayjs(),
          isPrimary: bankDetails.isPrimary ?? false,
        });
      } else {
        // Add mode — isPrimary true only if no primary exists yet
        form.setFieldsValue({
          openingDate: dayjs(),
          isPrimary: !hasPrimaryAccount, // true if no primary, false if one exists
        });
      }
    }
  }, [bankDetails, isOpen, form, cashTypes]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        accountName: values.accountName,
        contactTypeId: values.contactTypeId,
        openingBalance: Number(values.openingBalance || 0),
        currentBalance: Number(values.openingBalance || 0),
        description: values.description || "",
        isPrimary: values.isPrimary ?? false,
        userId: userId,
      };

      const id = bankDetails?.id ?? -1;
      const response = await AddCashAccount(id, payload);

      if (response?.data?.success || response?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.data?.msg || "Cash account saved successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        form.resetFields();
        onClose(false);
        refreshData();
      } else {
        throw new Error(response?.data?.msg || "Operation failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          error?.message ||
          "Failed to save cash account",
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
                ? "BANK.EDIT_CASH_DETAILS"
                : "BANK.ADD_CASH_DETAILS"
            }
            defaultMessage={
              bankDetails?.id
                ? "Edit Cash Account Details"
                : "Add Cash Account Details"
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
        {/* Account Name */}
        <Form.Item
          label={
            <FormattedMessage
              id="CASH.ACCOUNT_HOLDER_NAME"
              defaultMessage="Account Name"
            />
          }
          name="accountName"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "BANK.ACCOUNT_HOLDER_NAME_REQUIRED",
                defaultMessage: "Please enter account name",
              }),
            },
          ]}
          className="mb-3"
        >
          <Input
            placeholder={intl.formatMessage({
              id: "BANK.ACCOUNT_HOLDER_NAME_PLACEHOLDER",
              defaultMessage: "Enter name",
            })}
            size="large"
          />
        </Form.Item>

        {/* Cash Type */}
        <Form.Item
          label={
    <FormattedMessage
      id="BANK.CASH_TYPE"
      defaultMessage="Cash Type"
    />
  }
          name="contactTypeId"
          rules={[{ required: true, message: "Please select cash type" }]}
          className="mb-3"
        >
          <Select
            size="large"
            placeholder="Select cash type"
            options={cashTypes}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          label={
            <FormattedMessage
              id="CASH.DESCRIPTION"
              defaultMessage="Description"
            />
          }
          name="description"
          className="mb-3"
        >
          <Input size="large" />
        </Form.Item>

        {/* Opening Balance & Date */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={
    <FormattedMessage
      id="BANK.OPENING_BALANCE"
      defaultMessage="Opening Balance"
    />
  }
              name="openingBalance"
              className="mb-3"
            >
              <Input
                size="large"
                placeholder="Enter opening balance"
                disabled={!!bankDetails?.id}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={
    <FormattedMessage
      id="BANK.OPENING_DATE"
      defaultMessage="Opening Date"
    />
  } name="openingDate" className="mb-3">
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD/MM/YYYY"
                defaultValue={dayjs()}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* ✅ Only show isPrimary switch if no primary account exists yet */}

        <Form.Item
          label={
            <FormattedMessage
              id="BANK.IS_PRIMARY"
              defaultMessage="Is Primary Account?"
            />
          }
          name="isPrimary"
          valuePropName="checked"
          className="mb-4"
        >
          <Switch className="accent-primary" />
        </Form.Item>

        {/* Actions */}
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

export default Addcashaccount;
