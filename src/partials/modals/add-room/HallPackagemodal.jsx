import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  GetAllBanquet,
  GetCustomPackageapi,
  Addupdtaehallpackagerate,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const HallPackageModal = ({ open, onClose, refreshData = () => {}, initialValues }) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [halls, setHalls] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hallsLoading, setHallsLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem("userId");

  // ── Pick package name based on current locale, fallback to English ──────
  const getPackageLabel = (pkg) => {
    const locale = intl.locale; // e.g. "en", "hi", "gu", "te", "ta", "ml", "mr"

    if (locale === "gu" && pkg.nameGujarati?.trim()) {
      return pkg.nameGujarati;
    }
    if (locale === "hi" && pkg.nameHindi?.trim()) {
      return pkg.nameHindi;
    }
    // API doesn't provide nameTelugu / nameTamil / nameMalayalam / nameMarathi
    // so TE / TA / ML / MR (and any missing translation) fall back to English.
    return pkg.nameEnglish?.trim() || `Package ${pkg.id}`;
  };

  const fetchHalls = () => {
    if (!userId) return;
    setHallsLoading(true);
    GetAllBanquet(userId)
      .then((res) => {
        const list = res?.data?.data || [];
        setHalls(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Error fetching halls:", err);
        setHalls([]);
      })
      .finally(() => setHallsLoading(false));
  };

  const fetchPackages = () => {
    if (!userId) return;
    setPackagesLoading(true);
    GetCustomPackageapi(userId)
      .then((res) => {
        const list = res?.data?.data?.["Package Details"] || [];
        setPackages(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setPackages([]);
      })
      .finally(() => setPackagesLoading(false));
  };

  useEffect(() => {
    if (open) {
      fetchHalls();
      fetchPackages();

      form.setFieldsValue(
        initialValues || {
          hallId: undefined,
          packageId: undefined,
          minGuests: undefined,
          price: undefined,
          tierLabel: "",
          tierSequence: undefined,
          packageSequence: undefined,
        }
      );
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleFinish = (values) => {
    const payload = {
      hallId: values.hallId,
      minGuests: values.minGuests,
      packageId: values.packageId,
      packageSequence: values.packageSequence,
      price: values.price,
      tierLabel: values.tierLabel,
      tierSequence: values.tierSequence,
      userId: Number(userId),
    };

    if (initialValues?.id && initialValues.id > 0) {
      payload.id = initialValues.id;
    }

    setSaving(true);
    Addupdtaehallpackagerate(payload)
      .then((response) => {
        const { success, msg } = response?.data || {};

        if (!success) {
          throw new Error(
            msg || intl.formatMessage({ id: "HALL_PACKAGE_MODAL.SAVE_FAILED", defaultMessage: "Save failed" })
          );
        }

        onClose();
        refreshData();
        Swal.fire({
          title: intl.formatMessage({ id: "COMMON.SAVED", defaultMessage: "Saved!" }),
          text:
            msg ||
            intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.SAVE_SUCCESS_MSG",
              defaultMessage: "Hall package rate saved successfully.",
            }),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error("Error saving hall package rate:", error);
        Swal.fire(
          intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
          error?.message ||
            intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.SAVE_FAILED_MSG",
              defaultMessage: "Failed to save the record.",
            }),
          "error"
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={
        initialValues?.id
          ? intl.formatMessage({ id: "HALL_PACKAGE_MODAL.EDIT_TIER", defaultMessage: "Edit Tier" })
          : intl.formatMessage({ id: "HALL_PACKAGE_MODAL.ADD_TIER", defaultMessage: "Add Tier" })
      }
      width={560}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-4"
      >
        <Form.Item
          label={<FormattedMessage id="HALL_PACKAGE_MODAL.TIER_LABEL" defaultMessage="Tier Label" />}
          name="tierLabel"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.TIER_LABEL_REQUIRED",
                defaultMessage: "Tier label is required",
              }),
            },
          ]}
          className="sm:col-span-2"
        >
          <Input
            placeholder={intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.TIER_LABEL_PLACEHOLDER",
              defaultMessage: "e.g. Gold, Silver, Platinum",
            })}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="COMMON.HALL" defaultMessage="Hall" />}
          name="hallId"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.HALL_REQUIRED",
                defaultMessage: "Hall is required",
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.SELECT_HALL",
              defaultMessage: "Select Hall",
            })}
            loading={hallsLoading}
            showSearch
            optionFilterProp="label"
            options={halls.map((hall) => ({
              value: hall.id,
              label: hall.hallName || `Hall ${hall.id}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="COMMON.PACKAGE" defaultMessage="Package" />}
          name="packageId"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.PACKAGE_REQUIRED",
                defaultMessage: "Package is required",
              }),
            },
          ]}
        >
          <Select
            placeholder={intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.SELECT_PACKAGE",
              defaultMessage: "Select Package",
            })}
            loading={packagesLoading}
            showSearch
            optionFilterProp="label"
            options={packages.map((pkg) => ({
              value: pkg.id,
              label: getPackageLabel(pkg),
            }))}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="COMMON.PAX" defaultMessage="Pax" />}
          name="minGuests"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.MIN_GUESTS_REQUIRED",
                defaultMessage: "Min guests is required",
              }),
            },
          ]}
        >
          <InputNumber
            min={0}
            className="w-full"
            placeholder={intl.formatMessage({
              id: "HALL_PACKAGE_MODAL.MINIMUM_GUESTS",
              defaultMessage: "Minimum guests",
            })}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />}
          name="price"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.PRICE_REQUIRED",
                defaultMessage: "Price is required",
              }),
            },
          ]}
        >
          <InputNumber
            min={0}
            className="w-full"
            placeholder={intl.formatMessage({ id: "COMMON.PRICE", defaultMessage: "Price" })}
            formatter={(value) =>
              value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => value?.replace(/₹\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="HALL_PACKAGE_MODAL.TIER_SEQUENCE" defaultMessage="Tier Sequence" />}
          name="tierSequence"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.TIER_SEQUENCE_REQUIRED",
                defaultMessage: "Tier sequence is required",
              }),
            },
          ]}
        >
          <InputNumber
            min={0}
            className="w-full"
            placeholder={intl.formatMessage({ id: "COMMON.DISPLAY_ORDER", defaultMessage: "Display order" })}
          />
        </Form.Item>

        <Form.Item
          label={<FormattedMessage id="HALL_PACKAGE_MODAL.PACKAGE_SEQUENCE" defaultMessage="Package Sequence" />}
          name="packageSequence"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "HALL_PACKAGE_MODAL.PACKAGE_SEQUENCE_REQUIRED",
                defaultMessage: "Package sequence is required",
              }),
            },
          ]}
        >
          <InputNumber
            min={0}
            className="w-full"
            placeholder={intl.formatMessage({ id: "COMMON.DISPLAY_ORDER", defaultMessage: "Display order" })}
          />
        </Form.Item>
      </Form>
    </CustomModal>
  );
};

export default HallPackageModal;