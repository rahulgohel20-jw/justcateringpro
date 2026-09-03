import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/container";
import { FormattedMessage } from "react-intl";
import FollowUpModal from "../../../../partials/modals/add-followup-lead/FollowUpModal";
import { Select, Input } from "antd";
import { Fragment } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { EyeIcon, ReceiptEuro } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import AddSource from "../../../../partials/modals/add-source/AddSource";
import AddSubSource from "../../../../partials/modals/add-source/AddSubSource";
const { Option } = Select;

import {
  GETallpipeline,
  AddLead,
  fetchStatesByCountry,
  fetchCitiesByState,
  GetLeadCode,
  Fetchmanager,
  GetAllPlans,
  UpdateleadbyID,
  GetFilteredFollowUps,
  Getstagesbypipeline,
  GetAllLeadSource,
  GetLeadSubSourceBysubSourceId,
  GetAllEventFunction,
  SearchEventType,
  Deletebyfollowupid,
} from "@/services/apiServices";
import Swal from "sweetalert2";

export default function AddLeadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.leadData;
  const isEditMode = !!editData;
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [viewingFollowUp, setViewingFollowUp] = useState(null);
  const [selectedCreatedAt, setSelectedCreatedAt] = useState("");
  const [selectedGetLead, setSelectedGetLead] = useState("");
  const [followupDate, setFollowupDate] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [estimateAmount, setEstimateAmount] = useState("");
  const [openStageId, setOpenStageId] = useState(undefined);
  const [closeStageId, setCloseStageId] = useState(undefined);
  const [openStages, setOpenStages] = useState([]);
  const [closeStages, setCloseStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [customRangeCreatedAt, setCustomRangeCreatedAt] = useState({
    start: "",
    end: "",
  });
  const [customRangeGetLead, setCustomRangeGetLead] = useState({
    start: "",
    end: "",
  });
  const [totalLeads, setTotalLeads] = useState(0);
  const [eventTypes, setEventTypes] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [referralSources, setReferralSources] = useState([]);
  const [tentativeDates, setTentativeDates] = useState([]);
  const [anyFunctionWithUs, setAnyFunctionWithUs] = useState(false);
  const [leadData, setLeadData] = useState({
    id: 0,
    leadCode: "",
    leadType: "",
    leadStatus: "",
    leadSource: "",
    leadAssign: "",
    leadAssignName: "",
    selectPrefix: "",
    clientName: "",
    emailId: "",
    contactNumber: "",
    clientRemarks: "",
    address: "",
    pinCode: "",
    city: "",
    cityName: "",
    state: "",
    stateName: "",
    overallRemark: "",
    plan: "",
    planName: "",
    leadTitle: "",
    leadRemark: "",
    estimateAmount: "",
    leadSourceId: 0,
    leadSubSourceId: 0,
    followUpDetails: [],
    eventTypeId: 0,
    functionId: 0,
    inquiryDate: null,
    minPax: "",
    maxPax: "",
    referralSource: "",
    anyFunctionWithUs: false,
    companyName: "",
    closeDate: "",
  });
  const [leadSources, setLeadSources] = useState([]);
  const [leadSubSources, setLeadSubSources] = useState([]);

  const [inquiryDate, setInquiryDate] = useState(dayjs());
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [isAddSubSourceOpen, setIsAddSubSourceOpen] = useState(false);

  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const roleId = authStorage?.state?.user?.userBasicDetails?.role?.id || null;

  const mainId = localStorage.getItem("mainId"); // own login ID
  const userId = localStorage.getItem("userId"); // parent/creator ID

  // SuperAdmin = roleId 1, mainId === "1"
  const isSuperAdmin = roleId === 1 && mainId === "1";

  // SuperAdmin's Member = created by superadmin (userId === "1") but not superadmin themselves
  const isSuperAdminMember = userId === "1" && mainId !== "1" && roleId !== 2;

  // Admin = roleId 2 AND userId === "1"
  const isAdmin = roleId === 2 && userId === "1";

  // Admin's Sub-roles = created by admin (userId !== "1")
  const isUnderAdmin = userId !== "1";

  // ✅ SuperAdmin fields visible to SuperAdmin AND SuperAdmin's Members
  const showSuperAdminFields = isSuperAdmin || isSuperAdminMember;

  // ✅ Event fields visible ONLY to Admin and Admin's sub-roles
  const showEventFields = isAdmin || isUnderAdmin;
  const getDisplayNames = () => {
    const stateName =
      leadData.stateName ||
      states.find((s) => s.id === leadData.state)?.name ||
      "";
    const cityName =
      leadData.cityName ||
      cities.find((c) => c.id === leadData.city)?.name ||
      "";
    const managerName =
      leadData.leadAssignName ||
      managers.find((m) => m.value === leadData.leadAssign)?.label ||
      "";
    const planName =
      leadData.planName ||
      plans.find((p) => p.value === leadData.plan)?.label ||
      "";

    return { stateName, cityName, managerName, planName };
  };

  const fetchCreatedAtData = async (value) => {
    try {
      let start = null;
      let end = null;

      if (value === "1") {
        start = dayjs().format("DD/MM/YYYY");
      } else if (value === "2") {
        start = dayjs().format("DD/MM/YYYY");
        end = dayjs().add(1, "month").format("DD/MM/YYYY");
      } else if (value === "4") {
        start = dayjs().subtract(1, "month").format("DD/MM/YYYY");
        end = dayjs().format("DD/MM/YYYY");
      } else if (value === "3") {
        start = dayjs(customRangeCreatedAt.start).format("DD/MM/YYYY");
        end = dayjs(customRangeCreatedAt.end).format("DD/MM/YYYY");
      }

      const payload = {
        startDate: start,
        endDate: end,
        isCreated: false,
        leadId: leadData.id || null,
      };

      const res = await GetFilteredFollowUps(payload);

      setFollowUps(res?.data?.data || []);
      setTotalLeads(res?.data?.data?.length || 0);
    } catch (err) {
      console.error(err);
      setFollowUps([]);
      setTotalLeads(0);
    }
  };

  const fetchGetLeadData = async (value) => {
    try {
      let start = null;
      let end = null;

      if (value === "1") {
        start = dayjs().format("DD/MM/YYYY");
        end = dayjs().format("DD/MM/YYYY");
      } else if (value === "2") {
        start = dayjs().format("DD/MM/YYYY");
        end = dayjs().add(1, "month").format("DD/MM/YYYY");
      } else if (value === "4") {
        start = dayjs().subtract(1, "month").format("DD/MM/YYYY");
        end = dayjs().format("DD/MM/YYYY");
      } else if (value === "3") {
        start = dayjs(customRangeGetLead.start).format("DD/MM/YYYY");
        end = dayjs(customRangeGetLead.end).format("DD/MM/YYYY");
      }

      const payload = {
        startDate: start,
        endDate: end,
        isCreated: true,
        leadId: leadData.id || null,
      };

      const res = await GetFilteredFollowUps(payload);

      setFollowUps(res?.data?.data || []);
      setTotalLeads(res?.data?.data?.length || 0);
    } catch (err) {
      console.error("Get Lead error:", err);
      setFollowUps([]);
      setTotalLeads(0);
    }
  };

  useEffect(() => {
    if (isEditMode && editData && managers.length > 0) {
      setLeadData((prev) => ({
        ...prev,
        leadAssign: editData.leadAssignId || editData.leadAssign || undefined,
      }));
    }
  }, [managers, isEditMode, editData]);

  useEffect(() => {
    if (isEditMode && editData && plans.length > 0) {
      setLeadData((prev) => ({
        ...prev,
        plan: editData.planId || editData.productType || undefined,
      }));
    }
  }, [plans, isEditMode, editData]);

  useEffect(() => {
    if (isEditMode && editData) {
      const stateIdToUse = editData.stateId || editData.state;
      if (stateIdToUse) {
        handleStateChange(stateIdToUse);
      }
      // ✅ Pre-load sub-sources dropdown when editing
      if (editData.leadSource?.leadSourceId) {
        GetLeadSubSourceBysubSourceId(editData.leadSource.leadSourceId)
          .then((res) => {
            const subSources = res?.data?.data?.subSources || [];
            setLeadSubSources(
              subSources.map((s) => ({
                label: s.name,
                value: s.leadSubSourceId,
              })),
            );
            // Set the selected sub-source AFTER options are loaded
            setLeadData((prev) => ({
              ...prev,
              leadSubSourceId: editData.leadSubSource?.leadSubSourceId || 0,
            }));
          })
          .catch((err) => console.error("Failed to load sub-sources:", err));
      }
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    if (isEditMode && editData && cities.length > 0) {
      setLeadData((prev) => ({
        ...prev,
        city: editData.cityId || editData.city || undefined,
      }));
    }
  }, [cities, isEditMode, editData]);

  useEffect(() => {
    if (isEditMode && editData) {
      setLeadData({
        leadSourceId: editData.leadSource?.leadSourceId || 0,
        leadSubSourceId: editData.leadSubSource?.leadSubSourceId || 0,
        id: editData.id || 0,
        leadCode: editData.leadCode || "",
        leadType: "",
        leadStatus: editData.leadStatus || "",
        leadSource: editData.leadSource?.sourceName || "",
        leadRemark: editData.leadRemark || "",
        leadAssign: editData.leadAssignId || editData.leadAssign || 0,
        leadAssignName: editData.leadAssignName || "",
        selectPrefix: editData.selectPrefix || "",
        clientName: editData.clientName || "",
        emailId: editData.emailId || "",
        contactNumber: editData.contactNumber || "",
        address: editData.address || "",
        pinCode: editData.pinCode || "",
        city: editData.cityId || editData.city || 0,
        cityName: editData.cityName || "",
        state: editData.stateId || editData.state || 0,
        stateName: editData.stateName || "",
        plan: editData.planId || editData.productType || 0,
        planName: editData.planName || "",
        overallRemark: editData.overallRemark || "",
        followUpDetails: editData.followUpDetails || [],
        leadTitle: editData.leadTitle || "",
        eventTypeId: editData.eventTypeId || 0,
        functionId: editData.functionId || 0,
        minPax: editData.minPax || "",
        maxPax: editData.maxPax || "",
        referralSource: editData.referralSource || "",
        companyName: editData.companyName || "",
        anyFunctionWithUs: editData.anyFunctionWithUs || false,
      });

      // ✅ Pre-populate inquiry date
      if (editData.inquiryDate) {
        const parsed = dayjs(editData.inquiryDate, [
          "YYYY-MM-DD HH:mm:ss",
          "DD/MM/YYYY",
          "YYYY-MM-DD",
        ]);
        if (parsed.isValid()) {
          setInquiryDate(parsed);
        }
      }
      const tentDates = editData.tentEventDate || editData.tentativeDates || [];
      if (tentDates.length > 0) {
        const parsed = tentDates
          .map((d) =>
            dayjs(d, ["DD/MM/YYYY hh:mm A", "YYYY-MM-DD", "DD/MM/YYYY"]),
          )
          .filter((d) => d.isValid());
        setTentativeDates(parsed);
      }
      if (editData.followUpDetails && editData.followUpDetails.length > 0) {
        const normalized = editData.followUpDetails.map((fu) => ({
          id: fu.id || 0,
          followUpType: fu.followUpType || fu.followType || "",
          followUpStatus: fu.followUpStatus || "Open",
          followUpDate: fu.followUpDate || "",
          clientRemarks: fu.clientRemarks || "",
          employeeRemarks: fu.employeeRemarks || "",
          memberId: fu.memberId ? Number(fu.memberId) : null,
          createdAt: fu.createdAt || null,
        }));
        setFollowUps(normalized);
      }

      if (editData.pipelineId) {
        setSelectedPipeline(editData.pipelineId);

        const userId =
          localStorage.getItem("userId") || localStorage.getItem("id");

        Getstagesbypipeline(editData.pipelineId, userId)
          .then((res) => {
            const data = res?.data?.data || {};
            const allStages = Object.values(data).flat();
            const stageOptions = allStages.map((stage) => ({
              label: stage.stageName,
              value: stage.stageId,
              stageType: stage.stageType,
            }));
            setOpenStages(stageOptions);

            const stageId = editData.openStageId || editData.closeStageId;
            if (stageId) {
              setSelectedStageId(stageId);
              if (editData.openStageId) {
                setOpenStageId(editData.openStageId);
                setCloseStageId(0);
              } else {
                setCloseStageId(editData.closeStageId);
                setOpenStageId(0);
              }
            }
          })
          .catch(console.error);
      }

      if (
        editData.estimateAmount !== undefined &&
        editData.estimateAmount !== null &&
        editData.estimateAmount !== ""
      ) {
        setEstimateAmount(String(editData.estimateAmount));
      }
      if (editData.leadFollowUpDate) {
        const parsed = dayjs(editData.leadFollowUpDate, [
          "YYYY-MM-DD HH:mm:ss",
          "DD/MM/YYYY",
          "YYYY-MM-DD",
        ]);
        if (parsed.isValid()) {
          setFollowupDate(parsed);
        }
      }
    } else {
      const loadLeadCode = async () => {
        try {
          const res = await GetLeadCode(userId);
          if (res?.data?.data) {
            const leadCode = String(res.data.data).trim();
            setLeadData((prev) => ({ ...prev, leadCode }));
          }
        } catch (error) {
          console.error("Failed to fetch Lead Code:", error);
        }
      };
      loadLeadCode();
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    fetchPlans();
    FetchManager();
    fetchEventTypes();
    fetchFunctions();
    fetchReferralSources();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await GetAllPlans();
      const planArray = res?.data?.data?.["Plan Details"] || [];
      const planList = planArray.map((plan) => ({
        label: plan.name,
        value: plan.id,
      }));
      setPlans(planList);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  // ✅ Fetch Event Types — replace with your actual API when available
  const fetchEventTypes = async () => {
    try {
      // const res = await GetAllEventTypes(userId);
      // const data = res?.data?.data || [];
      // setEventTypes(data.map((e) => ({ label: e.name, value: e.id })));

      // ✅ Placeholder static data — replace with API call above
      setEventTypes([
        { label: "Wedding", value: 1 },
        { label: "Corporate", value: 2 },
        { label: "Birthday", value: 3 },
        { label: "Conference", value: 4 },
        { label: "Exhibition", value: 5 },
        { label: "Social Gathering", value: 6 },
      ]);
    } catch (err) {
      console.error("Failed to fetch event types:", err);
      setEventTypes([]);
    }
  };

  // ✅ Fetch Functions — replace with your actual API when available
  const fetchFunctions = async () => {
    try {
      // const res = await GetAllFunctions(userId);
      // const data = res?.data?.data || [];
      // setFunctions(data.map((f) => ({ label: f.name, value: f.id })));

      // ✅ Placeholder static data — replace with API call above
      setFunctions([
        { label: "Lunch", value: 1 },
        { label: "Dinner", value: 2 },
        { label: "Cocktail Reception", value: 3 },
        { label: "Full Day", value: 4 },
        { label: "Half Day", value: 5 },
        { label: "Overnight", value: 6 },
      ]);
    } catch (err) {
      console.error("Failed to fetch functions:", err);
      setFunctions([]);
    }
  };

  // ✅ Fetch Referral Sources — replace with your actual API when available
  const fetchReferralSources = async () => {
    try {
      // const res = await GetAllReferralSources(userId);
      // const data = res?.data?.data || [];
      // setReferralSources(data.map((r) => ({ label: r.name, value: r.id })));

      // ✅ Placeholder static data — replace with API call above
      setReferralSources([
        { label: "Walk-in", value: "Walk-in" },
        { label: "Phone Inquiry", value: "Phone Inquiry" },
        { label: "Website", value: "Website" },
        { label: "Social Media", value: "Social Media" },
        { label: "Friend / Family", value: "Friend / Family" },
        { label: "Agent", value: "Agent" },
        { label: "Repeat Client", value: "Repeat Client" },
      ]);
    } catch (err) {
      console.error("Failed to fetch referral sources:", err);
      setReferralSources([]);
    }
  };

  useEffect(() => {
    const loadStates = async () => {
      try {
        const stateRes = await fetchStatesByCountry(1);
        const stateArray = stateRes?.data?.data?.["state Details"];
        if (Array.isArray(stateArray)) {
          setStates(stateArray);
        } else {
          setStates([]);
        }
      } catch (err) {
        console.error("Failed to load states:", err);
        setStates([]);
      }
    };
    loadStates();
  }, []);

  const handleStateChange = async (stateId) => {
    const numericStateId = Number(stateId);
    setLeadData((prev) => ({ ...prev, state: numericStateId }));

    try {
      const cityRes = await fetchCitiesByState(numericStateId);
      const cityArray = cityRes?.data?.data?.["City Details"] || [];

      if (Array.isArray(cityArray)) {
        setCities(cityArray);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error("Failed to load cities:", err);
      setCities([]);
    }
  };
  const handleDelete = async (followUpId, index) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // If it's a saved follow-up (has a real id), call the API
        if (followUpId && followUpId !== 0) {
          await Deletebyfollowupid(followUpId);
        }
        // Remove from local state regardless
        setFollowUps((prev) => prev.filter((_, i) => i !== index));
        await Swal.fire({
          title: "Deleted!",
          text: "Follow-up has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong.",
          icon: "error",
        });
      }
    }
  };

  const handleSaveFollowUp = (followUp) => {
    const normalized = {
      id: followUp.id || 0,
      followUpType: followUp.followUpType || followUp.followType || "",
      followUpStatus: followUp.followUpStatus || "Open",
      followUpDate: followUp.followUpDate || followUp.followupDate || "",
      clientRemarks: followUp.clientRemarks || followUp.description || "",
      employeeRemarks: followUp.employeeRemarks || "",
      memberId: followUp.memberId || followUp.managerId || null,
      createdAt: followUp.createdAt || dayjs().format("DD/MM/YYYY hh:mm A"),
    };

    setFollowUps((prev) => [...prev, normalized]);
  };

  const handleSaveLead = async () => {
    if (!leadData.clientName) {
      Swal.fire("Validation", "Please select a client name.", "warning");
      return;
    }
    if (!leadData.contactNumber) {
      Swal.fire("Validation", "Please enter a Contact Number.", "warning");
      return;
    }
    if (!selectedPipeline) {
      Swal.fire("Validation", "Please select a Pipeline.", "warning");
      return;
    }
    if (!selectedStageId) {
      Swal.fire("Validation", "Please select a Lead Stage.", "warning");
      return;
    }
    if (!leadData.leadAssign) {
      Swal.fire("Validation", "Please assign a Lead.", "warning");
      return;
    }
    if (showEventFields && !leadData.eventTypeId) {
      Swal.fire("Validation", "Please select an Event Type.", "warning");
      return;
    }

    if (showEventFields && !leadData.functionId) {
      Swal.fire("Validation", "Please select a Function.", "warning");
      return;
    }
    if (!leadData.leadSourceId) {
      Swal.fire("Validation", "Please select a Lead Source.", "warning");
      return;
    }

    if (!leadData.leadSubSourceId) {
      Swal.fire("Validation", "Please select a Lead Sub Source.", "warning");
      return;
    }
    setIsSaving(true);
    try {
      const finalLeadId = isEditMode ? Number(leadData.id) : 0;

      const payload = {
        userId: userId ? Number(userId) : null,
        address: leadData.address || "",
        anyFunctionWithUs: anyFunctionWithUs,
        cityId: leadData.city ? Number(leadData.city) : null,
        clientName: leadData.clientName || "",
        closeDate: followupDate
          ? followupDate.format("DD/MM/YYYY hh:mm A")
          : "",
        leadFollowUpDate: followupDate
          ? followupDate.format("DD/MM/YYYY hh:mm A")
          : "",
        closeStageId: closeStageId ? Number(closeStageId) : null,
        companyName: leadData.companyName || "",
        contactNumber: leadData.contactNumber || "",
        emailId: leadData.emailId || "",
        estimateAmount: estimateAmount ? Number(estimateAmount) : 0,
        eventTypeId: leadData.eventTypeId ? Number(leadData.eventTypeId) : null,
        functionId: leadData.functionId ? Number(leadData.functionId) : null,
        inquiryDate: inquiryDate ? inquiryDate.format("DD/MM/YYYY") : "",
        leadAssignId: leadData.leadAssign ? Number(leadData.leadAssign) : null,
        leadCode: leadData.leadCode || "",
        leadRemark: leadData.leadRemark || "",
        leadSourceId: leadData.leadSourceId
          ? Number(leadData.leadSourceId)
          : null,
        leadStatus: leadData.leadStatus || "",
        leadSubSourceId: leadData.leadSubSourceId
          ? Number(leadData.leadSubSourceId)
          : null,
        leadTitle: leadData.leadTitle || "",
        leadType: "",
        maxPax: leadData.maxPax ? Number(leadData.maxPax) : null,
        minPax: leadData.minPax ? Number(leadData.minPax) : null,
        openStageId: openStageId ? Number(openStageId) : null,
        overallRemark: leadData.overallRemark || "",
        pinCode: leadData.pinCode || "",
        pipelineId: selectedPipeline ? Number(selectedPipeline) : null,
        planId: leadData.plan ? Number(leadData.plan) : null,
        referralSource: leadData.referralSource || "",
        selectPrefix: leadData.selectPrefix || "",
        stateId: leadData.state ? Number(leadData.state) : null,
        tentEventDate: tentativeDates.map((d) =>
          d.format("DD/MM/YYYY hh:mm A"),
        ),

        followUpDetails: followUps.map((fu) => ({
          id: fu.id ? Number(fu.id) : 0,
          leadId: finalLeadId,
          followUpType: fu.followUpType || "",
          followUpStatus: fu.followUpStatus || "Open",
          followUpDate: fu.followUpDate || "",
          clientRemarks: fu.clientRemarks || "",
          employeeRemarks: fu.employeeRemarks || "",
          memberId: fu.memberId || 0,
        })),
      };

      let response;
      if (isEditMode) {
        response = await UpdateleadbyID(finalLeadId, payload);
        const apiData = response?.data || response;
        const isSuccess = apiData?.success === true;

        if (isSuccess) {
          const successMsg = apiData?.msg || "Lead updated successfully!";
          Swal.fire("Success", successMsg, "success");
          navigate("/super-leads");
        } else {
          const errorMsg = apiData?.msg || "Failed to update lead!";
          Swal.fire("Error", errorMsg, "error");
        }
      } else {
        response = await AddLead(payload);
        const apiData = response?.data || response;
        const isSuccess = apiData?.success === true;

        if (isSuccess) {
          const successMsg = apiData?.msg || "Lead added successfully!";
          Swal.fire("Success", successMsg, "success");
          navigate("/super-leads");
        } else {
          const errorMsg = apiData?.msg || "Something went wrong!";
          Swal.fire("Error", errorMsg, "error");
        }
      }
    } catch (error) {
      console.error("❌ SERVER ERROR:", error);
      Swal.fire("Error", "Server error!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const FetchManager = () => {
    Fetchmanager(userId)
      .then((res) => {
        if (res?.data?.data?.userDetails) {
          const managerList = res.data.data.userDetails.map((man) => ({
            value: man.id,
            label: man.firstName || "-",
          }));
          setManagers(managerList);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch managers:", err);
        setManagers([]);
      });
  };

  const filteredFollowUps = followUps.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      leadData.clientName?.toLowerCase().includes(search) ||
      item.followUpType?.toLowerCase().includes(search) ||
      item.clientRemarks?.toLowerCase().includes(search) ||
      item.followUpDate?.toLowerCase().includes(search) ||
      item.followUpStatus?.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = () => {
    setLoading(true);
    GETallpipeline(userId)
      .then((res) => {
        const data = res?.data?.data || [];
        const mapped = data.map((p) => ({
          label: p.name || p.pipelineName || "Unnamed",
          value: p.id,
        }));
        setPipelines(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch pipelines:", err);
        setPipelines([]);
      })
      .finally(() => setLoading(false));
  };

  const handlePipelineChange = async (value) => {
    setSelectedPipeline(value);
    setSelectedStageId(undefined);
    setOpenStageId(undefined);
    setCloseStageId(undefined);
    setOpenStages([]);

    if (!value) return;

    const userId = localStorage.getItem("userId") || localStorage.getItem("id");

    try {
      const res = await Getstagesbypipeline(value, userId);
      const data = res?.data?.data || {};
      const allStages = Object.values(data).flat();
      const stageOptions = allStages.map((stage) => ({
        label: stage.stageName,
        value: stage.stageId,
        stageType: stage.stageType,
      }));
      setOpenStages(stageOptions);
    } catch (err) {
      console.error("Failed to fetch pipeline stages:", err);
      setOpenStages([]);
    }
  };

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const fetchLeadSources = async () => {
    try {
      const res = await GetAllLeadSource(userId);
      const data = res?.data?.data || [];
      setLeadSources(
        data.map((s) => ({ label: s.sourceName, value: s.leadSourceId })),
      );
    } catch (err) {
      console.error("Failed to fetch lead sources:", err);
    }
  };

  const handleLeadSourceChange = async (value) => {
    setLeadData((prev) => ({
      ...prev,
      leadSourceId: value,
      leadSubSourceId: 0,
    }));
    setLeadSubSources([]);
    if (!value) return;

    try {
      const res = await GetLeadSubSourceBysubSourceId(value);
      const subSources = res?.data?.data?.subSources || [];
      setLeadSubSources(
        subSources.map((s) => ({
          label: s.name,
          value: s.leadSubSourceId,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch sub sources:", err);
      setLeadSubSources([]);
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.CONTACT_TYPE_MASTER"
                    defaultMessage={isEditMode ? "Edit Lead" : "Add Lead"}
                  />
                ),
              },
            ]}
          />
        </div>
        <div className="min-h-screen bg-gray-50">
          <div className="p-6 space-y-6 max-w-7xl">
            <Card className="shadow-sm rounded-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Lead Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Code
                    </label>
                    <Input
                      placeholder="Lead Code"
                      value={leadData.leadCode}
                      readOnly
                    />
                  </div>

                  {/* Select Pipeline - Required */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Pipeline <span className="text-red-500">*</span>
                      </label>

                      <Link
                        to="/pipeline"
                        className="text-primary text-xs font-medium hover:underline flex items-center gap-1"
                      >
                        <i className="ki-filled ki-plus text-primary text-sm"></i>
                        Add Pipeline
                      </Link>
                    </div>

                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="-- Select Pipeline --"
                      className="w-full"
                      value={selectedPipeline}
                      onChange={handlePipelineChange}
                      options={pipelines}
                      status={!selectedPipeline ? "error" : ""}
                    />

                    {!selectedPipeline && (
                      <span className="text-red-500 text-xs mt-1 block">
                        Pipeline is required
                      </span>
                    )}
                  </div>

                  {/* Lead Stages - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Stages <span className="text-red-500">*</span>
                    </label>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder={
                        !selectedPipeline
                          ? "Select pipeline first"
                          : "-- Select Lead Stage --"
                      }
                      value={selectedStageId}
                      onChange={(value, option) => {
                        setSelectedStageId(value);
                        setLeadData((prev) => ({ ...prev, leadType: null }));
                        if (option.stageType === "open_stage") {
                          setOpenStageId(value);
                          setCloseStageId(0);
                        } else {
                          setCloseStageId(value);
                          setOpenStageId(0);
                        }
                      }}
                      className="w-full"
                      disabled={!selectedPipeline}
                      status={
                        selectedPipeline && !selectedStageId ? "error" : ""
                      }
                      options={openStages}
                    />
                    {selectedPipeline && !selectedStageId && (
                      <span className="text-red-500 text-xs mt-1 block">
                        Lead Stage is required
                      </span>
                    )}
                  </div>

                  {/* Lead Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Source <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="-- Select Lead Source --"
                        value={leadData.leadSourceId || undefined}
                        onChange={handleLeadSourceChange}
                        className="w-full"
                        options={leadSources}
                        allowClear
                        status={!leadData.leadSourceId ? "error" : ""}
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddSourceOpen(true)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-bold"
                        title="Add New Source"
                      >
                        +
                      </button>
                    </div>
                    {!leadData.leadSourceId && (
                      <span className="text-red-500 text-xs mt-1 block">
                        Lead Source is required
                      </span>
                    )}
                  </div>

                  {/* Lead Sub Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Sub Source <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder={
                          !leadData.leadSourceId
                            ? "Select source first"
                            : "-- Select Lead Sub Source --"
                        }
                        value={leadData.leadSubSourceId || undefined}
                        onChange={(value) =>
                          setLeadData((prev) => ({
                            ...prev,
                            leadSubSourceId: value,
                          }))
                        }
                        className="w-full"
                        options={leadSubSources}
                        disabled={!leadData.leadSourceId}
                        allowClear
                        status={
                          leadData.leadSourceId && !leadData.leadSubSourceId
                            ? "error"
                            : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddSubSourceOpen(true)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-bold"
                        title="Add New Sub Source"
                      >
                        +
                      </button>
                    </div>
                    {leadData.leadSourceId && !leadData.leadSubSourceId && (
                      <span className="text-red-500 text-xs mt-1 block">
                        Lead Sub Source is required
                      </span>
                    )}
                  </div>

                  {/* Lead Title */}
                  {showSuperAdminFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Title
                      </label>
                      <Input
                        placeholder="Enter lead title..."
                        value={leadData.leadTitle}
                        onChange={(e) =>
                          setLeadData({
                            ...leadData,
                            leadTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Lead Close Date */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Close Date
                    </label>
                    <DatePicker
                      showTime={{ format: "hh:mm A" }}
                      value={followupDate}
                      onChange={(date) => setFollowupDate(date)}
                      format="DD/MM/YYYY hh:mm A"
                      placeholder="Select close date & time"
                      className="w-full h-[30px]"
                    />
                  </div>

                  {/* Lead Assign */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Assign <span className="text-red-500">*</span>
                    </label>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="-- Assign Employee --"
                      value={leadData.leadAssign || undefined}
                      onChange={(value) =>
                        setLeadData({ ...leadData, leadAssign: value })
                      }
                      className="w-full"
                      options={managers}
                      status={!leadData.leadAssign ? "error" : ""}
                    />
                    {!leadData.leadAssign && (
                      <span className="text-red-500 text-xs mt-1 block">
                        Lead Assign is required
                      </span>
                    )}
                  </div>

                  {/* Product Type */}
                  {showSuperAdminFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type
                      </label>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="-- Select Product Type --"
                        className="w-full"
                        value={leadData.plan || undefined}
                        onChange={(value) =>
                          setLeadData({ ...leadData, plan: value })
                        }
                        options={plans}
                      />
                    </div>
                  )}

                  {/* Estimate Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimate Amount
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter estimate amount..."
                      value={estimateAmount}
                      onChange={(e) => setEstimateAmount(e.target.value)}
                    />
                  </div>

                  {/* Lead Remarks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Remarks
                    </label>
                    <Input
                      placeholder="Enter remarks..."
                      value={leadData.leadRemark}
                      onChange={(e) =>
                        setLeadData({ ...leadData, leadRemark: e.target.value })
                      }
                    />
                  </div>

                  {/* ✅ Event Type ID - Dropdown */}
                  {showEventFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="-- Select Event Type --"
                        className="w-full"
                        value={leadData.eventTypeId || undefined}
                        onChange={(value) =>
                          setLeadData({ ...leadData, eventTypeId: value })
                        }
                        options={eventTypes}
                        allowClear
                        status={
                          showEventFields && !leadData.eventTypeId
                            ? "error"
                            : ""
                        }
                      />
                      {showEventFields && !leadData.eventTypeId && (
                        <span className="text-red-500 text-xs mt-1 block">
                          Event Type is required
                        </span>
                      )}
                    </div>
                  )}

                  {showEventFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Function <span className="text-red-500">*</span>
                      </label>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        placeholder="-- Select Function --"
                        className="w-full"
                        value={leadData.functionId || undefined}
                        onChange={(value) =>
                          setLeadData({ ...leadData, functionId: value })
                        }
                        options={functions}
                        allowClear
                        status={
                          showEventFields && !leadData.functionId ? "error" : ""
                        }
                      />
                      {showEventFields && !leadData.functionId && (
                        <span className="text-red-500 text-xs mt-1 block">
                          Function is required
                        </span>
                      )}
                    </div>
                  )}
                  {/* ✅ Inquiry Date */}
                  {showEventFields && (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inquiry Date
                      </label>
                      <DatePicker
                        value={inquiryDate}
                        onChange={(date) => setInquiryDate(date)}
                        format="DD-MM-YYYY"
                        placeholder="Select inquiry date"
                        className="w-full h-[30px]"
                      />
                    </div>
                  )}

                  {/* ✅ Min Pax */}
                  {showEventFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Pax
                      </label>
                      <Input
                        type="tel"
                        min={0}
                        placeholder="Enter minimum pax..."
                        value={leadData.minPax}
                        onChange={(e) =>
                          setLeadData({ ...leadData, minPax: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* ✅ Max Pax */}
                  {showEventFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Pax
                      </label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Enter maximum pax..."
                        value={leadData.maxPax}
                        onChange={(e) =>
                          setLeadData({ ...leadData, maxPax: e.target.value })
                        }
                      />
                    </div>
                  )}

                  {/* ✅ Referral Source - Dropdown */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Source
                    </label>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      placeholder="-- Select Referral Source --"
                      className="w-full"
                      value={leadData.referralSource || undefined}
                      onChange={(value) =>
                        setLeadData({ ...leadData, referralSource: value })
                      }
                      options={referralSources}
                      allowClear
                    />
                  </div> */}

                  {/* ✅ Company Name */}
                  {showSuperAdminFields && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <Input
                        placeholder="Enter company name..."
                        value={leadData.companyName}
                        onChange={(e) =>
                          setLeadData({
                            ...leadData,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* ✅ Any Function With Us */}
                  {showEventFields && (
                    <div className="flex items-center gap-4 mt-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Any Function With Us?
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="anyFunctionWithUs"
                            checked={anyFunctionWithUs === true}
                            onChange={() => setAnyFunctionWithUs(true)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-sm text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="anyFunctionWithUs"
                            checked={anyFunctionWithUs === false}
                            onChange={() => setAnyFunctionWithUs(false)}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-sm text-gray-600">No</span>
                        </label>
                      </div>
                    </div>
                  )}
                  {showEventFields && (
                    <div className="w-full md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tentative Date(s)
                      </label>

                      {/* Existing dates list */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tentativeDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-1 rounded-full"
                          >
                            <span>{date.format("DD-MM-YYYY hh:mm A")}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setTentativeDates((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                              className="ml-1 text-blue-400 hover:text-red-500 font-bold leading-none"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Date picker to add new date */}
                      <DatePicker
                        showTime={{ format: "hh:mm A" }}
                        format="DD-MM-YYYY HH:mm A"
                        placeholder="+ Add tentative date & time"
                        className="w-72 h-[30px]"
                        value={null}
                        onChange={(date) => {
                          if (!date) return;
                          // ✅ compare by minute now, not just day (allows same date different time)
                          const already = tentativeDates.some((d) =>
                            d.isSame(date, "minute"),
                          );
                          if (!already) {
                            setTentativeDates((prev) => [...prev, date]);
                          }
                        }}
                      />

                      {tentativeDates.length > 0 && (
                        <span className="text-xs text-gray-400 ml-3">
                          {tentativeDates.length} date(s) selected
                        </span>
                      )}
                    </div>
                  )}
                  {/* Description */}
                  <div className="w-full md:col-span-3"></div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="shadow-sm rounded-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Client Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salutation
                    </label>
                    <Select
                      placeholder="-- Select Salutation --"
                      className="w-full"
                      value={leadData.selectPrefix || undefined}
                      onChange={(value) =>
                        setLeadData({ ...leadData, selectPrefix: value })
                      }
                      options={[
                        { label: "Mr", value: "Mr" },
                        { label: "Ms", value: "Ms" },
                        { label: "Miss", value: "Miss" },
                        { label: "Mrs", value: "Mrs" },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Guest Name"
                      value={leadData.clientName}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          clientName: e.target.value,
                        })
                      }
                    />
                    {!leadData.clientName && (
                      <span className="text-red-500 text-xs mt-1 block">
                        client Name is required
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <Input
                      placeholder="Enter Email"
                      value={leadData.emailId}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          emailId: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter Contact Number"
                      value={leadData.contactNumber}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                    {!leadData.contactNumber && (
                      <span className="text-red-500 text-xs mt-1 block">
                        contact name is required
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      placeholder="Enter Address"
                      value={leadData.address}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pin Code
                    </label>
                    <Input
                      placeholder="Enter Pin Code"
                      value={leadData.pinCode}
                      onChange={(e) =>
                        setLeadData({
                          ...leadData,
                          pinCode: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Select
                      placeholder="-- Select State --"
                      value={leadData.state || undefined}
                      onChange={handleStateChange}
                      className="w-full"
                    >
                      {states.map((state) => (
                        <Select.Option key={state.id} value={state.id}>
                          {state.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Select
                      placeholder="-- Select City --"
                      value={leadData.city || undefined}
                      onChange={(value) =>
                        setLeadData({ ...leadData, city: value })
                      }
                      className="w-full"
                    >
                      {cities.map((city) => (
                        <Select.Option key={city.id} value={city.id}>
                          {city.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Remarks */}
            <Card className="shadow-sm rounded-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Overall Remarks
                  </h2>
                </div>
                <Input.TextArea
                  rows={4}
                  placeholder="Your message..."
                  className="w-full"
                  value={leadData.overallRemark}
                  onChange={(e) =>
                    setLeadData({
                      ...leadData,
                      overallRemark: e.target.value,
                    })
                  }
                />
              </CardContent>
            </Card>

            {/* Follow Up Section */}
            <Card className="shadow-sm rounded-lg border border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">
                  Follow Up
                </h2>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <div className="filItems relative">
                    <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                    <input
                      className="input pl-8"
                      placeholder="Search invoice"
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  {/* Created At Filter */}
                  {/* <div className="filItems relative">
                    <select
                      className="select pe-7.5"
                      value={selectedCreatedAt}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCreatedAt(value);
                        if (value && value !== "3") {
                          fetchCreatedAtData(value);
                        }
                      }}
                    >
                      <option value="">Created At</option>
                      <option value="1">Today</option>
                      <option value="2">Next 1 Month</option>
                      <option value="4">Last Month</option>
                      <option value="3">Custom Date</option>
                    </select>
                  </div> */}

                  {/* {selectedCreatedAt === "3" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="input"
                        value={customRangeCreatedAt.start}
                        onChange={(e) =>
                          setCustomRangeCreatedAt((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        className="input"
                        value={customRangeCreatedAt.end}
                        onChange={(e) =>
                          setCustomRangeCreatedAt((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                      />
                      <button
                        className="btn btn-primary"
                        disabled={
                          !customRangeCreatedAt.start ||
                          !customRangeCreatedAt.end
                        }
                        onClick={() => fetchCreatedAtData("3")}
                      >
                        Apply
                      </button>
                    </div>
                  )} */}

                  {/* Get Lead Filter */}
                  {/* <div className="filItems relative">
                    <select
                      className="select pe-7.5"
                      value={selectedGetLead}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedGetLead(value);
                        if (value && value !== "3") {
                          fetchGetLeadData(value);
                        }
                      }}
                    >
                      <option value="">Get Lead</option>
                      <option value="1">Today</option>
                      <option value="2">Next 1 Month</option>
                      <option value="4">Last Month</option>
                      <option value="3">Custom Date</option>
                    </select>
                  </div> */}

                  {selectedGetLead === "3" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="input"
                        value={customRangeGetLead.start}
                        onChange={(e) =>
                          setCustomRangeGetLead((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        className="input"
                        value={customRangeGetLead.end}
                        onChange={(e) =>
                          setCustomRangeGetLead((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                      />
                      <button
                        className="btn btn-primary"
                        disabled={
                          !customRangeGetLead.start || !customRangeGetLead.end
                        }
                        onClick={() => fetchGetLeadData("3")}
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {totalLeads > 0 && (
                    <span className="text-gray-600 text-sm font-medium">
                      Total: {totalLeads}
                    </span>
                  )}

                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={() => setIsFollowUpOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"
                    >
                      + Add Follow Up
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredFollowUps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-sm">
                      <img
                        src={toAbsoluteUrl("/media/illustrations/nofound.jpg")}
                        alt="No Follow-Up"
                        className="w-48 h-48 mb-4"
                      />
                      <span>No Follow-Up Found</span>
                    </div>
                  ) : (
                    filteredFollowUps.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
                              {leadData.clientName?.charAt(0)?.toUpperCase()}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                  {leadData.clientName}
                                </h3>
                                <span className="text-sm w-40x">
                                  {item.clientRemarks}
                                </span>
                              </div>

                              <div className="text-right ml-4">
                                <div className="flex items-center gap-1 text-base font-medium">
                                  <span className="text-gray-500 text-sm">
                                    Type:
                                  </span>
                                  <span className="text-gray-900 text-sm">
                                    {item.followUpType || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 text-sm font-medium mt-0.5">
                                  <span className="text-gray-500">
                                    Reminder:
                                  </span>
                                  <span className="text-gray-900">
                                    {item.followUpDate || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium mt-0.5">
                                  <span className="text-gray-500">
                                    created at:
                                  </span>
                                  <span className="text-gray-900">
                                    {(() => {
                                      if (!item.createdAt) {
                                        return "Not Available";
                                      }
                                      try {
                                        return dayjs(item.createdAt, [
                                          "DD/MM/YYYY hh:mm A",
                                          "DD/MM/YYYY",
                                        ]).format("DD MMM YYYY, hh:mm A");
                                      } catch (e) {
                                        return item.createdAt;
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <hr className="my-3 border-gray-300" />

                            <div className="flex items-center gap-6 text-xs text-gray-600 flex-wrap">
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm">
                                  {item.emailId ||
                                    leadData.emailId ||
                                    "No Email"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-sm">
                                  {item.followUpDate || "N/A"}
                                </span>
                              </div>

                              <div className="ml-auto flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(item.id, index)}
                                  className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pb-6">
              <button
                onClick={() => navigate("/super-leads")}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isEditMode ? "Update" : "Save"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Container>

      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={(val) => {
          setIsFollowUpOpen(val);
          setViewingFollowUp(null);
        }}
        onSave={handleSaveFollowUp}
        clientName={leadData.clientName}
        viewOnlyFollowUp={viewingFollowUp}
        defaultManager={leadData.leadAssign}
      />
      <AddSource
        isOpen={isAddSourceOpen}
        onClose={setIsAddSourceOpen}
        onSuccess={() => {
          fetchLeadSources();
        }}
      />

      <AddSubSource
        isOpen={isAddSubSourceOpen}
        onClose={setIsAddSubSourceOpen}
        sourceOptions={leadSources.map((s) => ({
          leadSourceId: s.value,
          sourceName: s.label,
        }))}
        onSuccess={() => {
          if (leadData.leadSourceId) {
            handleLeadSourceChange(leadData.leadSourceId);
          }
        }}
      />
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <svg
              className="w-10 h-10 animate-spin text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              {isEditMode ? "Updating Lead..." : "Saving Lead..."}
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
}
