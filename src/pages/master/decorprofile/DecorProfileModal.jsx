import { useState, useEffect } from "react";
import { addupdatedecorprofile } from "@/services/apiServices";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import { formValidation } from "../../../lib/utils";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const initialFormState = {
  companyName: "",
  companyEmail: "",
  countryCode: "+91",
  officeNo: "",
  address: "",
  gstNumber: "",
  panNumber: "",
  cinNumber: "",
  hsnNumber: "",
};

const requiredFields = ["companyName", "companyEmail"];

const DecorProfileModal = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem("userId");

  /* -------------------- PREFILL -------------------- */
  useEffect(() => {
    if (!isModalOpen) return;
    setErrors({});
    if (editData) {
      setFormData({
        companyName: editData.companyName || "",
        companyEmail: editData.companyEmail || "",
        countryCode: editData.countryCode || "+91",
        officeNo: editData.officeNo || "",
        address: editData.address || "",
        gstNumber: editData.gstNumber || "",
        panNumber: editData.panNumber || "",
        cinNumber: editData.cinNumber || "",
        hsnNumber: editData.hsnNumber || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isModalOpen, editData]);

  if (!isModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------- VALIDATION -------------------- */
  const checkErrors = () => {
    const errorObject = formValidation(requiredFields, formData);

    if (
      formData.companyEmail &&
      !/^\S+@\S+\.\S+$/.test(formData.companyEmail)
    ) {
      errorObject.companyEmail = "Enter a valid email";
    }

    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      return false;
    }
    setErrors({});
    return true;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = () => {
    if (!checkErrors()) return;

    if (!userId) {
      Swal.fire("Error", "User data not found", "error");
      return;
    }

    const payload = {
      address: formData.address,
      cinNumber: formData.cinNumber,
      companyEmail: formData.companyEmail,
      companyName: formData.companyName,
      countryCode: formData.countryCode,
      gstNumber: formData.gstNumber,
      hsnNumber: formData.hsnNumber,
      officeNo: formData.officeNo,
      panNumber: formData.panNumber,
      userId: Number(userId),
    };

    setSaving(true);
    addupdatedecorprofile(payload)
      .then((res) => {
        if (res?.data?.success === false) {
          Swal.fire("Error", res.data?.msg || "Something went wrong", "error");
          return;
        }
        Swal.fire(
          "Success",
          res?.data?.msg || "Profile saved successfully",
          "success",
        );
        refreshData();
        setIsModalOpen(false);
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

  const inputCls = "border p-2 w-full rounded";

  const Err = ({ name }) =>
    errors[name] ? (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    ) : null;

  return (
    <CustomModal
      open={isModalOpen}
      width={800}
      title={editData ? "Edit Decor Profile" : "Create Decor Profile"}
      onClose={() => setIsModalOpen(false)}
      footer={[
        <button
          key="cancel"
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
        >
          <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
        </button>,
        <button
          key="save"
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-success text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {editData ? (
            <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
          ) : (
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          )}
        </button>,
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1">Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={inputCls}
          />
          <Err name="companyName" />
        </div>

        <div>
          <label className="block mb-1">Company Email *</label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={handleChange}
            className={inputCls}
          />
          <Err name="companyEmail" />
        </div>

        <div>
          <label className="block mb-1">Country Code</label>
          <input
            type="text"
            name="countryCode"
            value={formData.countryCode}
            onChange={handleChange}
            className={inputCls}
            placeholder="+91"
          />
        </div>

        <div>
          <label className="block mb-1">Office No.</label>
          <input
            type="tel"
            name="officeNo"
            value={formData.officeNo}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block mb-1">GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block mb-1">PAN Number</label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block mb-1">CIN Number</label>
          <input
            type="text"
            name="cinNumber"
            value={formData.cinNumber}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block mb-1">HSN Number</label>
          <input
            type="text"
            name="hsnNumber"
            value={formData.hsnNumber}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={inputCls}
            rows={3}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default DecorProfileModal;