import React, { useEffect, useState } from "react";
import { Button, Form, Input, Radio, Rate, Popconfirm, message } from "antd";
import { ArrowLeft, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  createFeedback,
  deleteFeedbackById,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
} from "@/services/apiServices";

const DEFAULT_VALUES = {
  name: "",
  mobileno: "",
  providedServices: 0,
  satisfiedServices: 0,
  expectation: 0,
  overallExperience: 0,
  recommend: "",
  description: "",
};

const RatingRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
    <span className="text-[12px] font-medium text-slate-600">{label}</span>
    <Rate value={Number(value) || 0} disabled allowHalf={false} />
  </div>
);

const FeedbackModal = ({ open, onClose, eventId, eventFunctionId, functionName }) => {
  const [form] = Form.useForm();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getLocalUserValues = () => {
    const userId = Number(localStorage.getItem("userId") ?? 0);
    const memberId = Number(localStorage.getItem("mainId") ?? 0);
    return { userId, memberId };
  };

  const fetchFeedbacks = async () => {
    if (!open || !eventId || !eventFunctionId) return;

    setLoading(true);
    setListError("");

    try {
      const res = await getAllFeedbacks({
        eventId,
        eventFunctionId,
      });

      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
      setFeedbacks([]);
      setListError("Failed to load feedbacks.");
      message.error("Unable to load feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    setShowForm(false);
    setEditingId(null);
    fetchFeedbacks();
  }, [open, eventId, eventFunctionId]);

  const handleClose = () => {
    form.resetFields();
    setShowForm(false);
    setEditingId(null);
    setListError("");
    onClose();
  };

  const handleAddFeedback = () => {
    form.resetFields();
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditFeedback = async (feedback) => {
    setEditingId(feedback?.id ?? null);
    setShowForm(true);

    try {
      const res = await getFeedbackById(feedback.id);
      const data = res?.data?.data ?? res?.data ?? feedback;

      form.setFieldsValue({
        name: data.name ?? "",
        mobileno: data.mobileno ?? "",
        providedServices: Number(data.providedServices) || 0,
        satisfiedServices: Number(data.satisfiedServices) || 0,
        expectation: Number(data.expectation) || 0,
        overallExperience: Number(data.overallExperience) || 0,
        recommend: data.recommend ?? "",
        description: data.description ?? "",
      });
    } catch (error) {
      console.error("Failed to fetch feedback details:", error);
      message.error("Failed to load feedback details.");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      await deleteFeedbackById(feedbackId);
      message.success("Feedback deleted successfully.");
      if (editingId === feedbackId) {
        form.resetFields();
        setEditingId(null);
        setShowForm(false);
      }
      await fetchFeedbacks();
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      message.error("Failed to delete feedback.");
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    try {
      const { userId, memberId } = getLocalUserValues();
      const payload = {
        ...values,
        id: editingId ?? undefined,
        name: values.name?.trim() || "",
        mobileno: values.mobileno?.trim() || "",
        description: values.description?.trim() || "",
        eventId: Number(eventId),
        eventFunctionId: Number(eventFunctionId),
        userId,
        memberId,
      };

      if (editingId) {
        await updateFeedback(payload);
        message.success("Feedback updated successfully.");
      } else {
        await createFeedback(payload);
        message.success("Feedback added successfully.");
      }

      form.resetFields();
      setEditingId(null);
      setShowForm(false);
      await fetchFeedbacks();
    } catch (error) {
      console.error("Failed to save feedback:", error);
      message.error(
        editingId ? "Unable to update feedback." : "Unable to create feedback.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading feedback...
          </span>
        </div>
      );
    }

    if (listError) {
      return (
        <div className="flex items-center justify-center py-16 text-sm text-red-500">
          {listError}
        </div>
      );
    }

    if (!feedbacks.length) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <div className="rounded-full bg-primary/5 p-4 text-primary">
            <MessageSquare size={26} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">No feedback recorded yet.</p>
            <p className="text-[12px] text-gray-500">Add the first feedback for this function.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-slate-900">{feedback.name || "—"}</p>
                <p className="text-[12px] text-gray-500">{feedback.mobileno || "—"}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="default"
                  className="!rounded-xl !border-gray-200 !text-slate-700"
                  onClick={() => handleEditFeedback(feedback)}
                  icon={<Pencil size={14} />}
                >
                  Edit
                </Button>

                <Popconfirm
                  title="Delete this feedback?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  placement="topRight"
                  onConfirm={() => handleDeleteFeedback(feedback.id)}
                >
                  <Button
                    size="small"
                    danger
                    className="!rounded-xl"
                    icon={<Trash2 size={14} />}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RatingRow label="Provided Services" value={feedback.providedServices} />
              <RatingRow label="Satisfied Services" value={feedback.satisfiedServices} />
              <RatingRow label="Expectation" value={feedback.expectation} />
              <RatingRow label="Overall Experience" value={feedback.overallExperience} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-slate-600">
              <span className="rounded-full bg-primary/5 px-2.5 py-1 font-medium text-primary">
                Recommend: {feedback.recommend === "YES" ? "Yes" : feedback.recommend === "NO" ? "No" : "—"}
              </span>
              {feedback.memberName && (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-600">
                  Member: {feedback.memberName}
                </span>
              )}
            </div>

            {feedback.description && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-[12px] leading-6 text-slate-600">
                {feedback.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <span>Feedback{functionName ? ` - ${functionName}` : ""}</span>
        </div>
      }
      width={820}
      footer={null}
    >
      {!showForm ? (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-slate-500">Function feedback list</p>
              <p className="text-[12px] text-slate-400">
                {functionName || "Selected function"}
              </p>
            </div>

            <Button
              type="primary"
              className="!bg-primary !border-primary !rounded-xl"
              icon={<Plus size={15} />}
              onClick={handleAddFeedback}
            >
              Add Feedback
            </Button>
          </div>

          {renderList()}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              type="text"
              className="!text-slate-600 !p-0"
              icon={<ArrowLeft size={15} />}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                form.resetFields();
              }}
            >
              Back
            </Button>
            <span className="text-sm font-medium text-slate-700">
              {editingId ? "Edit feedback" : "Add feedback"}
            </span>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={DEFAULT_VALUES}
            onFinish={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input className="!rounded-xl !border-gray-200 !h-10" placeholder="Enter name" />
              </Form.Item>

              <Form.Item
                label="Mobile Number"
                name="mobileno"
                rules={[
                  { required: true, message: "Mobile number is required" },
                  {
                    pattern: /^\d{10}$/,
                    message: "Mobile number must be 10 digits",
                  },
                ]}
              >
                <Input className="!rounded-xl !border-gray-200 !h-10" placeholder="10-digit mobile number" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Provided Services"
                name="providedServices"
                rules={[
                  {
                    validator: (_, value) =>
                      value > 0 ? Promise.resolve() : Promise.reject("Please provide a rating"),
                  },
                ]}
                valuePropName="value"
              >
                <Rate allowHalf={false} />
              </Form.Item>

              <Form.Item
                label="Satisfied Services"
                name="satisfiedServices"
                rules={[
                  {
                    validator: (_, value) =>
                      value > 0 ? Promise.resolve() : Promise.reject("Please provide a rating"),
                  },
                ]}
                valuePropName="value"
              >
                <Rate allowHalf={false} />
              </Form.Item>

              <Form.Item
                label="Expectation"
                name="expectation"
                rules={[
                  {
                    validator: (_, value) =>
                      value > 0 ? Promise.resolve() : Promise.reject("Please provide a rating"),
                  },
                ]}
                valuePropName="value"
              >
                <Rate allowHalf={false} />
              </Form.Item>

              <Form.Item
                label="Overall Experience"
                name="overallExperience"
                rules={[
                  {
                    validator: (_, value) =>
                      value > 0 ? Promise.resolve() : Promise.reject("Please provide a rating"),
                  },
                ]}
                valuePropName="value"
              >
                <Rate allowHalf={false} />
              </Form.Item>
            </div>

            <Form.Item
              label="Would you recommend us?"
              name="recommend"
              rules={[{ required: true, message: "Please select an option" }]}
            >
              <Radio.Group className="mt-1">
                <Radio value="YES">Yes</Radio>
                <Radio value="NO">No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ max: 500, message: "Description must be 500 characters or less" }]}
            >
              <Input.TextArea
                rows={4}
                maxLength={500}
                showCount
                className="!rounded-xl !border-gray-200"
                placeholder="Share more details about the experience"
              />
            </Form.Item>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => {
                  form.resetFields();
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="!rounded-xl !h-10"
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="!bg-primary !border-primary !rounded-xl !h-10"
              >
                {editingId ? "Update Feedback" : "Save Feedback"}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </CustomModal>
  );
};

export default FeedbackModal;
