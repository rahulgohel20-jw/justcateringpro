import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Select } from "antd";
import Swal from "sweetalert2";
import {
  CreateLabourHelper,
  UpdateLabourHelper,
  GetPartyMasterByCatId,
} from "@/services/apiServices";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAR_REGEX = /^\d{12}$/;
const PHONE_REGEX = /^\d{10}$/;

const Row = ({ label, required, error, children }) => (
  <div className="grid grid-cols-[160px_1fr] items-center gap-3">
    <label className="text-sm font-medium text-gray-700 text-right">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div>
      {children}
      {error && <span className="text-danger text-xs block mt-1">{error}</span>}
    </div>
  </div>
);

const FileUploadRow = ({ label, required, file, setFile, existingUrl }) => {
  const inputId = `file-${label.replace(/\s+/g, "-")}`;

  return (
    <Row label={label} required={required}>
      {file ? (
        <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-gray-50">
          <i className="ki-filled ki-document text-primary text-sm"></i>
          <span className="text-sm text-gray-700 truncate flex-1">
            {file.name}
          </span>
          <button
            type="button"
            className="text-danger hover:text-red-700"
            onClick={() => {
              setFile(null);
              document.getElementById(inputId).value = "";
            }}
            title="Remove"
          >
            <i className="ki-filled ki-cross text-sm"></i>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <label
            htmlFor={inputId}
            className="btn btn-light btn-sm cursor-pointer"
          >
            Choose File
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {existingUrl ? (
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View current file
            </a>
          ) : (
            <span className="text-xs text-gray-400">No file selected</span>
          )}
        </div>
      )}
    </Row>
  );
};

const AddLabourhelper = ({
  isOpen,
  onClose,
  refreshData,
  editData,
  categoryList,
}) => {
  const [form, setForm] = useState({
    name: "",
    contactCategoryId: "",
    phonenumber: "",
    pancard: "",
    aadharcard: "",
    partyId: "",
  });
  const [photo, setPhoto] = useState(null);
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [drivingLicence, setDrivingLicence] = useState(null);
  const [pancardFile, setPancardFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [partyList, setPartyList] = useState([]);
  const [partyLoading, setPartyLoading] = useState(false);
  let Id = localStorage.getItem("userId");

  useEffect(() => {
  if (!form.contactCategoryId) {
    setPartyList([]);
    return;
  }
  setPartyLoading(true);
 GetPartyMasterByCatId(form.contactCategoryId, Id)
  .then((res) => {
    const list = res?.data?.data?.["Party Details"] || [];
    setPartyList(Array.isArray(list) ? list : []);
  })
    .catch((error) => {
      console.error("Error fetching parties:", error);
      setPartyList([]);
    })
    .finally(() => setPartyLoading(false));
}, [form.contactCategoryId]);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        contactCategoryId: editData.contactCategoryId || "",
        phonenumber: editData.phonenumber || "",
        pancard: editData.pancard || "",
        aadharcard: editData.aadharcard || "",
        partyId: editData.partyId || "",
      });
    } else {
      setForm({
        name: "",
        contactCategoryId: "",
        phonenumber: "",
        pancard: "",
        aadharcard: "",
        partyId: "",
      });
    }
    setPhoto(null);
    setAadharFront(null);
    setAadharBack(null);
    setDrivingLicence(null);
    setPancardFile(null);
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.contactCategoryId) e.contactCategoryId = "Category is required";
    if (!PHONE_REGEX.test(form.phonenumber))
      e.phonenumber = "Enter a valid 10-digit phone number";
    if (form.pancard && !PAN_REGEX.test(form.pancard.toUpperCase()))
      e.pancard = "Enter a valid PAN (e.g. ABCDE1234F)";
    if (form.aadharcard && !AADHAR_REGEX.test(form.aadharcard))
      e.aadharcard = "Enter a valid 12-digit Aadhar number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();

      if (editData?.id) formData.append("id", editData.id);
      formData.append("name", form.name.trim());
      formData.append("contactCategoryId", form.contactCategoryId);
      formData.append("phonenumber", form.phonenumber);
      if (form.pancard) formData.append("pancard", form.pancard.toUpperCase());
      if (form.aadharcard) formData.append("aadharcard", form.aadharcard);
      if (form.partyId) formData.append("partyId", form.partyId);
      formData.append("userId", Id);

      if (photo) {
  formData.append("files[0].fileId", 0);
  formData.append("files[0].fileType", "PROFILE_PIC");
  formData.append("files[0].file", photo);
}
if (aadharFront) {
  formData.append("files[1].fileId", 1);
  formData.append("files[1].fileType", "AADHAR_FRONT");
  formData.append("files[1].file", aadharFront);
}
if (aadharBack) {
  formData.append("files[2].fileId", 2);
  formData.append("files[2].fileType", "AADHAR_BACK");
  formData.append("files[2].file", aadharBack);
}
if (drivingLicence) {
  formData.append("files[3].fileId", 3);
  formData.append("files[3].fileType", "DRIVING_LICENCE");
  formData.append("files[3].file", drivingLicence);
}
if (pancardFile) {
  formData.append("files[4].fileId", 4);
  formData.append("files[4].fileType", "PAN_CARD");
  formData.append("files[4].file", pancardFile);
}

      const res = editData
        ? await UpdateLabourHelper(formData)
        : await CreateLabourHelper(formData);

      if (res?.data?.success !== false) {
        Swal.fire({
          title: "Success!",
          text: res?.data?.msg || "Saved successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refreshData();
        onClose(false);
      } else {
        Swal.fire("Error", res?.data?.msg || "Save failed", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire(
        "Error",
        err?.response?.data?.msg || "Something went wrong",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-5">
          {editData ? "Edit Labour Helper" : "Add Labour Helper"}
        </h2>

        <div className="flex flex-col gap-3">
          <Row label="Name" required error={errors.name}>
            <input
              className="input w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Row>

          <Row label="Aadhar Card No." error={errors.aadharcard}>
            <input
              className="input w-full"
              maxLength={12}
              value={form.aadharcard}
              onChange={(e) =>
                setForm({
                  ...form,
                  aadharcard: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </Row>

          <Row label="Phone No." required error={errors.phonenumber}>
            <input
              className="input w-full"
              maxLength={10}
              value={form.phonenumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  phonenumber: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </Row>

          <Row label="Category" required error={errors.contactCategoryId}>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              value={form.contactCategoryId || undefined}
              onChange={(value) =>
                setForm({ ...form, contactCategoryId: value, partyId: "" })
              }
              options={(categoryList || []).map((c) => ({
                value: c.id,
                label: c.nameEnglish,
              }))}
            />
          </Row>

          <Row label="Main Account">
            <Select
              className="w-full"
              showSearch
              allowClear
              loading={partyLoading}
              disabled={!form.contactCategoryId}
              placeholder={
                form.contactCategoryId
                  ? "Select main account"
                  : "Select a category first"
              }
              optionFilterProp="label"
              value={form.partyId || undefined}
              onChange={(value) => setForm({ ...form, partyId: value || "" })}
              options={partyList.map((p) => ({
                value: p.id,
                label: p.nameEnglish,
              }))}
            />
          </Row>

          <Row label="Pan Card No." error={errors.pancard}>
            <input
              className="input w-full uppercase"
              maxLength={10}
              value={form.pancard}
              onChange={(e) =>
                setForm({ ...form, pancard: e.target.value.toUpperCase() })
              }
            />
          </Row>

          <FileUploadRow
            label="Upload Photo"
            file={photo}
            setFile={setPhoto}
            existingUrl={editData?.photo}
          />

          <FileUploadRow
            label="Aadhar Card Front"
            file={aadharFront}
            setFile={setAadharFront}
            existingUrl={editData?.aadharcarddocpathfront}
          />

          <FileUploadRow
            label="Aadhar Card Back"
            file={aadharBack}
            setFile={setAadharBack}
            existingUrl={editData?.aadharcarddocpathback}
          />

          <FileUploadRow
            label="Pan Card Document"
            file={pancardFile}
            setFile={setPancardFile}
            existingUrl={editData?.pancarddocpath}
          />

          <FileUploadRow
            label="Driving Licence"
            file={drivingLicence}
            setFile={setDrivingLicence}
            existingUrl={editData?.drivinglicense}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="btn btn-light"
            onClick={() => onClose(false)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddLabourhelper;