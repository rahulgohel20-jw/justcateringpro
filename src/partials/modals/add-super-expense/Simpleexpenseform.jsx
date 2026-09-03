// ─── Simpleexpenseform.jsx ────────────────────────────────────────────────────
import AddAccountMaster from "../accountmaster/AddAccountMaster";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Upload, FileText, X } from "lucide-react";
import Select from "react-select";
import {
  AddOrUpdateOfficeExpense,
  GetAllAccountContactMaster,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
// ✅ TAB_CONFIG removed — only import what Expenseconfig still exports
import {
  PAYMENT_METHODS,
  inputClass,
  FormLabel,
  ErrorMsg,
  SubmitFooter,
} from "./Expenseconfig";

// ✅ Local fallback config — handles any dynamic tab from API
const getTabConfig = (expenseType, intl) => {
  const configs = {
    trip: {
      label: intl.formatMessage({
        id: "COMMON.TRIP_EXPENSE",
        defaultMessage: "Trip Expense",
      }),
      sectionTitle: intl.formatMessage({
        id: "COMMON.TRIP_INFORMATION",
        defaultMessage: "Trip Information",
      }),
      titleField: {
        name: "tripName",
        label: intl.formatMessage({
          id: "COMMON.TRIP_TITLE",
          defaultMessage: "Trip Title",
        }),
        placeholder: intl.formatMessage({
          id: "COMMON.ENTER_TRIP_TITLE",
          defaultMessage: "e.g. Q3 Regional Sales Meet",
        }),
      },
      showDates: true,
      dateLabels: {
        start: intl.formatMessage({
          id: "COMMON.FROM_DATE",
          defaultMessage: "From Date",
        }),
        end: intl.formatMessage({
          id: "COMMON.TO_DATE",
          defaultMessage: "To Date",
        }),
      },
      color: "bg-blue-50 text-blue-600",
      icon: null,
    },

    employees: {
      label: intl.formatMessage({
        id: "COMMON.EMPLOYEE_EXPENSE",
        defaultMessage: "Employee Expense",
      }),
      sectionTitle: intl.formatMessage({
        id: "COMMON.EMPLOYEE_INFORMATION",
        defaultMessage: "Employee Information",
      }),
      titleField: {
        name: "employeeName",
        label: intl.formatMessage({
          id: "COMMON.EMPLOYEE_NAME",
          defaultMessage: "Employee Name",
        }),
        placeholder: intl.formatMessage({
          id: "COMMON.ENTER_EMPLOYEE_NAME",
          defaultMessage: "e.g. John Doe",
        }),
      },
      showDates: true,
      dateLabels: {
        start: intl.formatMessage({
          id: "COMMON.FROM_DATE",
          defaultMessage: "From Date",
        }),
        end: intl.formatMessage({
          id: "COMMON.TO_DATE",
          defaultMessage: "To Date",
        }),
      },
      color: "bg-violet-50 text-violet-600",
      icon: null,
    },

    office: {
      label: intl.formatMessage({
        id: "COMMON.OFFICE_EXPENSE",
        defaultMessage: "Office Expense",
      }),
      sectionTitle: intl.formatMessage({
        id: "COMMON.OFFICE_INFORMATION",
        defaultMessage: "Office Information",
      }),
      titleField: {
        name: "officeTitle",
        label: intl.formatMessage({
          id: "COMMON.EXPENSE_TITLE",
          defaultMessage: "Expense Title",
        }),
        placeholder: intl.formatMessage({
          id: "COMMON.ENTER_EXPENSE_TITLE",
          defaultMessage: "e.g. Stationery Purchase",
        }),
      },
      showDates: false,
      dateLabels: {},
      color: "bg-amber-50 text-amber-600",
      icon: null,
    },
  };

  return (
    configs[expenseType] ?? {
      label: expenseType
        ? `${expenseType.charAt(0).toUpperCase()}${expenseType.slice(1)} ${intl.formatMessage({
            id: "COMMON.EXPENSE",
            defaultMessage: "Expense",
          })}`
        : intl.formatMessage({
            id: "COMMON.EXPENSE",
            defaultMessage: "Expense",
          }),

      sectionTitle: intl.formatMessage({
        id: "COMMON.EXPENSE_INFORMATION",
        defaultMessage: "Expense Information",
      }),

      titleField: {
        name: "title",
        label: intl.formatMessage({
          id: "COMMON.EXPENSE_TITLE",
          defaultMessage: "Expense Title",
        }),
        placeholder: intl.formatMessage({
          id: "COMMON.ENTER_EXPENSE_TITLE",
          defaultMessage: "Enter expense title",
        }),
      },

      showDates: false,
      dateLabels: {},
      color: "bg-gray-50 text-gray-600",
      icon: null,
    }
  );
};

const toApiDate = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}/${m}/${y}` : "";
};

const buildSimpleFormData = (
  values,
  titleKey,
  userId,
  adminId,          
  isSuperAdmin,
  expenseType,
) => {
  const fd = new FormData();
  fd.append("id", values.id ?? -1);
  fd.append("userId", userId);
  fd.append("adminId", adminId);   
  fd.append("accountContactId", values.employeeId ?? "");
  fd.append("title", values.title || values[titleKey] || "");
  fd.append("expenseAmount", values.amount ?? 0);
  fd.append("expenseDate", toApiDate(values.expenseDate));
  fd.append("paymentMode", values.paymentMethod ?? "gpay");
  fd.append("remarks", values.remarks ?? "");
  fd.append("expenseType", expenseType);
  fd.append("incomeExpenseTypeId", values.incomeExpenseTypeId ?? "");
  if (values.paidDate) fd.append("paidDate", toApiDate(values.paidDate));
  if (isSuperAdmin && values.dueDate)
    fd.append("dueDate", toApiDate(values.dueDate));
  if (Array.isArray(values.billFiles)) {
    values.billFiles.forEach((file) => {
      if (file instanceof File) fd.append("doc", file);
    });
  }

  for (const [key, val] of fd.entries()) {
    console.log(key, ":", val);
  }

  return fd;
};



const SimpleExpenseForm = ({
  isOpen,
  onClose,
  expenseType = "employees",
  editData = null,
  typeId = null,
}) => {
 const intl = useIntl();

const config = getTabConfig(expenseType, intl);
  const titleKey = config.titleField.name;

 const userId = Number(localStorage.getItem("mainId"));   
  const adminId = Number(localStorage.getItem("userId"));  const isSuperAdmin = userId === 1;
  const isEditing = !!editData?.id;

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiError, setApiError] = useState("");
  const [managers, setManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const authStorage = JSON.parse(localStorage.getItem("auth-storage"));
  const roleId = authStorage?.state?.roleReportRights?.roleId;
  const refreshManagers = () => {
    setManagersLoading(true);
    GetAllAccountContactMaster(userId)
      .then((res) => {
        const list = res?.data?.data ?? [];
        setManagers(
          list.map((m) => ({
            value: m.accountContactId,
            label: m.name || "-",
          })),
        );
      })
      .catch(() => setManagers([]))
      .finally(() => setManagersLoading(false));
  };
  useEffect(() => {
    if (!isOpen) return;
    setApiError("");
    setUploadedFiles([]);
    refreshManagers();
  }, [isOpen]);

  const buildInitialValues = (data = null) => ({
    id: data?.id ?? null,
    [titleKey]: data?.userName || data?.[titleKey] || data?.title || "",
    title: data?.title ?? "",

    employeeId:
      data?.accountContactId ??
      data?.employeeId ??
      data?.memberId ??
      data?.userId ??
      null,

    expenseDate: data?.expenseDate
      ? /^\d{2}\/\d{2}\/\d{4}$/.test(data.expenseDate)
        ? (() => {
            const [d, m, y] = data.expenseDate.split("/");
            return `${y}-${m}-${d}`;
          })()
        : data.expenseDate.slice(0, 10)
      : "",
    paidDate: data?.paidDate
      ? (() => {
          const raw = (data.paidDate ?? "").split(" ")[0];
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
            const [d, m, y] = raw.split("/");
            return `${y}-${m}-${d}`;
          }
          return raw.slice(0, 10);
        })()
      : "",
    amount: data?.amount ?? data?.expenseAmount ?? "",
    ...(isSuperAdmin
      ? {
          dueDate: data?.dueDate
            ? /^\d{2}\/\d{2}\/\d{4}$/.test(data.dueDate)
              ? (() => {
                  const [d, m, y] = data.dueDate.split("/");
                  return `${y}-${m}-${d}`;
                })()
              : (data.dueDate ?? "").slice(0, 10)
            : "",
        }
      : {}),
    paymentMethod: data?.paymentMethod ?? data?.paymentMode ?? "gpay",
    remarks: data?.remarks ?? data?.remark ?? "",
    billFiles: [],
    incomeExpenseTypeId: data?.incomeExpenseTypeId ?? typeId ?? "",
  });

  const handleFiles = (files, setFieldValue, currentFiles) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      name: file.name,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    const merged = [...currentFiles, ...newFiles];
    setUploadedFiles(merged);
    setFieldValue(
      "billFiles",
      merged.map((f) => f.file),
    );
  };

  const removeFile = (index, setFieldValue, currentFiles) => {
    const updated = currentFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    setFieldValue(
      "billFiles",
      updated.map((f) => f.file),
    );
  };

  const handleDrop = (e, setFieldValue, currentFiles) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files, setFieldValue, currentFiles);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
  setApiError("");

  if (!userId || !adminId) {
    Swal.fire({
      icon: "warning",
      title: "Session Issue",
      text: "Could not detect logged-in user. Please log in again.",
    });
    setSubmitting(false);
    return;
  }

  try {
    const fd = buildSimpleFormData(
      values,
      titleKey,
      userId,
      adminId,          
      isSuperAdmin,
      expenseType,
    );
    const res = await AddOrUpdateOfficeExpense(fd);
    if (res?.data?.success || res?.success) {
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: res?.data?.msg || res?.msg || "Saved successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      onClose();
    } else {
      throw new Error(res?.data?.msg || res?.msg || "Something went wrong");
    }
  } catch (err) {
    const msg =
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      err.message ||
      "Something went wrong";
    Swal.fire({ icon: "error", title: "Error", text: msg });
    setApiError(msg);
  } finally {
    setSubmitting(false);
  }
};

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    expenseDate: Yup.string().required("Expense Date is required"),
    amount: Yup.number()
      .typeError("Must be a number")
      .required("Amount is required"),
  });

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[720px] max-w-full bg-white shadow-2xl z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.color}`}
              >
                {config.icon}
              </span> */}
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {isEditing ? "Edit" : "Add"} {config.label}
                </h2>
                <p className="text-xs text-gray-400">{config.sectionTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Formik
          key={`simple-${expenseType}-${editData?.id ?? "new"}`}
          initialValues={buildInitialValues(editData)}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, setFieldTouched, values }) => (
            <Form className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {apiError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                    {apiError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <FormLabel required>{config.titleField.label}</FormLabel>
                  <Field
                    name="title"
                    placeholder={config.titleField.placeholder}
                    className={inputClass}
                  />
                  <ErrorMsg name="title" />
                </div>

                {/* Account Contact */}
                {/* Account Contact */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel>
  <FormattedMessage id="COMMON.ACCOUNT_CONTACT" defaultMessage="Account Contact" />
</FormLabel>
                    {[1, 2].includes(Number(roleId)) && (
                      <button
                        type="button"
                        onClick={() => setShowAddAccount(true)}
                        className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-80 transition border-0 cursor-pointer"
                       title={intl.formatMessage({
  id: "COMMON.ADD_ACCOUNT_CONTACT",
  defaultMessage: "Add Account Contact",
})}

                      >
                        <span className="text-sm leading-none">+</span>
                      </button>
                    )}
                  </div>
                  <Select
                    options={managers}
                    isLoading={managersLoading}
                    placeholder={
                      managersLoading
                        ? "Loading..."
                        : "Select account contact..."
                    }
                    value={
                      managers.find((m) => m.value === values.employeeId) ??
                      null
                    }
                    onChange={(sel) => {
                      setFieldValue("employeeId", sel?.value ?? null);
                      setFieldTouched("employeeId", true);
                    }}
                    isClearable
                    noOptionsMessage={() => "No contacts found"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: state.isFocused ? "#60a5fa" : "#e5e7eb",
                        boxShadow: state.isFocused
                          ? "0 0 0 2px #dbeafe"
                          : "none",
                        fontSize: "0.875rem",
                        minHeight: "42px",
                        "&:hover": { borderColor: "#d1d5db" },
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "0.875rem",
                        backgroundColor: state.isSelected
                          ? "#1d4ed8"
                          : state.isFocused
                            ? "#eff6ff"
                            : "white",
                        color: state.isSelected ? "white" : "#1f2937",
                      }),
                      placeholder: (base) => ({ ...base, color: "#9ca3af" }),
                    }}
                  />
                </div>

                {/* Expense Date + Paid Date */}
                <div
                  className={`grid gap-4 ${isSuperAdmin ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  <div>
                 <FormLabel required>
  <FormattedMessage id="COMMON.EXPENSE_DATE" defaultMessage="Expense Date" />
</FormLabel>
                    <Field
                      name="expenseDate"
                      type="date"
                      className={inputClass}
                    />
                    <ErrorMsg name="expenseDate" />
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <FormLabel>
  <FormattedMessage id="COMMON.PAID_DATE" defaultMessage="Paid Date" />
</FormLabel>
                      <Field
                        name="paidDate"
                        type="date"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>

                {isSuperAdmin && (
                  <div>
                <FormLabel>
  <FormattedMessage id="COMMON.DUE_DATE" defaultMessage="Due Date" />
</FormLabel>
                    <Field name="dueDate" type="date" className={inputClass} />
                  </div>
                )}

                {/* Amount + Payment Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <FormLabel required>
  <FormattedMessage id="COMMON.AMOUNT" defaultMessage="Amount" />
</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                        ₹
                      </span>
                      <Field
                        name="amount"
                        placeholder="0.00"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    <ErrorMsg name="amount" />
                  </div>
                  <div>
                  <FormLabel>
  <FormattedMessage id="COMMON.PAYMENT_MODE" defaultMessage="Payment Mode" />
</FormLabel>  
                    <Field
                      as="select"
                      name="paymentMethod"
                      className={`${inputClass} bg-white`}
                    >
                    <option value="gpay">
  <FormattedMessage id="COMMON.GPAY" defaultMessage="G Pay" />
</option>

<option value="cash">
  <FormattedMessage id="COMMON.CASH" defaultMessage="Cash" />
</option>

<option value="card">
  <FormattedMessage id="COMMON.CARD" defaultMessage="Card" />
</option>

<option value="bank_transfer">
  <FormattedMessage id="COMMON.BANK_TRANSFER" defaultMessage="Bank Transfer" />
</option>

<option value="cheque">
  <FormattedMessage id="COMMON.CHEQUE" defaultMessage="Cheque" />
</option>
                    </Field>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <FormLabel>
  <FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />
</FormLabel>

                  <Field
                    as="textarea"
                    name="remarks"
                    rows="3"
                    placeholder="Add any additional details or notes..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Upload Bills */}
                <div>
                 <FormLabel>
  <FormattedMessage id="COMMON.UPLOAD_BILLS" defaultMessage="Upload Bills" />
</FormLabel>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    multiple
                    className="hidden"
                    id="simpleFileUpload"
                    onChange={(e) =>
                      handleFiles(
                        e.currentTarget.files,
                        setFieldValue,
                        uploadedFiles,
                      )
                    }
                  />
                  <label
                    htmlFor="simpleFileUpload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => handleDrop(e, setFieldValue, uploadedFiles)}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all mb-3
                      ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5 text-blue-500" />
                    </div>
                      <p className="text-sm font-semibold text-blue-600">
                        Click or drag files here
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, PDF — multiple allowed
                      </p>
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((f, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-white"
                        >
                          {f.preview ? (
                            <img
                              src={f.preview}
                              alt={f.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                          <p className="flex-1 text-sm font-medium text-gray-700 truncate">
                            {f.name}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              removeFile(index, setFieldValue, uploadedFiles)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition border-0 bg-transparent cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <SubmitFooter
                isSubmitting={isSubmitting}
                label={config.label}
                onClose={onClose}
                isEditing={isEditing}
              />
            </Form>
          )}
        </Formik>
        <AddAccountMaster
          open={showAddAccount}
          onClose={() => setShowAddAccount(false)}
          onSave={() => {
            setShowAddAccount(false);
            refreshManagers();
          }}
        />
      </div>
    </>
  );
};

export default SimpleExpenseForm;
