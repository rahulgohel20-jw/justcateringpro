import AddAccountMaster from "../accountmaster/AddAccountMaster";
import {
  Addupdateemployeeexpense,
  GETAllCity,
  GetAllAccountContactMaster,
} from "@/services/apiServices";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import {
  Upload,
  Trash2,
  Plus,
  FileText,
  MapPin,
  CreditCard,
  ClipboardList,
  CalendarDays,
  Banknote,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Select from "react-select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  inputClass,
  FormLabel,
  ErrorMsg,
  Section,
  SubmitFooter,
} from "./Expenseconfig";

const COMPLEX_TAB_CONFIG = {
  trip: {
    label: "Trip Expense",
    sectionTitle: "Trip Information",
    titleField: {
      name: "tripName",
      label: "Trip Title",
      placeholder: "e.g. Q3 Regional Sales Meet",
    },
    showCities: true,
    showDates: true,
    dateLabels: { start: "From Date", end: "To Date" },
    color: "bg-blue-50 text-blue-600",
  },
};

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return String(dateStr).slice(0, 10);
};

const toApiDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};

const buildFormData = (
  values,
  titleKey,
  expenseType,
  payloadUserId,   // ✅ renamed to avoid confusion — this fills payload's "userId"
  payloadAdminId,  // ✅ this fills payload's "adminId"
  expenseId = null,
) => {
  const fd = new FormData();
  fd.append("title", values[titleKey] ?? "");
  fd.append("userId", payloadUserId);
  fd.append("adminId", payloadAdminId);
  fd.append("accountContactId", values.memberId ?? payloadUserId);
  fd.append("totalAmount", values.amount);
  fd.append("expenseType", expenseType);
  fd.append("id", expenseId ?? -1);
  fd.append("remark", values.remark ?? "");

  if (values.startDate) fd.append("fromDate", toApiDate(values.startDate));
  if (values.endDate) fd.append("toDate", toApiDate(values.endDate));
  if (values.dueDate) fd.append("dueDate", toApiDate(values.dueDate));
  if (values.paidDate) fd.append("paidDate", toApiDate(values.paidDate));
  if (values.fromCity) fd.append("fromCityId", values.fromCity);
  if (values.toCity) fd.append("toCityId", values.toCity);

  (values.expenseRows ?? []).forEach((row, i) => {
    const k = (field) => `detailRequestDtos[${i}].${field}`;
    fd.append(k("perticular"), row.description ?? "");
    fd.append(k("expenseDate"), toApiDate(row.date));
    fd.append(k("paymentMode"), row.paymentMode || "gpay");
    fd.append(k("remarks"), row.remarks ?? "");
    fd.append(k("userId"), payloadUserId);
    fd.append(k("accountContactId"), values.memberId ?? payloadUserId);
    fd.append(k("amount"), row.amount ?? 0);
    fd.append(k("id"), row.id ?? -1);
    fd.append(k("expenseId"), row.expenseId ?? -1);
    fd.append(k("km"), row.km ?? 0);
    if (row.file instanceof File) fd.append(k("file"), row.file);
  });

  // 🔍 DEBUG — log every FormData entry so you can see exactly what's being sent
  console.log("=== FormData payload ===");
  for (const [key, val] of fd.entries()) {
    console.log(key, ":", val);
  }

  return fd;
};

const ComplexExpenseForm = ({
  isOpen,
  onClose,
  expenseType = "trip",
  editData = null,
  fetchExpenses,
}) => {
  const config = COMPLEX_TAB_CONFIG[expenseType] ?? COMPLEX_TAB_CONFIG.trip;
  const storageMainId = Number(localStorage.getItem("mainId"));
  // ✅ storageUserId maps to payload "adminId"
  const storageUserId = Number(localStorage.getItem("userId"));
  const isSuperAdmin = storageMainId  === 1;

  const [rowPreviews, setRowPreviews] = useState({});
  const [apiError, setApiError] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [notesOpen, setNotesOpen] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const citySelectOptions = cityOptions.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const titleKey = config.titleField.name;
  const isEditing = !!editData?.id;
  const getRoleId = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      return auth?.state?.user?.userBasicDetails?.role?.id ?? null;
    } catch {
      return null;
    }
  };
  const authStorage = JSON.parse(localStorage.getItem("auth-storage"));

  const roleId = getRoleId();
  const refreshMembers = () => {
    GetAllAccountContactMaster(storageMainId  )
      .then((res) => {
        const list = res?.data?.data ?? [];
        setMembers(
          list.map((m) => ({
            value: m.accountContactId,
            label: m.name || "-",
            subtitle: m.memberType || "",
          })),
        );
      })
      .catch(() => setMembers([]));
  };

  useEffect(() => {
    if (isOpen) {
      setApiError("");
      refreshMembers();
    }
  }, [isOpen, editData]);

  useEffect(() => {
    if (isOpen && config.showCities) {
      GETAllCity()
        .then((res) => setCityOptions(res?.data?.data?.["city Details"] ?? []))
        .catch(() => setCityOptions([]));
    }
  }, [isOpen, config.showCities]);

  useEffect(() => {
    if (isOpen) {
      setApiError("");
      const previews = {};
      (editData?.expenseRows ?? []).forEach((row, i) => {
        if (row.existingDocUrl) {
          previews[i] = /\.(png|jpe?g|gif|webp)$/i.test(row.existingDocUrl)
            ? row.existingDocUrl
            : row.existingDocUrl.split("/").pop() || "Existing Bill";
        }
      });
      setRowPreviews(previews);
    }
  }, [isOpen, editData]);

  const buildInitialValues = (data = null) => ({
    id: data?.id ?? null,
    [titleKey]: data?.[titleKey] ?? data?.title ?? "",
    startDate: toInputDate(data?.fromDate ?? data?.startDate ?? ""),
    endDate: toInputDate(data?.toDate ?? data?.endDate ?? ""),
    fromCity: data?.fromCityId ?? data?.fromCity ?? null,
    toCity: data?.toCityId ?? data?.toCity ?? null,
    amount: data?.totalAmount ?? data?.amount ?? "",
    remark: data?.remark ?? "",
    memberId: data?.memberId ?? data?.accountContactId ?? storageMainId ,
    dueDate: toInputDate(data?.dueDate ?? ""),
    paidDate: toInputDate(data?.paidDate ?? ""),
    expenseRows: (data?.detailRequestDtos ?? data?.expenseRows ?? []).map(
      (r) => ({
        id: r.id ?? -1,
        expenseId: r.expenseId ?? data?.id ?? -1,
        date: toInputDate(r.expenseDate ?? r.date ?? ""),
        description: r.perticular ?? r.description ?? "",
        paymentMode: r.paymentMode ?? "gpay",
        amount: r.amount ?? "",
        remarks: r.remarks ?? "",
        km: r.km ?? "",
        file: null,
        existingDocUrl: r.docPath ?? r.existingDocUrl ?? null,
      }),
    ),
  });

  const handleRowFile = (e, index, form) => {
    const file = e.currentTarget.files[0];
    if (!file) return;
    form.setFieldValue(`expenseRows.${index}.file`, file);
    setRowPreviews((p) => ({
      ...p,
      [index]: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : file.name,
    }));
  };

 const handleSubmit = async (values, { setSubmitting }) => {
  setApiError("");

  if (!storageMainId || !storageUserId) {
    Swal.fire({
      icon: "warning",
      title: "Session Issue",
      text: "Could not detect logged-in user. Please log in again.",
    });
    setSubmitting(false);
    return;
  }

  console.log("DEBUG →", { storageMainId, storageUserId }); // sanity check before sending

  try {
    const fd = buildFormData(
      values,
      titleKey,
      expenseType,
      storageMainId,    // → payload "userId"
      storageUserId,    // → payload "adminId"
      values.id ?? null,
    );
    const res = await Addupdateemployeeexpense(fd);
    if (res?.data?.success || res?.success) {
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: res?.data?.msg || res?.msg || "Saved successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchExpenses?.();
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
  const MemberOption = ({ data, ...props }) => (
    <div
      {...props.innerProps}
      className="flex items-center gap-3 px-3 py-2 cursor-pointer "
    >
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
        {data.label?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <div>
        <p className="text-sm font-semibold ">{data.label}</p>
        {data.subtitle && (
          <p className="text-xs text-gray-400 uppercase">{data.subtitle}</p>
        )}
      </div>
    </div>
  );

  const MemberSingleValue = ({ data }) => (
    <div className="flex items-center gap-2">
      {/* <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
        {data.label?.charAt(0)?.toUpperCase() ?? "?"}
      </div> */}
      <div>
        <p className="text-sm font-medium ">{data.label}</p>
        {/* {data.subtitle && (
          <p className="text-[10px] text-gray-400 uppercase leading-none">
            {data.subtitle}
          </p>
        )} */}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[880px] max-w-full bg-[#fafafa] shadow-2xl z-50
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-base font-bold text-gray-900">
                {isEditing ? "Edit" : "Add"} {config.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {roleId !== 2 && (
          <div className="flex-shrink-0 border-b border-primary">
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-3 transition border-0 cursor-pointer"
            >
              <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                Important Policy Notes
              </span>
              {notesOpen ? (
                <ChevronUp className="w-4 h-4 text-primary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-primary" />
              )}
            </button>
            {notesOpen && (
              <div className="px-6 pb-3 pt-1">
                <ul className="text-xs text-black space-y-1 list-disc list-inside">
                  <li>
                    Please ensure all receipts are clear and legible before
                    uploading.
                  </li>
                  <li>
                    Breakfast Allowed <span className="font-semibold">₹50</span>{" "}
                    per person.
                  </li>
                  <li>
                    Lunch Allowed <span className="font-semibold">₹120</span>{" "}
                    Per Person
                  </li>
                  <li>
                    Dinner Allowed <span className="font-semibold">150</span>{" "}
                    Per Person
                  </li>
                  <li>
                    1 km = <span className="font-semibold">₹2.5</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Formik ── */}
        <Formik
          key={`complex-${expenseType}-${editData?.id ?? "new"}`}
          initialValues={buildInitialValues(editData)}
          validationSchema={Yup.object({
            [titleKey]: Yup.string().required(
              `${config.titleField.label} is required`,
            ),
            startDate: Yup.string().required("From Date is required"),
          })}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => {
            const rowTotal = values.expenseRows.reduce(
              (sum, row) => sum + (parseFloat(row.amount) || 0),
              0,
            );
            if (values.amount !== rowTotal) {
              setTimeout(() => setFieldValue("amount", rowTotal), 0);
            }

            return (
              <Form className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {apiError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
                      {apiError}
                    </div>
                  )}

                  {/* ── Trip Details ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-black" />
                      <h3 className="text-sm font-bold ">Trip Details</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <FormLabel required>
                          {config.titleField.label}
                        </FormLabel>
                        <Field
                          name={titleKey}
                          placeholder={config.titleField.placeholder}
                          className={inputClass}
                        />
                        <ErrorMsg name={titleKey} />
                      </div>

                      <div>
                        <FormLabel>Claimant / Member</FormLabel>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Select
                              options={members}
                              placeholder="Select member..."
                              components={{
                                Option: MemberOption,
                                SingleValue: MemberSingleValue,
                              }}
                              value={
                                members.find(
                                  (m) =>
                                    String(m.value) === String(values.memberId),
                                ) || null
                              }
                              onChange={(sel) =>
                                setFieldValue("memberId", sel?.value ?? null)
                              }
                              isClearable
                              noOptionsMessage={() => "No members found"}
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  borderRadius: 10,
                                  borderColor: "#e5e7eb",
                                }),
                                menu: (base) => ({
                                  ...base,
                                  borderRadius: 12,
                                  overflow: "hidden",
                                }),
                              }}
                            />
                          </div>

                          {[1, 2].includes(Number(roleId)) && (
                            <button
                              type="button"
                              onClick={() => setAddMemberOpen(true)}
                              className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white border-0 cursor-pointer flex-shrink-0 hover:opacity-90 transition"
                              title="Add new member"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <FormLabel required>From Date</FormLabel>
                        <DatePicker
                          format="YYYY-MM-DD"
                          className="w-full"
                          value={
                            values.startDate ? dayjs(values.startDate) : null
                          }
                          onChange={(date) =>
                            setFieldValue(
                              "startDate",
                              date ? date.format("YYYY-MM-DD") : "",
                            )
                          }
                        />
                        <ErrorMsg name="startDate" />
                      </div>
                      <div>
                        <FormLabel>To Date</FormLabel>
                        <DatePicker
                          format="YYYY-MM-DD"
                          className="w-full"
                          value={values.endDate ? dayjs(values.endDate) : null}
                          onChange={(date) =>
                            setFieldValue(
                              "endDate",
                              date ? date.format("YYYY-MM-DD") : "",
                            )
                          }
                          disabledDate={(current) =>
                            values.startDate
                              ? current &&
                                current < dayjs(values.startDate).startOf("day")
                              : false
                          }
                        />
                      </div>
                      <div>
                        <FormLabel>From City</FormLabel>
                        <Select
                          options={citySelectOptions}
                          placeholder="City..."
                          value={
                            citySelectOptions.find(
                              (opt) => opt.value === values.fromCity,
                            ) ?? null
                          }
                          onChange={(sel) =>
                            setFieldValue("fromCity", sel?.value ?? null)
                          }
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: 10,
                              borderColor: "#e5e7eb",
                            }),
                          }}
                        />
                      </div>
                      <div>
                        <FormLabel>To City</FormLabel>
                        <Select
                          options={citySelectOptions}
                          placeholder="City..."
                          value={
                            citySelectOptions.find(
                              (opt) => opt.value === values.toCity,
                            ) ?? null
                          }
                          onChange={(sel) =>
                            setFieldValue("toCity", sel?.value ?? null)
                          }
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: 10,
                              borderColor: "#e5e7eb",
                            }),
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Expense Rows ── */}
                  <FieldArray name="expenseRows">
                    {({ push, remove, form }) => (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-black" />
                            <h3 className="text-sm font-bold ">
                              Expenses
                              {form.values.expenseRows.length > 0 && (
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                  {form.values.expenseRows.length} item
                                  {form.values.expenseRows.length !== 1
                                    ? "s"
                                    : ""}
                                </span>
                              )}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              push({
                                id: -1,
                                expenseId: editData?.id ?? -1,
                                date: values.startDate || "",
                                description: "",
                                paymentMode: "gpay",
                                amount: "",
                                remarks: "",
                                km: "",
                                file: null,
                                existingDocUrl: null,
                              })
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary  text-white text-xs font-semibold border-0 cursor-pointer transition shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Expense
                          </button>
                        </div>

                        {form.values.expenseRows.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                            <ClipboardList className="w-8 h-8 mb-2" />
                            <p className="text-sm text-gray-400">
                              No expenses yet. Click{" "}
                              <span className="text-black font-semibold">
                                Add Expense
                              </span>{" "}
                              to begin.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {form.values.expenseRows.map((row, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                              >
                                {/* Row top: date + description + payment mode */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      Expense Date
                                    </p>
                                    <DatePicker
                                      format="YYYY-MM-DD"
                                      className="w-full"
                                      value={row.date ? dayjs(row.date) : null}
                                      onChange={(date) =>
                                        form.setFieldValue(
                                          `expenseRows.${index}.date`,
                                          date ? date.format("YYYY-MM-DD") : "",
                                        )
                                      }
                                      disabledDate={(current) =>
                                        values.startDate
                                          ? current &&
                                            current <
                                              dayjs(values.startDate).startOf(
                                                "day",
                                              )
                                          : false
                                      }
                                    />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      Description
                                    </p>
                                    <Field
                                      name={`expenseRows.${index}.description`}
                                      placeholder="e.g. Client Dinner"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      Payment Mode
                                    </p>
                                    <Field
  as="select"
  name={`expenseRows.${index}.paymentMode`}
  className={`${inputClass} bg-white`}
>
  <option value="">Select</option>
  <option value="gpay">G Pay</option>
  <option value="cash">Cash</option>
</Field>
                                  </div>
                                </div>

                                {/* Row bottom: amount + km + upload + delete */}
                                <div className="flex items-end gap-3">
                                  <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      Amount (₹)
                                    </p>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm font-medium">
                                        ₹
                                      </span>
                                      <Field
                                        name={`expenseRows.${index}.amount`}
                                        placeholder="0.00"
                                        className={`${inputClass} pl-7`}
                                      />
                                    </div>
                                  </div>
                                  <div className="w-24">
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      KM
                                    </p>
                                    <Field
                                      name={`expenseRows.${index}.km`}
                                      placeholder="0"
                                      className={inputClass}
                                    />
                                  </div>

                                  {/* Upload bill */}
                                  <div className="flex flex-col items-center">
                                    <p className="text-[10px] font-semibold text-black uppercase mb-1">
                                      Bill
                                    </p>
                                    <input
                                      type="file"
                                      accept=".png,.jpg,.jpeg,.pdf"
                                      id={`rowFile-${index}`}
                                      className="hidden"
                                      onChange={(e) =>
                                        handleRowFile(e, index, form)
                                      }
                                    />
                                    <label
                                      htmlFor={`rowFile-${index}`}
                                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border cursor-pointer transition text-xs font-medium
                                        ${
                                          rowPreviews[index]
                                            ? "border-blue-300 bg-blue-50 text-blue-600"
                                            : "border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
                                        }`}
                                      title={
                                        rowPreviews[index]
                                          ? typeof rowPreviews[index] ===
                                              "string" &&
                                            rowPreviews[index].startsWith(
                                              "blob:",
                                            )
                                            ? "Image uploaded"
                                            : rowPreviews[index]
                                          : "Upload Bill"
                                      }
                                    >
                                      {rowPreviews[index] ? (
                                        <FileText className="w-3.5 h-3.5" />
                                      ) : (
                                        <Upload className="w-3.5 h-3.5" />
                                      )}
                                      {rowPreviews[index]
                                        ? "Uploaded"
                                        : "Upload"}
                                    </label>
                                  </div>

                                  {/* Delete row */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      remove(index);
                                      setRowPreviews((p) => {
                                        const n = { ...p };
                                        delete n[index];
                                        return n;
                                      });
                                    }}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition border-0 cursor-pointer mb-0.5"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </FieldArray>

                  {/* ── Settlement Details ── */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-bold ">Settlement Details</h3>
                    </div>

                    {/* Total amount banner */}
                    <div className="flex items-center justify-between  rounded-xl px-4 py-3 mb-4 border border-primary">
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase">
                          Total Trip Expense
                        </p>
                        <p className="text-[10px] text-black mt-0.5">
                          Auto-calculated based on listed items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₹
                          {values.expenseRows
                            .reduce(
                              (sum, row) => sum + (parseFloat(row.amount) || 0),
                              0,
                            )
                            .toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                        </p>
                      </div>
                    </div>

                    {/* Due date + Paid date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <FormLabel>Due Date</FormLabel>
                        <DatePicker
                          format="YYYY-MM-DD"
                          className="w-full"
                          value={values.dueDate ? dayjs(values.dueDate) : null}
                          onChange={(date) =>
                            setFieldValue(
                              "dueDate",
                              date ? date.format("YYYY-MM-DD") : "",
                            )
                          }
                          placeholder="Select due date"
                        />
                      </div>
                      <div>
                        <FormLabel>
                          Paid Date{" "}
                          <span className="text-black font-normal">
                            (Optional)
                          </span>
                        </FormLabel>
                        <DatePicker
                          format="YYYY-MM-DD"
                          className="w-full"
                          value={
                            values.paidDate ? dayjs(values.paidDate) : null
                          }
                          onChange={(date) =>
                            setFieldValue(
                              "paidDate",
                              date ? date.format("YYYY-MM-DD") : "",
                            )
                          }
                          placeholder="Select paid date"
                        />
                      </div>
                    </div>

                    {/* Remarks */}
                    <div>
                      <FormLabel>Internal Remarks</FormLabel>
                      <Field
                        as="textarea"
                        name="remark"
                        rows="3"
                        placeholder="e.g. Sales strategy meeting with Client X. Includes accommodation and local transport."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer bg-white"
                  >
                    Cancel Submission
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary  text-white text-sm font-semibold transition cursor-pointer border-0 disabled:opacity-60 shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {isSubmitting ? "Submitting..." : `Submit Trip Expense`}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>

      <AddAccountMaster
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        editData={null}
        onSave={() => {
          setAddMemberOpen(false); // close modal
          refreshMembers(); // refresh list without page reload
        }}
      />
    </>
  );
};

export default ComplexExpenseForm;
