import React, { useState, useEffect } from "react";
import {
  AddTickets,
  AddComments,
  EditTicket,
  uploadFileformenu,
  GetAllInteraction,
  Fetchmanager,
  GetCommentsByTicketId,
  DeleteComment,
  EditComment,
} from "../../../services/apiServices";
import Swal from "sweetalert2";

const AddTicketModal = ({
  isOpen,
  onClose,
  onSave,
  ticketNumber,
  userId,
  onRefresh,
  editMode = false,
  ticketData = null,
}) => {
  const formatToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatToYYYYMMDD = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [day, month, year] = ddmmyyyy.split("/");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    interaction: "",
    interactionId: 0,
    ticketFrom: "Call",
    clientmsg: "",
    usermsg: "",
    expectedCloseDate: "",
    actualCloseDate: "",
    department: "Employee",
    assignTo: "",
    assignToUserId: 0,
    status: "In Progress",
    createdBy: "Admin",
    comment: "",
    userId: userId,
    moduleId: 1,
  });
  const [interactions, setInteractions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingInteractions, setLoadingInteractions] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);

  // New state for comments
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchInteractions();
      fetchManagers();
    }
  }, [isOpen]);

  const fetchCommentsByTicketId = async (ticketId) => {
    if (!ticketId) return;

    try {
      const response = await GetCommentsByTicketId(ticketId);

      let commentData =
        response?.data?.data?.["Ticket Comment Details"] ||
        response?.data?.data?.ticketComments ||
        response?.data?.data?.comments ||
        response?.data?.data ||
        response?.data?.comments ||
        response?.data ||
        [];

      let commentsArray = [];

      if (Array.isArray(commentData)) {
        commentsArray = commentData;
      } else if (commentData && typeof commentData === "object") {
        commentsArray =
          commentData["Ticket Comment Details"] ||
          commentData.ticketComments ||
          commentData.comments ||
          commentData.data ||
          [];

        if (!Array.isArray(commentsArray)) {
          const values = Object.values(commentData);
          if (values.length > 0 && Array.isArray(values[0])) {
            commentsArray = values[0];
          } else {
            commentsArray = [];
          }
        }
      }

      if (Array.isArray(commentsArray) && commentsArray.length > 0) {
        const existingComments = commentsArray.map((comment) => {
          return {
            id: comment.ticketCommentId || comment.id,
            comment: comment.comment,
            commentBy: comment.commentby || comment.commentBy || "User",
            createdAt:
              comment.createdat ||
              comment.createdAt ||
              new Date().toISOString(),
            isNew: false,
            isEdited: false,
          };
        });

        setComments(existingComments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      console.error("Error details:", err.response?.data);
      setComments([]);
    }
  };

  useEffect(() => {
    if (
      editMode &&
      ticketData &&
      interactions.length > 0 &&
      managers.length > 0
    ) {
      setFormData({
        interaction: ticketData.interactionname || "",
        interactionId: ticketData.interactionid || 0,
        ticketFrom: ticketData.ticketfrom || "Call",
        clientmsg: ticketData.clientmsg || "",
        usermsg: ticketData.usermsg || "",
        expectedCloseDate: formatToYYYYMMDD(ticketData.expactedclosedate) || "",
        actualCloseDate: formatToYYYYMMDD(ticketData.actualclosedate) || "",
        department: "Employee",
        assignTo: ticketData.assigntoname || "",
        assignToUserId: ticketData.assigntouserid || 0,
        status: ticketData.status || "In Progress",
        createdBy: "Admin",
        comment: "",
        userId: ticketData.userid || userId,
        moduleId: 1,
      });

      if (ticketData.documentpath) {
        setUploadedFilePath(ticketData.documentpath);
      }

      if (ticketData.id) {
        fetchCommentsByTicketId(ticketData.id);
      }
    }
  }, [editMode, ticketData, interactions, managers]);

  const fetchManagers = async () => {
    try {
      const response = await Fetchmanager(1);
      const managerData = response?.data?.data?.["userDetails"] || [];
      setManagers(managerData);

      if (managerData.length > 0 && !formData.assignTo && !editMode) {
        setFormData((prev) => ({
          ...prev,
          assignTo: managerData[0].firstName,
          assignToUserId: managerData[0].id,
        }));
      }
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  const fetchInteractions = async () => {
    setLoadingInteractions(true);
    try {
      const response = await GetAllInteraction();
      const interactionData =
        response?.data?.data?.["Interaction Details"] || [];

      const activeInteractions = interactionData.filter(
        (item) => item.isActive && !item.isDelete
      );
      setInteractions(activeInteractions);

      if (activeInteractions.length > 0 && !formData.interaction && !editMode) {
        setFormData((prev) => ({
          ...prev,
          interaction: activeInteractions[0].interactionname,
          interactionId: activeInteractions[0].id,
        }));
      }
    } catch (err) {
      console.error("Error fetching interactions:", err);
      setError("Failed to load interactions");
    } finally {
      setLoadingInteractions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "interaction") {
      const selectedInteraction = interactions.find(
        (i) => i.interactionname === value
      );
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        interactionId: selectedInteraction?.id || 0,
      }));
    } else if (name === "assignTo") {
      const selectedManager = managers.find((m) => m.firstName === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        assignToUserId: selectedManager?.id || 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Updated handleFileChange to store file object
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFilePath("");
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) fileInput.value = "";
  };

  const handleAddComment = () => {
    if (!formData.comment.trim()) return;

    const newComment = {
      id: Date.now(),
      comment: formData.comment.trim(),
      commentBy: formData.createdBy || "Admin",
      createdAt: new Date().toISOString(),
      isNew: true,
    };

    setComments((prev) => [...prev, newComment]);
    setFormData((prev) => ({ ...prev, comment: "" }));
  };

  const handleEditComment = (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingCommentText(comment.comment);
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    const comment = comments.find((c) => c.id === commentId);

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, comment: editingCommentText.trim(), isEdited: true }
          : c
      )
    );

    setEditingCommentId(null);
    setEditingCommentText("");
    setCommentError(null);

    if (comment && !comment.isNew && ticketData?.id) {
      try {
        const updatePayload = {
          ticketCommentId: commentId,
          comment: editingCommentText.trim(),
          commentBy: comment.commentBy,
          ticketId: ticketData.id,
        };

        await EditComment(commentId, updatePayload);

        await fetchCommentsByTicketId(ticketData.id);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Comment has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error updating comment:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "Failed to update comment";

        setCommentError(errorMessage);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });

        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, comment: comment.comment, isEdited: comment.isEdited }
              : c
          )
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId || commentId === "undefined") {
      setCommentError("Invalid comment ID");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) {
        setCommentError("Comment not found");
        return;
      }

      if (comment.isNew) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Comment has been removed.",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      if (ticketData?.id) {
        try {
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while we delete the comment",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await DeleteComment(Number(commentId));

          setComments((prev) => prev.filter((c) => c.id !== commentId));

          if (editMode && ticketData.id) {
            await fetchCommentsByTicketId(ticketData.id);
          }

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Comment has been deleted successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error("Error deleting comment:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.msg ||
            err.message ||
            "Failed to delete comment";

          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
          });

          setCommentError("Failed to delete comment");
        }
      }
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // ✅ Updated handleSubmit to use FormData
  const handleSubmit = async () => {
    if (!formData.interaction) {
      setError("Please select an interaction");
      return;
    }
    if (!formData.clientmsg) {
      setError("Please enter Client Message");
      return;
    }
    if (!formData.usermsg) {
      setError("Please enter User Message");
      return;
    }
    if (!formData.expectedCloseDate) {
      setError("Please select expected close date");
      return;
    }
    if (!formData.assignTo) {
      setError("Please select a person to assign to");
      return;
    }

    setLoading(true);
    setError(null);
    setCommentError(null);

    try {
      // ✅ Create FormData object
      const formDataObj = new FormData();

      // ✅ Append all text fields
      formDataObj.append(
        "actualclosedate",
        formatToDDMMYYYY(formData.actualCloseDate)
      );
      formDataObj.append("assigntoname", formData.assignTo);
      formDataObj.append("assigntouserid", formData.assignToUserId);
      formDataObj.append("clientmsg", formData.clientmsg);
      formDataObj.append("usermsg", formData.usermsg);
      formDataObj.append(
        "expactedclosedate",
        formatToDDMMYYYY(formData.expectedCloseDate)
      );
      formDataObj.append("interactionid", formData.interactionId);
      formDataObj.append("interactionname", formData.interaction);
      formDataObj.append(
        "interactiontype",
        interactions.find((i) => i.id === formData.interactionId)
          ?.interactiontype || ""
      );
      formDataObj.append("status", formData.status);
      formDataObj.append("ticketfrom", formData.ticketFrom);
      formDataObj.append("userid", formData.userId);

      // ✅ Append file if selected
      if (selectedFile) {
        formDataObj.append("file", selectedFile);
      } else if (uploadedFilePath) {
        // If there's an existing file path (edit mode), include it
        formDataObj.append("documentpath", uploadedFilePath);
      }

      // Debug: Log FormData contents
      for (let pair of formDataObj.entries()) {
        if (pair[1] instanceof File) {
        } else {
        }
      }

      let response;
      if (editMode && ticketData) {
        response = await EditTicket(ticketData.id, formDataObj);

        const newComments = comments.filter((c) => c.isNew);
        if (newComments.length > 0) {
          for (const comment of newComments) {
            try {
              const commentPayload = {
                ticketCommentId: comment.id || 0,
                comment: comment.comment,
                commentBy: comment.commentBy,
                ticketId: ticketData.id,
              };
              await AddComments(commentPayload);
            } catch (commentErr) {
              console.error("Error adding comment:", commentErr);
              setCommentError("Some comments failed to add");
            }
          }
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Ticket Updated successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        response = await AddTickets(formDataObj);

        const ticketId =
          response?.data?.data?.ticket?.id ||
          response?.data?.data?.id ||
          response?.data?.id;

        if (ticketId && comments.length > 0) {
          let successCount = 0;
          let failCount = 0;

          for (const comment of comments) {
            try {
              const commentPayload = {
                comment: comment.comment,
                commentBy: comment.commentBy,
                ticketId: ticketId,
              };
              await AddComments(commentPayload);
              successCount++;
            } catch (commentErr) {
              failCount++;
              console.error("Error adding comment:", commentErr);
            }
          }

          if (failCount > 0) {
            setCommentError(
              `${successCount} comment(s) added, ${failCount} failed`
            );
          }
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Ticket Created successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      if (onSave) {
        onSave(response);
      }

      if (onRefresh) {
        onRefresh();
      }

      // Reset form
      setFormData({
        interaction:
          interactions.length > 0 ? interactions[0].interactionname : "",
        interactionId: interactions.length > 0 ? interactions[0].id : 0,
        ticketFrom: "Call",
        clientmsg: "",
        usermsg: "",
        expectedCloseDate: "",
        actualCloseDate: "",
        department: "Employee",
        assignTo: managers.length > 0 ? managers[0].firstName : "",
        assignToUserId: managers.length > 0 ? managers[0].id : 0,
        status: "In Progress",
        createdBy: "Admin",
        comment: "",
        userId: userId,
        moduleId: 1,
      });
      setSelectedFile(null);
      setUploadedFilePath("");
      setError(null);
      setCommentError(null);
      setComments([]);

      onClose();
    } catch (err) {
      console.error("Error saving ticket:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        `Failed to ${editMode ? "update" : "save"} ticket`;
      setError(errorMessage);

      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-50 border-yellow-200";
      case "Opened":
        return "bg-blue-50 border-blue-200";
      case "Pending":
        return "bg-orange-50 border-orange-200";
      case "Resolved":
        return "bg-green-50 border-green-200";
      case "Closed":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-500";
      case "Opened":
        return "bg-blue-500";
      case "Pending":
        return "bg-orange-500";
      case "Resolved":
        return "bg-green-500";
      case "Closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="fas fa-ticket-alt text-blue-600"></i>
            {editMode
              ? `Edit Ticket: ${ticketNumber}`
              : `Ticket No: ${ticketNumber}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {commentError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-start gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{commentError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Interaction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction <span className="text-red-500">*</span>
              </label>
              {loadingInteractions ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <select
                  name="interaction"
                  value={formData.interaction}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {interactions.length === 0 ? (
                    <option value="">No interactions available</option>
                  ) : (
                    interactions.map((interaction) => (
                      <option
                        key={interaction.id}
                        value={interaction.interactionname}
                      >
                        {interaction.interactionname}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Ticket From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket From <span className="text-red-500">*</span>
              </label>
              <select
                name="ticketFrom"
                value={formData.ticketFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Call</option>
                <option>Email</option>
                <option>Web</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="clientmsg"
                value={formData.clientmsg}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client Message..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="usermsg"
                value={formData.usermsg}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter User Message..."
                required
              />
            </div>

            {/* Expected Close Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected close date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Actual Close Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual close date
              </label>
              <input
                type="date"
                name="actualCloseDate"
                value={formData.actualCloseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                name="assignTo"
                value={formData.assignTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {managers.length === 0 ? (
                  <option value="">No managers available</option>
                ) : (
                  managers.map((manager) => (
                    <option key={manager.id} value={manager.firstName}>
                      {manager.firstName}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${getStatusColor(formData.status)}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusDotColor(formData.status)}`}
                ></div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium"
                >
                  <option>In Progress</option>
                  <option>Opened</option>
                  <option>Pending</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            {/* Upload Document */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document
              </label>

              {!selectedFile && !uploadedFilePath ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className={`cursor-pointer flex flex-col items-center ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, XLSX (MAX. 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedFile
                            ? selectedFile.name
                            : uploadedFilePath.split("/").pop()}
                        </p>
                        <p className="text-xs text-green-600">
                          {selectedFile
                            ? `${formatFileSize(selectedFile.size)} • Selected`
                            : "Existing file"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      disabled={loading}
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Life Cycle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ticket Life Cycle
            </label>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">
                  Opened
                </span>
                <span className="text-xs font-medium text-gray-400">
                  In progress
                </span>
                <span className="text-xs font-medium text-gray-400">
                  Pending
                </span>
                <span className="text-xs font-medium text-gray-400">
                  Resolved
                </span>
                <span className="text-xs font-medium text-gray-400">
                  Closed
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute h-2 bg-blue-600 rounded-full transition-all"
                  style={{
                    width:
                      formData.status === "Opened"
                        ? "20%"
                        : formData.status === "In Progress"
                          ? "40%"
                          : formData.status === "Pending"
                            ? "60%"
                            : formData.status === "Resolved"
                              ? "80%"
                              : formData.status === "Closed"
                                ? "100%"
                                : "20%",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
              <span>
                Comments {comments.length > 0 && `(${comments.length})`}
              </span>
              {comments.length > 0 && (
                <span className="text-xs font-normal text-gray-500">
                  Scroll to view all
                </span>
              )}
            </h3>

            {/* Display existing comments */}
            {comments.length > 0 && (
              <div className="mb-4 space-y-3 max-h-80 overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {comment.commentBy?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800">
                              {comment.commentBy || "User"}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatCommentDate(
                                comment.createdAt || comment.createdat
                              )}
                            </span>
                            {comment.isEdited && (
                              <span className="text-xs text-gray-400 ml-2 italic">
                                (edited)
                              </span>
                            )}
                          </div>
                          {(comment.isNew ||
                            comment.commentBy === formData.createdBy) && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                title="Edit comment"
                                disabled={
                                  editingCommentId !== null &&
                                  editingCommentId !== comment.id
                                }
                              >
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(
                                    comment.ticketCommentId || comment.id
                                  )
                                }
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Delete comment"
                                disabled={editingCommentId !== null}
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="mt-2">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={!editingCommentText.trim()}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-1">
                            {comment.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state when no comments */}
            {comments.length === 0 && (
              <div className="mb-4 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm text-gray-500">No comments yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Be the first to comment
                </p>
              </div>
            )}

            {/* Add New Comment */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium flex-shrink-0">
                {formData.createdBy?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={editingCommentId !== null}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {editMode
                      ? "Add comments to this ticket"
                      : "Comments will be added after the ticket is created"}
                  </p>
                  <button
                    onClick={handleAddComment}
                    disabled={
                      !formData.comment.trim() || editingCommentId !== null
                    }
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading || uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? editMode
                  ? "Updating..."
                  : "Saving..."
                : editMode
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTicketModal;
