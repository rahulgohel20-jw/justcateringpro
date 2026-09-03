import { DatePicker } from "antd";
import { Crown, Sparkles, BedDouble, Plus, Trash2 } from "lucide-react";
import MealTypeDropdown from "@/components/dropdowns/MealTypeDropdown";
import { useEffect, useState, useRef, useMemo } from "react";
import ManagerDropdown from "@/components/dropdowns/ManagerDropdown";
import AddMember from "@/partials/modals/add-member/AddMember";
import AddMeal from "@/partials/modals/add-meal/AddMeal";
import AddRoomModal from "../../../partials/modals/add-room/AddRoomModal";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

import useStyles from "./style";
import {
  GetMealType,
  Fetchmanager,
  Translateapi,
  GetAllRooms,
} from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import dayjs from "dayjs";
import { useLanguage } from "@/i18n";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const createEmptyRoom = (startDate) => {
  const base = startDate
    ? dayjs(startDate, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"])
    : dayjs();
  return {
    id: Date.now() + Math.random(),
    roomId: "",
    qty: 1,
    price: "",
    bookingdate: base.isValid() ? base.format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
    bookingcheckoutdate: base.isValid()
      ? base.add(1, "day").format("DD/MM/YYYY")
      : dayjs().add(1, "day").format("DD/MM/YYYY"),
    total: 0,
    eventId: 0,
  };
};

const OtherInfoStep = ({ formData, setFormData, onInputChange, errors, eventStartDateTime }) => {
  const classes = useStyles();
  const { isRTL, locale } = useLanguage();
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [options, setOptions] = useState([]);
  const [manager, setManager] = useState([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  // const [translating, setTranslating] = useState(false);
  // const translateTimer = useRef(null);
  // const mealTranslateTimer = useRef(null);
  // const [mealTranslating, setMealTranslating] = useState(false);
  // const serviceTranslateTimer = useRef(null);
  // const themeTranslateTimer = useRef(null);
  // const [serviceTranslating, setServiceTranslating] = useState(false);
  // const [themeTranslating, setThemeTranslating] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const { hasModuleAccess } = useModuleAccess();
  const canAccessRooms = hasModuleAccess("Banquet");
// const langConfig = getLangConfig();
 const isPro = useMemo(() => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return ["jcxpro", "justbanq"].includes(auth?.state?.user?.softType); 
  } catch {
    return false;
  }
}, []);




  // ─── Room state ──────────────────────────────────────────────────────────────
  const [roomList, setRoomList] = useState([]);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const dateFormat = "DD/MM/YYYY";
  let Id = localStorage.getItem("userId");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, [isRTL, locale]);

  const debounceRef = useRef(null);

const useTranslate = (englishKey, gujaratiKey, hindiKey) => {
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!formData[englishKey]?.trim()) {
      setFormData((prev) => ({ ...prev, [gujaratiKey]: "", [hindiKey]: "" }));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await Translateapi(formData[englishKey]);
        const data = res?.data?.data || res?.data || {};
        const { regional, hindi } = extractTranslations(data);
        setFormData((prev) => ({ ...prev, [gujaratiKey]: regional, [hindiKey]: hindi }));
      } catch (err) {
        console.error("Translation error:", err);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [formData[englishKey]]);
};


useTranslate("meal_notes", "meal_notes_gujarati", "meal_notes_hindi");
useTranslate("service", "serviceGujarati", "serviceHindi");
useTranslate("theme", "themeGujarati", "themeHindi");
useTranslate("remark", "remarksGujarati", "remarksHindi");

  const getLocalizedField = (item, fieldName) => {
    if (!item) return "";
    switch (lang) {
      case "hi":
        return item[`${fieldName}Hindi`] || item[`${fieldName}English`] || "";
      case "gu":
        return (
          item[`${fieldName}Gujarati`] || item[`${fieldName}English`] || ""
        );
      default:
        return item[`${fieldName}English`] || "";
    }
  };

  // ─── Fetch rooms ─────────────────────────────────────────────────────────────
  const fetchRooms = async () => {
    try {
      const res = await GetAllRooms(Id);
      const items = res?.data?.data["Room Details"] || res?.data || [];
      setRoomList(
        Array.isArray(items)
          ? items.map((r) => ({
              value: r.id,
              label: r.nameEnglish || `Room ${r.id}`,
              price: r.price || 0,
            }))
          : [],
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleAddClick = () => setShowCustomerModal(true);

  const handleInputChange = ({ target: { value, name } }) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleMealTypeChange = (value) =>
    setFormData({ ...formData, mealTypeId: value });
  const handleMangerNameChange = (value) =>
    setFormData({ ...formData, managerId: value });

  const handleGroomBirthDateChange = (date) => {
    setFormData({
      ...formData,
      groomBirthDate: date ? dayjs(date).format(dateFormat) : "",
    });
  };
  const handleBrideBirthDateChange = (date) => {
    setFormData({
      ...formData,
      brideBirthDate: date ? dayjs(date).format(dateFormat) : "",
    });
  };

  const handleCommunityChange = (e) => {
    const { name, value } = e.target;
    if ((value.match(/\d/g) || []).length > 10) return;
    setFormData({ ...formData, [name]: value });
  };

  const FetchMealtype = (autoSelectLatest = false) => {
    GetMealType(Id)
      .then((res) => {
        const mealdata = res?.data?.data?.["MealType Details"] || [];
        const mealOptions = mealdata.map((item) => ({
          label: getLocalizedField(item, "name"),
          value: item.id,
          nameEnglish: item.nameEnglish,
          nameHindi: item.nameHindi,
          nameGujarati: item.nameGujarati,
        }));
        setOptions(mealOptions);
        if (autoSelectLatest && mealOptions.length > 0) {
          setFormData((prev) => ({
            ...prev,
             mealTypeId: prev.mealTypeId || mealOptions[0].value,
          }));
        }
      })
      .catch(console.log);
  };

  const FetchManager = (autoSelectLatest = false) => {
    Fetchmanager(Id).then((res) => {
      const managerList = res.data.data["userDetails"].map((man, index) => ({
        sr_no: index + 1,
        value: man.id,
        label: man.firstName || "-",
      }));
      setManager(managerList);
      if (autoSelectLatest && managerList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          managerId: managerList[managerList.length - 1].value,
        }));
      }
    });
  };

  useEffect(() => {
  if (!formData.managerId && manager.length > 0) {
    const authStorage = localStorage.getItem("auth-storage");
    try {
      const parsed = JSON.parse(authStorage);
      const loggedInUserId = parsed?.state?.user?.id || parsed?.state?.user?.userId || null;
      if (loggedInUserId) {
        const match = manager.find((m) => String(m.value) === String(loggedInUserId));
        if (match) {
          setFormData((prev) => ({ ...prev, managerId: match.value }));
        }
      }
    } catch {
      // ignore
    }
  }
}, [manager]);

  useEffect(() => {
    FetchMealtype(true);
    FetchManager();
    fetchRooms();
  }, [lang]);

  const handleMealTypeAdded = () => FetchMealtype(true);
  const handleManagerAdded = () => FetchManager(true);

  // ─── Room row helpers ─────────────────────────────────────────────────────────
  const getRoomRows = () => formData.eventRooms || [];

  const updateRoomRows = (rows) =>
    setFormData((prev) => ({ ...prev, eventRooms: rows }));

 const handleAddRoom = () =>
  updateRoomRows([...getRoomRows(), createEmptyRoom(eventStartDateTime)]);

  const handleRemoveRoom = (idx) => {
    const updated = getRoomRows().filter((_, i) => i !== idx);
    updateRoomRows(updated.length ? updated : []);
  };

  const handleRoomFieldChange = (idx, field, value) => {
    const updated = getRoomRows().map((row, i) => {
      if (i !== idx) return row;
      const newRow = { ...row, [field]: value };

      // Auto-fill price from room master when roomId changes
      if (field === "roomId") {
        const found = roomList.find((r) => String(r.value) === String(value));
        if (found) newRow.price = found.price;
      }

      // Recalculate total whenever qty or price changes
      const qty = field === "qty" ? Number(value) : Number(newRow.qty) || 0;
      const price =
        field === "price" ? Number(value) : Number(newRow.price) || 0;
      newRow.total = qty * price;

      return newRow;
    });
    updateRoomRows(updated);
  };

  const roomRows = getRoomRows();

  return (
    <>
      <div className={`flex flex-col gap-3 lg:gap-4 ${classes.customStyle}`}>
        {/* ── Food Preference ───────────────────────────────────────────────── */}
        <div className="card min-w-full">
          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <Sparkles className="text-primary" />
              <p className="text-base font-medium text-gray-900">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_OTHER_INFO_MEAL_AND_NOTES"
                  defaultMessage="Food Prefrence"
                />
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-3 p-4 grid grid-cols-1 md:grid-cols-3">
              <div className="sg__inner flex flex-col w-full gap-1">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_OTHER_INFO_MEAL_AND_NOTES_MEAL_TYPE"
                    defaultMessage="Prefrence"
                  />
                  <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                    *
                  </span>
                </label>
                <div className="select__grp flex flex-col">
                  <div className="sg__inner flex items-center gap-1 relative">
                    <MealTypeDropdown
                      value={formData.mealTypeId || ""}
                      name="mealTypeId"
                      
                      onChange={handleMealTypeChange}
                      createBtn={true}
                      options={options}
                      className="w-full pr-14"
                      setCreateModalOpen={setShowCustomerModal}
                    />
                    <button
                      type="button"
                      onClick={handleAddClick}
                      title="Add"
                      className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
                    >
                      <i className="ki-filled ki-plus text-sm"></i>
                    </button>
                  </div>
                </div>
                {errors.mealTypeId && (
                  <span className="text-red-500 text-sm">
                    {errors.mealTypeId}
                  </span>
                )}
              </div>

             <div className="md:col-span-3">
 <MultiLangInputBox
  formData={formData}
  setFormData={setFormData}
  label="Meal Notes"
  type="textarea"
  required={false}
  cols={3}
  keys={{ english: "meal_notes", regional: "meal_notes_gujarati", hindi: "meal_notes_hindi" }}
/>
</div>


{/* <div className="w-full">
  <label className="form-label">
    <FormattedMessage
      id="USER.EVENT.PERMISSABLE_ITEM"
      defaultMessage="Permissable Item"
    />
  </label>
  <textarea
    className="textarea w-full"
    rows={3}
    name="permissable_item"
    value={formData.permissable_item || ""}
    onChange={handleInputChange}
  />
</div>


<div className="w-full">
  <label className="form-label">
    <FormattedMessage
      id="USER.EVENT.NOT_PERMISSABLE_ITEM"
      defaultMessage="Not Permissable Item"
    />
  </label>
  <textarea
    className="textarea w-full"
    rows={3}
    name="not_permissable_item"
    value={formData.not_permissable_item || ""}
    onChange={handleInputChange}
  />
</div> */}

            </div>
          </div>
        </div>

        {/* ── Sales Executive ───────────────────────────────────────────────── */}
        <div className="card w-full">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-primary" />
              <p className="text-base font-medium text-gray-900 flex items-center gap-1">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_OTHER_INFO_SERVICE_AND_REMARK"
                  defaultMessage="Sales Executive"
                />
                <span className="text-red-500 font-semibold">*</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-[330px]">
                  <ManagerDropdown
                    value={formData.managerId || ""}
                    name="managerId"
                    onChange={onInputChange}
                    options={manager}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  title="Add Manager"
                  className="btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
                >
                  <i className="ki-filled ki-plus"></i>
                </button>
              </div>
              {errors.managerId && (
                <span className="text-red-600 font-normal text-sm">
                  {errors.managerId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Service / Remark ──────────────────────────────────────────────── */}
        <div className="card min-w-full">
          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <Sparkles className="text-primary" />
              <p className="text-base font-medium text-gray-900">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_OTHER_INFO_SERVICE_AND_REMARK"
                  defaultMessage="Service/Remark"
                />
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-3 p-4 grid grid-cols-1 md:grid-cols-3">
              {/* Service */}
              <div className="md:col-span-3">
 <MultiLangInputBox
  formData={formData}
  setFormData={setFormData}
  label="Service"
  type="textarea"
  cols={3}
  required={false}
  keys={{ english: "service", regional: "serviceGujarati", hindi: "serviceHindi" }}
/>
</div>
              {/* Theme */}
              <div className="md:col-span-3">
 <MultiLangInputBox
  formData={formData}
  setFormData={setFormData}
  label="Theme"
  type="textarea"
  cols={3}
  required={false}
  keys={{ english: "theme", regional: "themeGujarati", hindi: "themeHindi" }}
/>
</div>

          
             <div className="md:col-span-3">
  <MultiLangInputBox
  formData={formData}
  setFormData={setFormData}
  label="Remarks"
  type="textarea"
  cols={3}
  required={false}
  keys={{ english: "remark", regional: "remarksGujarati", hindi: "remarksHindi" }}
/>
</div>


  <div className="">
    <label className="form-label">
      <FormattedMessage
        id="USER.EVENT.INTERNAL_STAFF_DISCUSSION"
        defaultMessage="Internal Staff Discussion"
      />
    </label>
    <textarea
      className="textarea w-full"
      rows={3}
      name="internal_staff_discussion"
      value={formData.internal_staff_discussion || ""}
      onChange={handleInputChange}
    />
  </div>


{/* Rate Discussion */}

  <div className="">
    <label className="form-label">
      <FormattedMessage
        id="USER.EVENT.RATE_DISCUSSION"
        defaultMessage="Rate Discussion"
      />
    </label>
    <textarea
      className="textarea w-full"
      rows={3}
      name="rate_discussion"
      value={formData.rate_discussion || ""}
      onChange={handleInputChange}
    />
  
</div>
            </div>
          </div>
        </div>

        {/* ── ✅ NEW: Room Details ───────────────────────────────────────────── */}
        {canAccessRooms && !isPro && (
          <div className="card min-w-full">
            <div className="flex flex-col flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="text-primary" />
                  <p className="text-base font-medium text-gray-900">
                    Room Details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRoom}
                  className="btn btn-primary btn-sm flex items-center gap-1"
                >
                  <Plus size={14} /> Add Room
                </button>
              </div>

              <div className="border-t border-gray-200">
                {roomRows.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No rooms added. Click "Add Room" to start.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-700 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              Room
                              <button
                                type="button"
                                onClick={() => setIsAddRoomModalOpen(true)}
                                className="btn btn-primary flex items-center justify-center rounded-full p-0 w-5 h-5"
                                title="Add new room"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 min-w-[130px]">
                            Check-in Date
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 min-w-[130px]">
                            Check-out Date
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-[90px]">
                            Qty
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-[110px]">
                            Price
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-[110px]">
                            Total
                          </th>
                          <th className="p-3 w-[50px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomRows.map((row, idx) => (
                          <tr
                            key={row.id || idx}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            {/* Room searchable select */}
                            <td className="p-2">
                              <select
                                className="select w-full"
                                value={row.roomId || ""}
                                onChange={(e) =>
                                  handleRoomFieldChange(
                                    idx,
                                    "roomId",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">— Select Room —</option>
                                {roomList.map((r) => (
                                  <option key={r.value} value={r.value}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Booking Date */}
                            <td className="p-2">
                              <DatePicker
                                format="DD/MM/YYYY"
                                value={
                                  row.bookingdate
                                    ? dayjs(row.bookingdate, "DD/MM/YYYY")
                                    : null
                                }
                                onChange={(date) =>
                                  handleRoomFieldChange(
                                    idx,
                                    "bookingdate",
                                    date ? date.format("DD/MM/YYYY") : "",
                                  )
                                }
                                className="w-full"
                                placeholder="Check-in Date"
                              />
                            </td>

                            {/* Check-out Date */}
                            <td className="p-2">
                              <DatePicker
                                format="DD/MM/YYYY"
                                value={
                                  row.bookingcheckoutdate
                                    ? dayjs(
                                        row.bookingcheckoutdate,
                                        "DD/MM/YYYY",
                                      )
                                    : null
                                }
                                onChange={(date) =>
                                  handleRoomFieldChange(
                                    idx,
                                    "bookingcheckoutdate",
                                    date ? date.format("DD/MM/YYYY") : "",
                                  )
                                }
                                className="w-full"
                                placeholder="Check-out Date"
                                disabledDate={(current) => {
                                  // Check-out must be after check-in
                                  if (!row.bookingdate) return false;
                                  return (
                                    current &&
                                    current.isBefore(
                                      dayjs(row.bookingdate, "DD/MM/YYYY"),
                                      "day",
                                    )
                                  );
                                }}
                              />
                            </td>

                            {/* Qty */}
                            <td className="p-2">
                              <input
                                type="tel"
                                min={1}
                                className="input w-full text-center"
                                value={row.qty}
                                onChange={(e) =>
                                  handleRoomFieldChange(
                                    idx,
                                    "qty",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            {/* Price */}
                            <td className="p-2">
                              <input
                                type="tel"
                                min={0}
                                className="input w-full text-right"
                                value={row.price}
                                onChange={(e) =>
                                  handleRoomFieldChange(
                                    idx,
                                    "price",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            {/* Total (read-only) */}
                            <td className="p-2">
                              <input
                                type="tel"
                                readOnly
                                className="input w-full text-right bg-gray-50 cursor-not-allowed"
                                value={row.total || 0}
                              />
                            </td>

                            {/* Remove */}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRoom(idx)}
                                className="btn btn-sm btn-icon btn-clear btn-danger"
                                title="Remove"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      {/* Grand total footer */}
                      {roomRows.length > 0 && (
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                          <tr>
                            <td
                              colSpan={5}
                              className="p-3 text-right text-sm font-semibold text-gray-700"
                            >
                              Grand Total
                            </td>
                            <td className="p-3 text-right text-sm font-bold text-gray-900">
                              {roomRows.reduce(
                                (sum, r) => sum + (Number(r.total) || 0),
                                0,
                              )}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Groom Information ─────────────────────────────────────────────── */}
        <div className="card min-w-full">
          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <Crown className="text-primary" />
              <p className="text-base font-medium text-gray-900">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_INFORMATION"
                  defaultMessage="Groom Information"
                />
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-3 p-4 grid grid-cols-1 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_NAME"
                    defaultMessage="Groom Name"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-autobrightness"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="groomName"
                    placeholder="Groom name"
                    value={formData.groomName || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_INSTAGRAM_LINK"
                    defaultMessage="Instagram Link"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-instagram"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="groomInstaLink"
                    placeholder="Instagram Link"
                    value={formData.groomInstaLink || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_BIRTH_DATE"
                    defaultMessage="Birth Date"
                  />
                </label>
                <DatePicker
                  className="input"
                  placeholder="Groom Birth Date"
                  format={dateFormat}
                  value={
                    formData.groomBirthDate
                      ? dayjs(formData.groomBirthDate, dateFormat)
                      : null
                  }
                  onChange={handleGroomBirthDateChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_COMMUNITY"
                    defaultMessage="Community"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-autobrightness"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="groom_community"
                    placeholder="Groom Community"
                    value={formData.groom_community || ""}
                    onChange={handleCommunityChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_GROOM_PHONE_NUMBER"
                    defaultMessage="Phone Number"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-phone"></i>
                  <input
                    className="h-full"
                    type="tel"
                    name="groomMobileno"
                    maxLength={10}
                    minLength={10}
                    placeholder="Groom number"
                    value={formData.groomMobileno || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bride Information ─────────────────────────────────────────────── */}
        <div className="card min-w-full">
          <div className="flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-2 p-4">
              <Sparkles className="text-primary" />
              <p className="text-base font-medium text-gray-900">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_INFORMATION"
                  defaultMessage="Bride Information"
                />
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-3 p-4 grid grid-cols-1 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_NAME"
                    defaultMessage="Bride Name"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-autobrightness"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="brideName"
                    placeholder="Bride name"
                    value={formData.brideName || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_INSTAGRAM_LINK"
                    defaultMessage="Instagram Link"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-instagram"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="brideInstaLink"
                    placeholder="Instagram Link"
                    value={formData.brideInstaLink || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_BIRTH_DATE"
                    defaultMessage="Birth Date"
                  />
                </label>
                <DatePicker
                  className="input"
                  placeholder="Bride Birth Date"
                  format={dateFormat}
                  value={
                    formData.brideBirthDate
                      ? dayjs(formData.brideBirthDate, dateFormat)
                      : null
                  }
                  onChange={handleBrideBirthDateChange}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_COMMUNITY"
                    defaultMessage="Community"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-autobrightness"></i>
                  <input
                    className="h-full"
                    type="text"
                    name="bride_community"
                    placeholder="Bride Community"
                    value={formData.bride_community || ""}
                    onChange={handleCommunityChange}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="form-label">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_BRAID_PHONE_NUMBER"
                    defaultMessage="Phone Number"
                  />
                </label>
                <div className="input">
                  <i className="ki-filled ki-phone"></i>
                  <input
                    className="h-full"
                    type="tel"
                    maxLength={10}
                    minLength={10}
                    name="brideMobileno"
                    placeholder="Bride number"
                    value={formData.brideMobileno || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddMeal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          refreshData={handleMealTypeAdded}
        />
        <AddMember
          isModalOpen={isMemberModalOpen}
          setIsModalOpen={setIsMemberModalOpen}
          refreshData={handleManagerAdded}
        />
        <AddRoomModal
          isOpen={isAddRoomModalOpen}
          onClose={() => setIsAddRoomModalOpen(false)}
          roomData={null}
          refreshData={() => {
            fetchRooms();
            setIsAddRoomModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default OtherInfoStep;
