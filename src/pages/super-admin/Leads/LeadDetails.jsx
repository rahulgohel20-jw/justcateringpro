import { Fragment, useEffect, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetFilteredFollowUps,
  GetLeadByID,
  DeleteLeadbyID,
  UpdateleadbyID,
} from "@/services/apiServices";
import { Edit, Trash, Eye } from "lucide-react";
import Swal from "sweetalert2";
import AddFollowUpModal from "../../../partials/modals/add-followup-lead/FollowUpModal";

const LeadDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(true);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);

  const [editFollowUpData, setEditFollowUpData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingFollowUp, setViewingFollowUp] = useState(null);


  useEffect(() => {
    const fetchLeadDetails = async () => {
      try {
        setLoading(true);

       

        // Call the actual API
        const response = await GetLeadByID(id);

      

        const fullLeadData = response?.data?.data?.[0];

        if (fullLeadData) {
          // Map the API response to our component state
          const mappedLeadData = {
            id: fullLeadData.id,
            leadCode: fullLeadData.leadCode,
            leadType: fullLeadData.leadType,
            leadStatus: fullLeadData.leadStatus,
            leadRemark: fullLeadData.leadRemark,
            leadAssign: fullLeadData.leadAssignId,
            leadAssignName: fullLeadData.leadAssignName || "Unassigned",
            selectPrefix: fullLeadData.selectPrefix,
            clientName: fullLeadData.clientName,
            emailId: fullLeadData.emailId,
            contactNumber: fullLeadData.contactNumber,
            address: fullLeadData.address,
            pinCode: fullLeadData.pinCode,
            city: fullLeadData.cityId,
            cityName: fullLeadData.cityName || "N/A",
            state: fullLeadData.stateId,
            stateName: fullLeadData.stateName || "N/A",
            plan: fullLeadData.planId,
            planName: fullLeadData.planName || "Not Selected",
            overallRemark: fullLeadData.overallRemark,
            createdAt:
              fullLeadData.createdAt?.split("T")[0] || fullLeadData.createdAt,
            updatedAt:
              fullLeadData.updatedAt?.split("T")[0] || fullLeadData.updatedAt,
            followUpDetails: fullLeadData.followUpDetails || [],
          };

          setLeadData(mappedLeadData);
          setFollowUps(fullLeadData.followUpDetails || []);
          setError(null);
        } else {
          setError("Lead not found");
        }
      } catch (err) {
        console.error("❌ Error fetching lead details:", err);
        setError("Failed to load lead details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeadDetails();
    }
  }, [id]);

  // ✅ Delete Lead Handler
  const handleDeleteLead = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this lead?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting...",
          text: "Please wait",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await DeleteLeadbyID(id);

        if (response?.data?.success) {
          await Swal.fire({
            title: "Deleted!",
            text: response.data.msg || "Lead has been deleted successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/super-leads");
        } else {
          throw new Error(response?.data?.msg || "Failed to delete lead");
        }
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.msg || error.message || "Failed to delete lead",
        icon: "error",
      });
    }
  };

  // ✅ Delete Follow-Up Handler
  const handleDeleteFollowUp = async (followUpId) => {
    try {
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
        // Remove from UI immediately
        setFollowUps(followUps.filter((fu) => fu.id !== followUpId));
        Swal.fire("Deleted!", "Follow-up has been deleted.", "success");

        // Optionally: Call API to delete from backend
        // await DeleteFollowUp(followUpId);
      }
    } catch (error) {
      console.error("Error deleting follow-up:", error);
    }
  };

  // ✅ Edit Follow-Up Handler
  const handleEditFollowUp = (followUp) => {
    setEditFollowUpData(followUp);
    setIsEditMode(true);
    setShowFollowUpModal(true);
  };

  // ✅ View Follow-Up Handler
  const handleViewFollowUp = (followUp) => {
    setViewingFollowUp(followUp);
    setShowFollowUpModal(true);
  };

  // ✅ Save Follow-Up Handler
  const handleSaveFollowUp = async (formData) => {
    try {
      

      // Fetch current lead data
      const response = await GetLeadByID(id);
      const dataArray = response?.data?.data;

      if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
        Swal.fire("Error", "Failed to fetch lead details", "error");
        return;
      }

      const fullLeadData = dataArray[0];

      // Create new follow-up object
      const newFollowUp = {
        id: 0,
        leadId: Number(id),
        followUpType: formData.followUpType || formData.followType,
        followUpStatus: formData.followUpStatus || "Open",
        followUpDate: formData.followupDate || formData.followUpDate,
        clientRemarks: formData.description || formData.clientRemarks || "",
        employeeRemarks: formData.employeeRemarks || "",
        memberId: formData.managerId || 0,
      };

      // Get existing follow-ups
      const existingFollowUps = (fullLeadData.followUpDetails || []).map(
        (fu) => ({
          id: fu.id ? Number(fu.id) : 0,
          leadId: Number(id),
          followUpType: fu.followUpType || fu.followType || "",
          followUpStatus: fu.followUpStatus || "Open",
          followUpDate: fu.followUpDate || fu.followupDate || "",
          clientRemarks: fu.clientRemarks || "",
          employeeRemarks: fu.employeeRemarks || "",
          memberId: fu.memberId || 0,
        }),
      );

      // Combine all follow-ups
      const allFollowUps = [...existingFollowUps, newFollowUp];

      // Prepare payload for UpdateleadbyID
      const payload = {
        address: fullLeadData.address || "",
        cityId: fullLeadData.cityId ? Number(fullLeadData.cityId) : 0,
        clientName: fullLeadData.clientName || "",
        contactNumber: fullLeadData.contactNumber || "",
        emailId: fullLeadData.emailId || "",
        leadAssignId: fullLeadData.leadAssignId
          ? Number(fullLeadData.leadAssignId)
          : 0,
        leadCode: fullLeadData.leadCode || "",
        leadRemark: fullLeadData.leadRemark || "",
        leadSource: fullLeadData.leadSource || "",
        leadStatus: fullLeadData.leadStatus || "",
        leadType: fullLeadData.leadType || "",
        overallRemark: fullLeadData.overallRemark || "",
        pinCode: fullLeadData.pinCode || "",
        planId: fullLeadData.planId ? Number(fullLeadData.planId) : 0,
        selectPrefix: fullLeadData.selectPrefix || "",
        stateId: fullLeadData.stateId ? Number(fullLeadData.stateId) : 0,
        followUpDetails: allFollowUps,
      };

     

      // Update lead with new follow-up
      const updateResponse = await UpdateleadbyID(id, payload);

      const apiData = updateResponse?.data || updateResponse;
      const isSuccess = apiData?.success === true;

      if (isSuccess) {
        Swal.fire("Success", "Follow-up added successfully!", "success");

        // Close modal
        setShowFollowUpModal(false);
        setEditFollowUpData(null);
        setIsEditMode(false);

        // Refresh follow-ups
        if (showFollowUps) {
          const refreshPayload = { leadId: Number(id), isCreated: false };
          const refreshResponse = await GetFilteredFollowUps(refreshPayload);
          if (refreshResponse.data.success) {
            setFollowUps(refreshResponse?.data?.data || []);
          }
        }
      } else {
        const errorMsg = apiData?.msg || "Failed to add follow-up";
        Swal.fire("Error", errorMsg, "error");
      }
    } catch (error) {
      console.error("❌ Error saving follow-up:", error);
      Swal.fire("Error", "Failed to save follow-up", "error");
    }
  };

  // ✅ Color Helper Functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "closed":
        return "bg-green-100 text-green-700";
      case "pending":
      case "open":
        return "bg-orange-100 text-orange-700";
      case "cancel":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLeadTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "hot":
        return "bg-red-100 text-red-700";
      case "cold":
        return "bg-blue-100 text-blue-700";
      case "inquire":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (error || !leadData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Lead not found"}</p>
          <button
            onClick={() => navigate("/super-leads")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="min-h-screen p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Sidebar */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
            {/* Lead Info Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg shadow-md">
                <i className="fas fa-file-alt"></i>
                <span className="font-medium text-sm">Lead Info</span>
              </div>
              <span
                className={`${getLeadTypeColor(leadData.leadType)} text-xs px-3 py-1 rounded-lg shadow-sm flex items-center`}
              >
                {leadData.leadType}
              </span>
              <span
                className={`${getStatusColor(leadData.leadStatus)} text-xs px-3 py-1 rounded-lg shadow-sm flex items-center`}
              >
                {leadData.leadStatus}
              </span>
            </div>

            {/* Profile Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 overflow-hidden shadow-md">
                <div className="text-5xl font-bold text-blue-600">
                  {leadData.clientName?.charAt(0)?.toUpperCase() || "L"}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {leadData.selectPrefix} {leadData.clientName}
                </h2>
              </div>

              <span className="text-md font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {leadData.leadCode}
              </span>
            </div>

            <div className="text-center mb-6 flex gap-3">
              <button
                className={`text-white py-2 rounded-lg w-full transition-colors ${
                  showLeadDetails
                    ? "bg-[#005BA8] hover:bg-[#004a8f]"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
                onClick={() => {
                  setShowLeadDetails(true);
                  setShowFollowUps(false);
                }}
              >
                Lead Details
              </button>
              <button
                className={`text-white py-2 rounded-lg w-full transition-colors ${
                  showFollowUps
                    ? "bg-[#005BA8] hover:bg-[#004a8f]"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
                onClick={() => {
                  setShowFollowUps(true);
                  setShowLeadDetails(false);
                }}
              >
                Follow-Ups
              </button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Lead Code</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.leadCode}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Created Date</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.createdAt}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Contact</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.contactNumber}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Email</span>
                </div>
                <span
                  className="text-sm font-bold text-gray-800 block truncate"
                  title={leadData.emailId}
                >
                  {leadData.emailId}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Lead Type</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block capitalize">
                  {leadData.leadType}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Status</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.leadStatus}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Source</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block"></span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Assigned To</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.leadAssignName || "N/A"}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-blue-100 col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">Plan Interest</span>
                </div>
                <span className="text-sm font-bold text-gray-800 block">
                  {leadData.planName || "Not Selected"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {showFollowUps ? (
              // Follow-Ups View
              <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-tasks text-blue-600"></i>
                    Follow-Up Activities
                  </h2>
                  <button
                    onClick={() => setShowFollowUpModal(true)}
                    className="px-4 py-2 bg-[#005BA8] text-white rounded-lg hover:bg-[#004a8f] transition-colors font-medium flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    Add Follow-Up
                  </button>
                </div>

                {followUpsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading follow-ups...</p>
                  </div>
                ) : (
                  <>
                    {/* Follow-Ups List */}
                    <div className="space-y-4">
                      {followUps.map((followUp) => (
                        <div
                          key={followUp.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                                <i className="fas fa-comment-dots text-blue-600 text-sm"></i>
                                Follow-Up #{followUp.id}
                              </h3>
                              <span
                                className={`${getStatusColor(followUp.followUpStatus)} text-xs px-2 py-1 rounded-full`}
                              >
                                {followUp.followUpStatus}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleViewFollowUp(followUp)}
                                className="text-blue-700 hover:text-blue-800 transition-colors"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditFollowUp(followUp)}
                                className="text-purple-700 hover:text-purple-900 transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteFollowUp(followUp.id)
                                }
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Delete"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium capitalize">
                                {followUp.followUpType}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Follow-Up Date:
                              </span>
                              <span className="font-medium">
                                {followUp.followUpDate}
                              </span>
                            </div>

                            {followUp.clientRemarks && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Client Remarks:
                                </span>
                                <span className="font-medium text-xs">
                                  {followUp.clientRemarks}
                                </span>
                              </div>
                            )}

                            {followUp.employeeRemarks && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Employee Remarks:
                                </span>
                                <span className="font-medium text-xs">
                                  {followUp.employeeRemarks}
                                </span>
                              </div>
                            )}

                            {followUp.createdAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span className="font-medium text-xs">
                                  {followUp.createdAt}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {followUps.length === 0 && (
                      <div className="text-center py-12">
                        <i className="fas fa-tasks text-gray-300 text-6xl mb-4"></i>
                        <p className="text-gray-500">No follow-ups found</p>
                        <button
                          onClick={() => setShowFollowUpModal(true)}
                          className="mt-4 px-6 py-2 bg-[#005BA8] text-white rounded-lg hover:bg-[#004a8f] transition-colors"
                        >
                          Create First Follow-Up
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : showLeadDetails ? (
              <>
                {/* Lead Information Header */}
                <div className="bg-white rounded-lg shadow-lg border border-blue-100">
                  <div className="flex justify-between items-center bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 flex-wrap">
                      <i className="fas fa-file-alt"></i>
                      <span>
                        {leadData.selectPrefix} {leadData.clientName}
                      </span>
                      <span>-</span>
                      <span className="text-sm">{leadData.leadCode}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bg-white text-black hover:bg-gray-100 px-4 py-1 rounded-lg text-sm transition-all"
                        onClick={() =>
                          navigate(`/super-leads/addlead`, {
                            state: { leadData },
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white hover:bg-red-600 px-4 py-1 rounded-lg text-sm transition-all"
                        onClick={handleDeleteLead}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lead Details Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                    Lead Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Lead Code:
                      </p>
                      <p className="text-gray-600">{leadData.leadCode}</p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Lead Type:
                      </p>
                      <p className="text-gray-600">
                        <span
                          className={`${getLeadTypeColor(leadData.leadType)} px-2 py-1 rounded-full text-xs`}
                        >
                          {leadData.leadType}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Lead Status:
                      </p>
                      <p className="text-gray-600">
                        <span
                          className={`${getStatusColor(leadData.leadStatus)} px-2 py-1 rounded-full text-xs`}
                        >
                          {leadData.leadStatus}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Lead Source:
                      </p>
                      <p className="text-gray-600">
                        {leadData.leadSource || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Assigned To:
                      </p>
                      <p className="text-gray-600">
                        {leadData.leadAssignName || "Unassigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Plan Interest:
                      </p>
                      <p className="text-gray-600">
                        {leadData.planName || "Not Selected"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Created Date:
                      </p>
                      <p className="text-gray-600">{leadData.createdAt}</p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Last Updated:
                      </p>
                      <p className="text-gray-600">{leadData.updatedAt}</p>
                    </div>

                    {leadData.leadRemark && (
                      <div className="md:col-span-2">
                        <p className="text-gray-800 mb-1 font-semibold">
                          Lead Remarks:
                        </p>
                        <p className="text-gray-600">{leadData.leadRemark}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                    Client Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Client Name:
                      </p>
                      <p className="text-gray-600">
                        {leadData.selectPrefix} {leadData.clientName}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">Email:</p>
                      <p className="text-gray-600">{leadData.emailId}</p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Contact Number:
                      </p>
                      <p className="text-gray-600">{leadData.contactNumber}</p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">
                        Pin Code:
                      </p>
                      <p className="text-gray-600">
                        {leadData.pinCode || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">City:</p>
                      <p className="text-gray-600">{leadData.cityName}</p>
                    </div>

                    <div>
                      <p className="text-gray-800 mb-1 font-semibold">State:</p>
                      <p className="text-gray-600">{leadData.stateName}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-gray-800 mb-1 font-semibold">
                        Address:
                      </p>
                      <p className="text-gray-600">
                        {leadData.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Remarks */}
                {leadData.overallRemark && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                      Overall Remarks
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {leadData.overallRemark}
                      </p>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                    Activity Timeline
                  </h3>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="w-0.5 h-full bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-semibold text-gray-800">
                          Lead Created
                        </p>
                        <p className="text-xs text-gray-500">
                          {leadData.createdAt}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Lead was created with status: {leadData.leadStatus}
                        </p>
                      </div>
                    </div>

                    {leadData.leadAssignName &&
                      leadData.leadAssignName !== "Unassigned" && (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-0.5 h-full bg-gray-300"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-semibold text-gray-800">
                              Lead Assigned
                            </p>
                            <p className="text-xs text-gray-500">
                              {leadData.createdAt}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Assigned to {leadData.leadAssignName}
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          Last Updated
                        </p>
                        <p className="text-xs text-gray-500">
                          {leadData.updatedAt}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Lead information was last modified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Follow-Up Modal */}
      <AddFollowUpModal
        isOpen={showFollowUpModal}
        onClose={(val) => {
          setShowFollowUpModal(val);
          setEditFollowUpData(null);
          setIsEditMode(false);
          setViewingFollowUp(null);
        }}
        onSave={handleSaveFollowUp}
        clientName={leadData?.clientName}
        editMode={isEditMode}
        followUpData={editFollowUpData}
        viewOnlyFollowUp={viewingFollowUp}
      />
    </Fragment>
  );
};

export default LeadDetails;

// Note: Make sure to add this route in your router configuration:
// {
//   path: "/super-leads/:id",
//   element: <LeadDetails />
// }
