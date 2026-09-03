import { Fragment, useState, useEffect } from "react";
import { Select } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import {
  GetEventMasterById,
  GetAllMemberByUserId,
  AddEventfunctionmanagerassign,
  getallassignfunctionbyevent,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePermission } from "../../../hooks/usePermission";
dayjs.extend(customParseFormat);

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_MAP = {
  0: { label: "Inquiry", color: "bg-blue-50 text-blue-500 border-blue-200" },
  1: {
    label: "Confirmed",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  2: { label: "Cancelled", color: "bg-red-50 text-red-500 border-red-200" },
};

const ICON_BG = [
  "bg-blue-50 text-blue-600",
  "bg-pink-50 text-pink-600",
  "bg-green-50 text-green-600",
  "bg-yellow-50 text-yellow-600",
  "bg-purple-50 text-purple-600",
];

const ICON_LIST = [
  "ki-calendar-8",
  "ki-star",
  "ki-abstract-26",
  "ki-element-11",
  "ki-briefcase",
];
// ─── Function Card ────────────────────────────────────────────────────────────
const FunctionCard = ({
  fn,
  index,
  managers,
  onManagerChange,
  onMemberChange,
}) => {
  const colorIndex = index % 5;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${ICON_BG[colorIndex]} flex items-center justify-center flex-shrink-0`}
          >
            <i className={`ki-filled ${ICON_LIST[colorIndex]} text-lg`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
              {fn.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {fn.subtitle}
            </p>
          </div>
        </div>

        {/* Date Badge */}
        {fn.startDate && (
          <div className="flex-shrink-0 text-right">
            <p className="text-xl font-bold text-gray-900 leading-none">
              {fn.startDate.format("DD")}
            </p>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">
              {fn.startDate.format("MMM")}
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        {fn.venue && (
          <div className="flex items-center gap-2">
            <i className="ki-filled ki-geolocation-home text-primary text-xs w-3.5" />
            <span className="text-xs text-gray-600">Venue: {fn.venue}</span>
          </div>
        )}
        {fn.timing && (
          <div className="flex items-center gap-2">
            <i className="ki-filled ki-time text-primary text-xs w-3.5" />
            <span className="text-xs text-gray-600">Timing: {fn.timing}</span>
          </div>
        )}
        {fn.pax != null && (
          <div className="flex items-center gap-2">
            <i className="ki-filled ki-people text-primary text-xs w-3.5" />
            <span className="text-xs text-gray-600">
              Capacity: {fn.pax} guests
            </span>
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* ── Assigned Managers (multi) ── */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">
          Assigned Manager
        </p>
        <Select
          className="w-full"
          mode="multiple"
          value={fn.managerIds || []}
          placeholder="Select managers"
          options={managers}
          maxTagCount="responsive"
          allowClear
          onChange={(val) => onManagerChange(fn.id, val)}
        />
      </div>

      {/* ── Assigned Members (multi) ── */}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EventAssignManager = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [eventMeta, setEventMeta] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [managers, setManagers] = useState([]);

  // Global "apply to all" — both multi-select
  const [globalManagers, setGlobalManagers] = useState([]);
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const AssignManagerPermission = usePermission("Assign Manager")

  const functionOptions = functions.map((fn) => ({
    value: fn.id,
    label: fn.name,
  }));
  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;
    fetchAll();
  }, [eventId]);

  // 2. Update fetchAll — add the third API call in Promise.all
  const fetchAll = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      const [eventRes, mgrRes, assignRes] = await Promise.all([
        GetEventMasterById(eventId),
        GetAllMemberByUserId(userId),
        getallassignfunctionbyevent(eventId), // ← ADD
      ]);

      // ── Event Data (unchanged) ─────────────────────
      const eventList = eventRes?.data?.data?.["Event Details"];
      if (!eventList || eventList.length === 0) {
        Swal.fire("Error", "Event not found", "error");
        return;
      }
      const ev = eventList[0];

      setEventMeta({
        partyName: ev.party?.nameEnglish || "",
        eventType: ev.eventType?.nameEnglish || "",
        mobile: ev.mobileno || "",
        eventNo: ev.eventNo || `#${ev.id}`,
        status: ev.status ?? 0,
        date: dayjs(ev.eventStartDateTime, "DD/MM/YYYY hh:mm A").isValid()
          ? dayjs(ev.eventStartDateTime, "DD/MM/YYYY hh:mm A")
          : null,
        venue: ev.venue?.nameEnglish || ev.address || "",
      });

      // ── Build a map of already-assigned managers per function ──
      const assignedData = assignRes?.data?.data || [];
      const assignedMap = {}; // { eventFunctionId: [managerId, ...] }
      assignedData.forEach((event) => {
        (event.eventFunctions || []).forEach((fn) => {
          assignedMap[fn.eventFunctionId] = (fn.managers || []).map(
            (m) => m.managerId,
          );
        });
      });

      // ── Map event functions, injecting pre-assigned managerIds ──
      const fns = (ev.eventFunctions || []).map((ef) => {
        const startDayjs = ef.functionStartDateTime
          ? dayjs(ef.functionStartDateTime, "DD/MM/YYYY hh:mm A")
          : null;
        const endDayjs = ef.functionEndDateTime
          ? dayjs(ef.functionEndDateTime, "DD/MM/YYYY hh:mm A")
          : null;
        const timingStr =
          startDayjs?.isValid() && endDayjs?.isValid()
            ? `${startDayjs.format("HH:mm")} - ${endDayjs.format("HH:mm")}`
            : startDayjs?.isValid()
              ? startDayjs.format("HH:mm")
              : "";

        return {
          id: ef.id,
          eventFunctionId: ef.id,
          name: ef.function?.nameEnglish || "",
          subtitle: ev.eventType?.nameEnglish || "Event Function",
          venue: ef.function_venue || ev.venue?.nameEnglish || "",
          timing: timingStr,
          startDate: startDayjs?.isValid() ? startDayjs : null,
          pax: ef.pax ?? 0,
          managerIds: assignedMap[ef.id] || [], // ← pre-populated from API
          memberIds: [],
        };
      });

      setFunctions(fns);

      // ── Manager Data (unchanged) ─────────────────────
      const userList =
        mgrRes?.data?.data?.userDetails?.UserDetails ||
        mgrRes?.data?.data?.UserDetails ||
        mgrRes?.data?.UserDetails ||
        [];

      setManagers(
        userList.map((u, i) => ({
          value: u.id,
          label:
            `${i + 1}. ${(u.firstName || "").trim()} ${(u.lastName || "").trim()}`.trim() ||
            u.email ||
            `User #${u.id}`,
        })),
      );
    } catch (err) {
      console.error("fetchAll error:", err);
      Swal.fire("Error", "Failed to load event data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Apply to all ───────────────────────────────────────────────────────────
  const handleApplyAll = () => {
    setFunctions((prev) =>
      prev.map((fn) => {
        // Apply only selected functions
        if (
          selectedFunctions.length > 0 &&
          !selectedFunctions.includes(fn.id)
        ) {
          return fn;
        }

        return {
          ...fn,
          ...(globalManagers.length > 0 ? { managerIds: globalManagers } : {}),
        };
      }),
    );
  };
  // ── Per-card changes ───────────────────────────────────────────────────────
  const handleManagerChange = (id, values) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, managerIds: values } : fn)),
    );
  };

  const handleMemberChange = (id, values) => {
    setFunctions((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, memberIds: values } : fn)),
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userId = localStorage.getItem("userId");

      // Build payload per the API contract:
      // { eventFunctionManagers: [{ eventFunctionId, managerId: number[] }], eventId, userId }
      // Here managerId array = managerIds + memberIds combined (all assigned users)
      const payload = {
        eventId: parseInt(eventId),
        userId: parseInt(userId),
        eventFunctionManagers: functions.map((fn) => ({
          eventFunctionId: fn.eventFunctionId,
          managerId: [
            ...new Set([...(fn.managerIds || []), ...(fn.memberIds || [])]),
          ],
        })),
      };

      await AddEventfunctionmanagerassign(payload);

      Swal.fire({
        title: "Success",
        text: "Managers assigned successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("Error", "Failed to save. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading event details...</p>
        </div>
      </div>
    );
  }

  const { label: statusLabel, color: statusColor } =
    STATUS_MAP[eventMeta?.status ?? 0] || STATUS_MAP[0];

  const canApply = globalManagers.length > 0 && selectedFunctions.length > 0;
  return (
    <Fragment>
      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <img
            src={toAbsoluteUrl("/media/icons/loading.gif")}
            alt="Saving..."
            className="w-18 rounded-xl shadow-2xl"
          />
        </div>
      )}

      <div className="min-h-screen ">
        <div className="p-6 mx-auto pb-28">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumbs
              items={[
                
                { title: "Assign Manager" },
              ]}
            />
          </div>

          {/* ── Event Header ── */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                {eventMeta?.partyName
                  ? `${eventMeta.partyName} – ${eventMeta.eventType}`
                  : `Event #${eventId}`}
              </h1>
              <span
                className={`border rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              {eventMeta?.mobile && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-phone text-primary text-xs" />
                  {eventMeta.mobile}
                </span>
              )}
              {eventMeta?.date && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-calendar text-primary text-xs" />
                  {eventMeta.date.format("DD MMM YYYY")}
                </span>
              )}
              {eventMeta?.venue && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-geolocation text-primary text-xs" />
                  {eventMeta.venue}
                </span>
              )}
              {eventMeta?.eventNo && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-tag text-primary text-xs" />
                  {eventMeta.eventNo}
                </span>
              )}
            </div>
          </div>

          {/* ── Assign to All ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Assign to All Functions
            </p>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              {/* Global Managers multi */}
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-gray-800 tracking-widest uppercase mb-2">
                  Manager
                </p>
                <Select
                  className="w-full"
                  mode="multiple"
                  value={globalManagers}
                  placeholder="Select managers"
                  options={managers}
                  maxTagCount="responsive"
                  allowClear
                  onChange={setGlobalManagers}
                />
              </div>

              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-gray-800 tracking-widest uppercase mb-2">
                  Functions
                </p>

                <Select
                  className="w-full"
                  mode="multiple"
                  value={selectedFunctions}
                  placeholder="Select functions"
                  options={functionOptions}
                  maxTagCount="responsive"
                  allowClear
                  onChange={setSelectedFunctions}
                />
              </div>
              {AssignManagerPermission.add && (
              <button
                onClick={handleApplyAll}
                disabled={!canApply}
                className="btn btn-primary h-9 px-4 text-sm font-semibold flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
              >
                <i className="ki-filled ki-check text-sm" />
                Apply to All
              </button>
              )}
            </div>
          </div>

          {/* ── Event Functions ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Event Functions
              </h2>
              <span className="bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase">
                {functions.length} Functions
              </span>
            </div>

            {functions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                No functions found for this event.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {functions.map((fn, idx) => (
                  <FunctionCard
                    key={fn.id}
                    fn={fn}
                    index={idx}
                    managers={managers}
                    onManagerChange={handleManagerChange}
                    onMemberChange={handleMemberChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3.5 flex items-center justify-between z-40">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-1 py-1.5"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2.5">
             {(AssignManagerPermission.add || AssignManagerPermission.edit) && (
            <button
              onClick={handleSave}
              className="btn btn-primary text-sm font-semibold px-5 h-9"
            >
              Save Changes
            </button>
           )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default EventAssignManager;
